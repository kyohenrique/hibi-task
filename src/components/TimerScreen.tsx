'use client';

import { Play, Square } from 'lucide-react';
import { Fragment, useState, type CSSProperties } from 'react';
import { useNow } from '@/hooks/useNow';
import { formatClock } from '@/lib/format';
import {
  MAX_MINUTES,
  MAX_NAME_LENGTH,
  MIN_MINUTES,
  MINUTE_MS,
  STEP_MINUTES,
  isValidMinutes,
  progress,
  remainingMs,
  stepMinutes,
} from '@/lib/timer';
import { primeAudio } from '@/lib/sound';
import type { RunningTask } from '@/lib/types';
import { useSettings } from '@/state/settings';
import { useTasks } from '@/state/tasks';
import styles from './TimerScreen.module.css';

/*
 * Atalhos rápidos: respiro e pausa são as pausas curta e longa do método
 * pomodoro; o pomodoro é o bloco de foco. Os rótulos são CHAVES do
 * dicionário (não texto): o texto de verdade sai de t[labelKey], no
 * idioma atual. `as const` congela o array e faz o TypeScript tratar
 * cada chave como literal — o que garante que ela existe no dicionário.
 */
const PRESETS = [
  { minutes: 5, labelKey: 'presetBreath' },
  { minutes: 15, labelKey: 'presetPause' },
  { minutes: 25, labelKey: 'presetPomodoro' },
] as const;

/* Mesma régua de ícones do app inteiro (ver Topbar). */
const icon = { size: 15, strokeWidth: 1.5, 'aria-hidden': true } as const;

/*
 * A tela do timer tem dois protagonistas que se revezam: em repouso, a
 * frase de intenção manda e o relógio é uma prévia; rodando, a intenção
 * vira um rótulo pequeno e o relógio assume. Cada modo é um componente
 * interno — o TimerScreen só decide qual deles está em cena.
 */
export function TimerScreen() {
  const { activeTask, hydrated } = useTasks();

  // Antes de o localStorage ser lido não dá para saber se há um timer
  // rodando salvo; renderizar o formulário nesse meio-tempo faria a tela
  // piscar. Um frame em branco é invisível; a troca errada não seria.
  if (!hydrated) return null;

  return activeTask ? <RunningView task={activeTask} /> : <SetupView />;
}

function SetupView() {
  const { start } = useTasks();
  const { t, settings } = useSettings();

  /*
   * "Controlled inputs": o valor de cada campo mora no estado do React e
   * o input só o exibe — a fonte da verdade é o estado, não o DOM.
   * Os minutos ficam como string (e não number) para permitir estados
   * intermediários da digitação, como o campo vazio.
   */
  const [name, setName] = useState('');
  // Começa em 0 de propósito: escolher a duração é um ato do usuário
  // (digitando, num atalho ou no stepper), não um padrão herdado.
  const [minutes, setMinutes] = useState('0');
  // O usuário já tentou começar? Antes da primeira tentativa, a tela em
  // repouso fica quieta; depois dela, as dicas de "falta algo" acendem e
  // se atualizam sozinhas conforme os campos forem preenchidos.
  const [attempted, setAttempted] = useState(false);

  const trimmedName = name.trim();
  const parsedMinutes = Number(minutes);
  const validMinutes = isValidMinutes(parsedMinutes);
  const missingName = trimmedName.length === 0;
  const canStart = !missingName && validMinutes;

  // O 0 (ou o campo vazio) é o estado de DESCANSO, não um erro: a dica de
  // limites só aparece quando o usuário digitou algo fora deles.
  const resting = minutes.trim() === '' || parsedMinutes === 0;
  const typedInvalid = !resting && !validMinutes;

  /*
   * Uma única linha de dica, uma mensagem por vez — a mais acionável.
   * A de limites tem vida própria (aparece enquanto se digita); as de
   * "falta algo" só existem depois de uma tentativa de começar.
   */
  let hint = '';
  if (attempted && missingName) {
    hint = resting ? t.hintMissingBoth : t.hintMissingName;
  } else if (typedInvalid) {
    hint = t.hintMinutesRange(MIN_MINUTES, MAX_MINUTES);
  } else if (attempted && resting) {
    hint = t.hintMissingDuration;
  }

  const previewMs = validMinutes ? parsedMinutes * MINUTE_MS : 0;

  return (
    <section className={styles.stage}>
      {/*
        Tudo que fica acima do relógio mora num bloco de altura reservada
        (ver .head no CSS): aqui são três linhas, na tela em andamento é
        só o nome da tarefa. Como o bloco mede o mesmo nos dois casos, o
        relógio não pula de lugar quando o timer começa.
      */}
      <div className={styles.head}>
        <p className={styles.intent}>
        {t.intentPrefix}{' '}
        {/* maxLength trava a digitação E a colagem no próprio navegador,
            então não existe estado inválido para validar depois. */}
        <input
          className={`${styles.field} ${styles.fieldTask}`}
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          aria-label={t.taskNameAria}
        />{' '}
        {t.intentMiddle}{' '}
        <span className={styles.minutesGroup}>
          {/*
            setMinutes recebe uma FUNÇÃO (updater) em vez do valor pronto:
            "o novo estado é este cálculo sobre o anterior". Com o valor
            direto, dois cliques rápidos leriam ambos o estado da mesma
            renderização e o segundo clique se perderia (stale closure).
          */}
          <button
            type="button"
            className={styles.stepButton}
            aria-label={t.stepDownAria(STEP_MINUTES)}
            onClick={() => setMinutes((m) => String(stepMinutes(Number(m), -1)))}
          >
            −
          </button>
          <input
            className={`${styles.field} ${styles.fieldMinutes}`}
            type="number"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            aria-label={t.minutesAria}
          />
          <button
            type="button"
            className={styles.stepButton}
            aria-label={t.stepUpAria(STEP_MINUTES)}
            onClick={() => setMinutes((m) => String(stepMinutes(Number(m), 1)))}
          >
            +
          </button>
        </span>{' '}
        {t.intentUnit}
        </p>

        {/*
          aria-live="polite": leitores de tela anunciam a dica quando ela
          surge, sem interromper o que estiverem lendo. O elemento existe
          sempre (com min-height no CSS) para o layout não pular.
        */}
        <p className={styles.hint} aria-live="polite">
          {hint}
        </p>

        {/* Atalhos: só preenchem o campo. Começar continua sendo um ato seu. */}
        <div className={styles.presets}>
        {PRESETS.map((preset, i) => (
          // Fragment com key: agrupa botão + separador sem criar nós extras
          <Fragment key={preset.minutes}>
            {i > 0 && <span aria-hidden="true">·</span>}
            <button
              type="button"
              className={styles.preset}
              onClick={() => {
                setMinutes(String(preset.minutes));
                /*
                 * O atalho também dá o nome — mas nunca por cima do que
                 * o usuário escreveu. Ele só preenche o campo vazio ou
                 * substitui um nome que veio de outro atalho, para
                 * trocar de ideia entre eles funcionar como se espera.
                 */
                setName((current) => {
                  const escrito = current.trim();
                  const veioDeAtalho = PRESETS.some(
                    (p) => t[p.labelKey] === escrito,
                  );
                  return escrito === '' || veioDeAtalho
                    ? t[preset.labelKey]
                    : current;
                });
              }}
            >
              {t[preset.labelKey]} {preset.minutes}
            </button>
          </Fragment>
        ))}
        </div>
      </div>

      <span className={`clock ${styles.clock}`}>{formatClock(previewMs)}</span>

      <div className={`stroke ${styles.stroke}`} />

      {/*
        aria-disabled em vez de disabled: o botão continua focável por
        teclado e visível a leitores de tela (que o anunciam como
        indisponível), e o clique RESPONDE — acende a dica do que falta —
        em vez de ser um beco sem saída mudo. `disabled` de verdade
        removeria o botão da navegação e engoliria o clique.
      */}
      <button
        type="button"
        className={styles.action}
        aria-disabled={!canStart}
        onClick={() => {
          if (!canStart) {
            setAttempted(true);
            return;
          }
          // O clique de começar é o gesto que "acorda" o áudio: sem isso,
          // a política de autoplay silenciaria o rin lá no fim do timer.
          if (settings.sound) primeAudio();
          start(trimmedName, parsedMinutes * MINUTE_MS);
        }}
      >
        <Play {...icon} />
        {t.start}
      </button>
    </section>
  );
}

function RunningView({ task }: { task: RunningTask }) {
  const { stop } = useTasks();
  const { t } = useSettings();
  const now = useNow();

  // A conclusão automática NÃO mora aqui: ela vale para o app inteiro
  // (inclusive com o usuário no histórico), então vive no TimerEffects,
  // montado no layout. Esta view só exibe.
  return (
    <section className={styles.stage}>
      {/* Mesmo bloco reservado da tela de repouso — ver .head no CSS. */}
      <div className={styles.head}>
        <span className={`eyebrow ${styles.taskName}`}>{task.name}</span>
      </div>

      <span className={`clock ${styles.clock}`}>
        {formatClock(remainingMs(task, now))}
      </span>

      {/*
        A variável CSS --progress é definida inline e consumida pelo
        .stroke do tokens.css. O cast é necessário porque o tipo
        CSSProperties não conhece propriedades customizadas.
      */}
      <div
        className={`stroke ${styles.stroke}`}
        style={{ '--progress': progress(task, now) } as CSSProperties}
      />

      <button type="button" className={`${styles.action} ${styles.actionStop}`} onClick={stop}>
        <Square {...icon} />
        {t.stop}
      </button>
    </section>
  );
}
