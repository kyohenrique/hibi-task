import type { CompletedTask, RunningTask, StoppedTask, Task } from './types';

/*
 * A regra de ouro do timer: ele CALCULA, não conta.
 *
 * Nada aqui guarda "tempo restante". Uma tarefa sabe apenas quando começou
 * (`startedAt`) e quanto deveria durar (`plannedMs`); todo o resto é
 * derivado do relógio de quem pergunta — o parâmetro `now`. Isso torna o
 * timer imune a F5, troca de página e abas em segundo plano, e torna estas
 * funções puras: mesmo input, mesmo output, fáceis de testar sem React.
 *
 * `now` é sempre um parâmetro (em vez de chamar Date.now() aqui dentro)
 * exatamente por isso — nos testes, o "agora" é um número qualquer.
 */

/** Um minuto em milissegundos — a unidade que a UI usa para criar tarefas. */
export const MINUTE_MS = 60_000;

/*
 * Limites de produto para a duração, em minutos. O teto de 3 horas é uma
 * decisão de produto, não técnica: o app cronometra sessões de foco, não
 * turnos de trabalho. Vivem aqui (e não na UI) para haver UMA fonte da
 * verdade — o formulário e a validação apenas leem.
 */
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 180;

/** A duração digitada é utilizável? Inteiro entre MIN e MAX. */
export function isValidMinutes(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= MIN_MINUTES &&
    minutes <= MAX_MINUTES
  );
}

/** O passo do stepper de minutos da UI. */
export const STEP_MINUTES = 5;

/**
 * Próximo valor do stepper: anda na grade de 5 em 5 e, se o valor atual
 * está fora dela (o usuário digitou 7), "imanta" para o múltiplo mais
 * próximo na direção do movimento — subir de 7 vai a 10, descer vai a 5.
 * De quebra, isso conserta valores digitados fora dos limites.
 *
 * O resultado fica entre 0 e MAX_MINUTES: o 0 é permitido de propósito,
 * por ser o estado de descanso do campo (não dá para iniciar com ele,
 * mas dá para voltar até ele).
 */
export function stepMinutes(current: number, direction: 1 | -1): number {
  const base = Number.isFinite(current) ? current : 0;

  // floor/ceil escolhidos por direção fazem o alinhamento à grade:
  // subir de um valor já alinhado soma um passo inteiro (5 → 10);
  // subir de um quebrado apenas completa o passo em curso (7 → 10).
  const stepped =
    direction === 1
      ? (Math.floor(base / STEP_MINUTES) + 1) * STEP_MINUTES
      : (Math.ceil(base / STEP_MINUTES) - 1) * STEP_MINUTES;

  return clamp(stepped, 0, MAX_MINUTES);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Quanto da tarefa já foi cumprido, em ms — nunca além do planejado. */
export function elapsedMs(task: Task, now: number): number {
  switch (task.status) {
    case 'running':
      return clamp(now - task.startedAt, 0, task.plannedMs);
    case 'stopped':
      return task.elapsedMs;
    case 'completed':
      return task.plannedMs;
  }
}

/** Quanto falta, em ms. Zero para concluídas e para o tempo esgotado. */
export function remainingMs(task: Task, now: number): number {
  return task.plannedMs - elapsedMs(task, now);
}

/** Fração cumprida, de 0 a 1 — alimenta o traço de progresso. */
export function progress(task: Task, now: number): number {
  if (task.plannedMs <= 0) return 1;
  return elapsedMs(task, now) / task.plannedMs;
}

/** O tempo planejado já passou por inteiro? */
export function isExpired(task: RunningTask, now: number): boolean {
  return now - task.startedAt >= task.plannedMs;
}

/** Transição running → stopped, registrando até onde a tarefa foi. */
export function stopTask(task: RunningTask, now: number): StoppedTask {
  return {
    ...task,
    status: 'stopped',
    elapsedMs: clamp(now - task.startedAt, 0, task.plannedMs),
  };
}

/** Transição running → completed. */
export function completeTask(task: RunningTask): CompletedTask {
  return { ...task, status: 'completed' };
}
