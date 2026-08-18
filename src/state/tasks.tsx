'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { loadTasks, saveTasks } from '@/lib/storage';
import { completeTask, reconcileTasks, stopTask } from '@/lib/timer';
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
 */

interface TasksState {
  /** Mais recente primeiro. No máximo uma com status 'running'. */
  tasks: Task[];
  /**
   * O localStorage já foi lido? Antes disso, o estado é um vazio
   * provisório e não deve ser mostrado nem salvo por cima do real.
   */
  hydrated: boolean;
}

type TasksAction =
  | { type: 'hydrate'; tasks: Task[] }
  | { type: 'start'; task: RunningTask }
  | { type: 'stop'; now: number }
  | { type: 'complete' }
  | { type: 'remove'; id: string };

/*
 * O reducer precisa ser uma função pura — mesmo estado + mesma ação ⇒
 * mesmo resultado. Por isso `Date.now()` e `crypto.randomUUID()` são
 * chamados FORA daqui (no momento do dispatch) e chegam prontos dentro da
 * ação: em desenvolvimento o React executa o reducer duas vezes de
 * propósito (StrictMode) para denunciar impurezas exatamente como essas.
 */
function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case 'hydrate':
      return { tasks: action.tasks, hydrated: true };
    case 'start': {
      // Guarda da regra "no máximo um timer": ignora se já há um rodando.
      if (state.tasks.some((t) => t.status === 'running')) return state;
      return { ...state, tasks: [action.task, ...state.tasks] };
    }
    case 'stop':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.status === 'running' ? stopTask(t, action.now) : t,
        ),
      };
    case 'complete':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.status === 'running' ? completeTask(t) : t,
        ),
      };
    case 'remove':
      return {
        ...state,
        // A guarda extra `status !== 'running'` protege a regra de que a
        // tarefa em andamento não é excluível, mesmo que a UI falhe.
        tasks: state.tasks.filter(
          (t) => t.id !== action.id || t.status === 'running',
        ),
      };
  }
}

interface TasksContextValue {
  tasks: Task[];
  /** O estado já foi carregado do localStorage? */
  hydrated: boolean;
  /** A tarefa rodando agora, se houver. */
  activeTask: RunningTask | undefined;
  start: (name: string, plannedMs: number) => void;
  stop: () => void;
  complete: () => void;
  remove: (id: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, {
    tasks: [],
    hydrated: false,
  });

  /*
   * Hidratação: o servidor renderiza sem acesso ao localStorage, então o
   * primeiro render do navegador PRECISA ser igual ao dele (vazio) — ler
   * o storage durante o render causaria o "hydration mismatch" do Next.
   * useEffect roda só depois desse primeiro render, no navegador: é o
   * lugar certo para trazer o mundo externo para dentro do React.
   * A reconciliação aproveita a passagem: timer que venceu com a aba
   * fechada entra já como concluído.
   */
  useEffect(() => {
    dispatch({ type: 'hydrate', tasks: reconcileTasks(loadTasks(), Date.now()) });
  }, []);

  /*
   * Persistência: toda mudança real de tarefas vai para o storage. O
   * guard de hydrated impede a gravação do vazio provisório do primeiro
   * render por cima dos dados reais ainda não carregados.
   */
  useEffect(() => {
    if (!state.hydrated) return;
    saveTasks(state.tasks);
  }, [state.hydrated, state.tasks]);

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
    hydrated: state.hydrated,
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
    remove: (id) => dispatch({ type: 'remove', id }),
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
