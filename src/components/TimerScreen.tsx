'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useNow } from '@/hooks/useNow';
import { formatClock } from '@/lib/format';
import { MINUTE_MS, isExpired, progress, remainingMs } from '@/lib/timer';
import type { RunningTask } from '@/lib/types';
import { useTasks } from '@/state/tasks';
import styles from './TimerScreen.module.css';

const POMODORO_MINUTES = 25;

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
  const [minutes, setMinutes] = useState('25');

  const parsedMinutes = Number(minutes);
  const validMinutes =
    Number.isInteger(parsedMinutes) && parsedMinutes >= 1 && parsedMinutes <= 999;
  const canStart = name.trim().length > 0 && validMinutes;

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
        <input
          className={`${styles.field} ${styles.fieldMinutes}`}
          type="number"
          min={1}
          max={999}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          aria-label="duração em minutos"
        />{' '}
        min
      </p>

      {/* Pomodoro: só preenche o campo. Começar continua sendo um ato seu. */}
      <button
        type="button"
        className={styles.pomodoro}
        onClick={() => setMinutes(String(POMODORO_MINUTES))}
      >
        pomodoro · {POMODORO_MINUTES} min
      </button>

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
