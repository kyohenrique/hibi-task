'use client';

import { useEffect, useState } from 'react';
import { useNow } from '@/hooks/useNow';
import { formatClock, formatDate, formatDuration } from '@/lib/format';
import { elapsedMs } from '@/lib/timer';
import type { Task, TaskStatus } from '@/lib/types';
import { useTasks } from '@/state/tasks';
import styles from './HistoryList.module.css';

/** Quanto tempo o "confirmar?" da exclusão espera antes de desistir. */
const CONFIRM_TIMEOUT_MS = 3_000;

const STATUS_LABELS: Record<TaskStatus, string> = {
  running: 'em andamento',
  stopped: 'interrompida',
  completed: 'concluída',
};

/*
 * A duração exibida depende do status — e o switch sobre a discriminated
 * union obriga a tratar os três casos (regra definida no planejamento):
 * concluída mostra o que cumpriu; interrompida, até onde foi do quanto
 * pretendia; em andamento, o decorrido ao vivo sobre o planejado.
 */
function durationLabel(task: Task, now: number): string {
  switch (task.status) {
    case 'running':
      return `${formatClock(elapsedMs(task, now))} / ${formatClock(task.plannedMs)}`;
    case 'stopped':
      return `${formatDuration(task.elapsedMs)} de ${formatDuration(task.plannedMs)}`;
    case 'completed':
      return formatDuration(task.plannedMs);
  }
}

export function HistoryList() {
  const { tasks, hydrated } = useTasks();

  // O tick só roda se houver tarefa em andamento na lista — em repouso,
  // o histórico é uma página estática.
  const hasRunning = tasks.some((t) => t.status === 'running');
  const now = useNow(hasRunning);

  if (!hydrated) return null;

  return (
    <section className={styles.stage}>
      <span className="eyebrow">histórico</span>

      {tasks.length === 0 ? (
        <p className={styles.empty}>nenhuma tarefa ainda</p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => (
            <HistoryItem key={task.id} task={task} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}

function HistoryItem({ task, now }: { task: Task; now: number }) {
  const { remove } = useTasks();

  /*
   * Exclusão em dois cliques, sem modal: o primeiro troca a lixeira por
   * um "confirmar?" que expira sozinho. O estado vive em CADA item (cada
   * um tem o seu), e o efeito com cleanup garante que trocar de ideia ou
   * desmontar o item não deixe timeout órfão.
   */
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [confirming]);

  return (
    <li className={styles.item}>
      <span className="dot" data-status={task.status} aria-hidden="true" />

      <div className={styles.info}>
        <span className={styles.name}>{task.name}</span>
        <span className={styles.meta}>
          {STATUS_LABELS[task.status]} · {formatDate(task.startedAt)}
        </span>
      </div>

      <span className={styles.duration}>{durationLabel(task, now)}</span>

      {/* A tarefa em andamento não é excluível — a ação dela é interromper. */}
      {task.status !== 'running' &&
        (confirming ? (
          <button
            type="button"
            className={styles.confirm}
            onClick={() => remove(task.id)}
          >
            confirmar?
          </button>
        ) : (
          <button
            type="button"
            className={styles.trash}
            aria-label={`excluir "${task.name}"`}
            onClick={() => setConfirming(true)}
          >
            <TrashIcon />
          </button>
        ))}
    </li>
  );
}

/* Lixeira em traço fino, desenhada à mão — sem biblioteca de ícones. */
function TrashIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M2.5 4h11M6.5 4V2.5h3V4M4.2 4l.7 9.5h6.2l.7-9.5M6.6 6.8v4.4M9.4 6.8v4.4" />
    </svg>
  );
}
