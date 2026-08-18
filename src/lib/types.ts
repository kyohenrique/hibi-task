import type { Language } from './i18n';

/*
 * O tipo central do app: Task.
 *
 * É uma "discriminated union" (união discriminada): três formas possíveis
 * que compartilham o campo `status` como discriminante. Quando o código
 * verifica `task.status === 'stopped'`, o TypeScript "estreita" o tipo
 * dentro daquele bloco e libera o acesso a `elapsedMs` — que só existe
 * nessa forma. O ganho prático: estados ilegais (uma concluída carregando
 * `elapsedMs`, por exemplo) nem compilam, e todo `switch` sobre o status
 * é obrigado pelo compilador a tratar os três casos.
 */

interface TaskBase {
  id: string;
  /** A intenção escrita pelo usuário ("ajustar o design system"). */
  name: string;
  /** Duração escolhida, em milissegundos. */
  plannedMs: number;
  /** Momento do início (Date.now()). Todo o resto é derivado dele. */
  startedAt: number;
}

/** Em andamento — no máximo uma por vez no app inteiro. */
export interface RunningTask extends TaskBase {
  status: 'running';
}

/** Interrompida pelo usuário antes do fim. */
export interface StoppedTask extends TaskBase {
  status: 'stopped';
  /** Quanto foi cumprido até a interrupção, em milissegundos. */
  elapsedMs: number;
}

/** Concluída — o tempo planejado foi até o fim. */
export interface CompletedTask extends TaskBase {
  status: 'completed';
}

export type Task = RunningTask | StoppedTask | CompletedTask;

/** 'running' | 'stopped' | 'completed', extraído do próprio Task. */
export type TaskStatus = Task['status'];

/** Os dois temas têm nome próprio; 'system' segue o sistema operacional. */
export type ThemeSetting = 'gofun' | 'sumi' | 'system';

export interface Settings {
  theme: ThemeSetting;
  language: Language;
  /** O rin ao fim do timer (o som em si chega na etapa das notificações). */
  sound: boolean;
}
