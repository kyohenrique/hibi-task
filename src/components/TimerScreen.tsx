'use client';

import { Fragment, useEffect, useState, type CSSProperties } from 'react';
import { useNow } from '@/hooks/useNow';
import { formatClock } from '@/lib/format';
import {
  MAX_MINUTES,
  MIN_MINUTES,
  MINUTE_MS,
  STEP_MINUTES,
  isExpired,
  isValidMinutes,
  progress,
  remainingMs,
  stepMinutes,
} from '@/lib/timer';
import type { RunningTask } from '@/lib/types';
import { useTasks } from '@/state/tasks';
import styles from './TimerScreen.module.css';

/*
 * Atalhos rápidos: respiro e pausa são as pausas curta e longa do método
 * pomodoro; o pomodoro é o bloco de foco. `as const` congela o array e
 * faz o TypeScript tratar cada valor como literal, não como number/string
 * genéricos.
 */
const PRESETS = [
  { label: 'respiro', minutes: 5 },
  { label: 'pausa', minutes: 15 },
  { label: 'pomodoro', minutes: 25 },
] as const;

/*
 * A tela do timer tem dois protagonistas que se revezam: em repouso, a
 * frase de intenção manda e o relógio é uma prévia; rodando, a intenção
 * vira um rótulo pequeno e o relógio assume. Cada modo é um componente
 * interno — o TimerScreen só decide qual deles está em cena.
 */
export function TimerScreen() {
  const { activeTask } = useTasks();

  return activeTask ? <RunningView task={activeTask} /> : <SetupView />;
}

function SetupView() {
  const { start } = useTasks();

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

  const parsedMinutes = Number(minutes);
  const validMinutes = isValidMinutes(parsedMinutes);
  const canStart = name.trim().length > 0 && validMinutes;

  // O 0 (ou o campo vazio) é o estado de DESCANSO, não um erro: a dica de
  // validação só aparece quando o usuário digitou algo fora dos limites.
  const resting = minutes.trim() === '' || parsedMinutes === 0;
  const showHint = !resting && !validMinutes;

  const previewMs = validMinutes ? parsedMinutes * MINUTE_MS : 0;

  return (
    <section className={styles.stage}>
      <p className={styles.intent}>
        vou trabalhar em{' '}
        <input
          className={`${styles.field} ${styles.fieldTask}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="nome da tarefa"
        />{' '}
        por{' '}
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
            aria-label={`diminuir ${STEP_MINUTES} minutos`}
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
            aria-label="duração em minutos"
          />
          <button
            type="button"
            className={styles.stepButton}
            aria-label={`aumentar ${STEP_MINUTES} minutos`}
            onClick={() => setMinutes((m) => String(stepMinutes(Number(m), 1)))}
          >
            +
          </button>
        </span>{' '}
        min
      </p>

      {/*
        aria-live="polite": leitores de tela anunciam a dica quando ela
        surge, sem interromper o que estiverem lendo. O elemento existe
        sempre (com min-height no CSS) para o layout não pular.
      */}
      <p className={styles.hint} aria-live="polite">
        {showHint
          ? `use um valor inteiro entre ${MIN_MINUTES} e ${MAX_MINUTES} minutos`
          : ''}
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
              onClick={() => setMinutes(String(preset.minutes))}
            >
              {preset.label} {preset.minutes}
            </button>
          </Fragment>
        ))}
      </div>

      <span className={`clock ${styles.clock}`}>{formatClock(previewMs)}</span>

      <div className={`stroke ${styles.stroke}`} />

      <button
        type="button"
        className={styles.action}
        disabled={!canStart}
        onClick={() => start(name.trim(), parsedMinutes * MINUTE_MS)}
      >
        começar
      </button>
    </section>
  );
}

function RunningView({ task }: { task: RunningTask }) {
  const { stop, complete } = useTasks();
  const now = useNow();

  /*
   * O efeito-vigia da conclusão: a cada tick o componente re-renderiza
   * com um `now` novo e este efeito reavalia se o tempo acabou. Marcar a
   * conclusão é um "efeito colateral" da renderização — mudar estado no
   * meio do render é proibido no React, e é para isso que useEffect existe.
   */
  useEffect(() => {
    if (isExpired(task, now)) complete();
  }, [task, now, complete]);

  return (
    <section className={styles.stage}>
      <span className={`eyebrow ${styles.taskName}`}>{task.name}</span>

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
        interromper
      </button>
    </section>
  );
}
