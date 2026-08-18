'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { completeTask, stopTask } from '@/lib/timer';
import type { RunningTask, Task } from '@/lib/types';

/*
 * Estado global das tarefas: Context + useReducer.
 *
 * useReducer concentra TODAS as mudanças de estado num único lugar (o
 * reducer), em vez de espalhar setState pela UI. Os componentes apenas
 * descrevem o que aconteceu ("start", "stop") e o reducer decide o novo
 * estado — sempre criando um estado novo, nunca mutando o anterior, que é
 * como o React detecta mudanças.
 *
 * O Context existe porque tanto a tela do timer quanto o histórico (e o
 * document.title, adiante) precisam das mesmas tarefas; sem ele, seria
 * preciso passar props através de todas as camadas ("prop drilling").
 *
 * Nesta etapa o estado vive só em memória — F5 zera tudo. A persistência
 * em localStorage chega na etapa 3.
 */

interface TasksState {
  /** Mais recente primeiro. No máximo uma com status 'running'. */
  tasks: Task[];
}

type TasksAction =
  | { type: 'start'; task: RunningTask }
  | { type: 'stop'; now: number }
  | { type: 'complete' };

/*
 * O reducer precisa ser uma função pura — mesmo estado + mesma ação ⇒
 * mesmo resultado. Por isso `Date.now()` e `crypto.randomUUID()` são
 * chamados FORA daqui (no momento do dispatch) e chegam prontos dentro da
 * ação: em desenvolvimento o React executa o reducer duas vezes de
 * propósito (StrictMode) para denunciar impurezas exatamente como essas.
 */
function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case 'start': {
      // Guarda da regra "no máximo um timer": ignora se já há um rodando.
      if (state.tasks.some((t) => t.status === 'running')) return state;
      return { tasks: [action.task, ...state.tasks] };
    }
    case 'stop':
      return {
        tasks: state.tasks.map((t) =>
          t.status === 'running' ? stopTask(t, action.now) : t,
        ),
      };
    case 'complete':
      return {
        tasks: state.tasks.map((t) =>
          t.status === 'running' ? completeTask(t) : t,
        ),
      };
  }
}

interface TasksContextValue {
  tasks: Task[];
  /** A tarefa rodando agora, se houver. */
  activeTask: RunningTask | undefined;
  start: (name: string, plannedMs: number) => void;
  stop: () => void;
  complete: () => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, { tasks: [] });

  /*
   * O predicado `t.status === 'running'` não estreita o tipo sozinho num
   * .find(); a assinatura com `t is RunningTask` (type predicate) ensina
   * o TypeScript que o que sair daqui é uma RunningTask.
   */
  const activeTask = state.tasks.find(
    (t): t is RunningTask => t.status === 'running',
  );

  const value: TasksContextValue = {
    tasks: state.tasks,
    activeTask,
    start: (name, plannedMs) =>
      dispatch({
        type: 'start',
        task: {
          id: crypto.randomUUID(),
          name,
          plannedMs,
          startedAt: Date.now(),
          status: 'running',
        },
      }),
    stop: () => dispatch({ type: 'stop', now: Date.now() }),
    complete: () => dispatch({ type: 'complete' }),
  };

  // React 19 permite usar o próprio Context como provider,
  // sem o antigo <TasksContext.Provider>.
  return <TasksContext value={value}>{children}</TasksContext>;
}

/** Acesso ao estado de tarefas. Só funciona sob um <TasksProvider>. */
export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks precisa estar dentro de <TasksProvider>');
  return ctx;
}
