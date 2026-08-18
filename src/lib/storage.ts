import type { Settings, Task } from './types';

/*
 * A ponte com o localStorage — o único lugar do app que fala com ele.
 *
 * A chave é versionada: se o formato dos dados mudar um dia, uma "hibi.v2"
 * pode migrar ou ignorar a antiga sem quebrar quem já usava o app.
 *
 * O princípio aqui é o parse DEFENSIVO: o que vem do storage é texto que
 * pode ter sido corrompido, editado à mão ou escrito por uma versão velha
 * do app. Nada dele é confiável; tudo passa pela validação, e o que não
 * passar é descartado em silêncio — dado ruim degrada para lista vazia,
 * nunca para tela quebrada.
 */

const STORAGE_KEY = 'hibi.v1';

/*
 * Um "type guard": função comum cujo retorno `value is Task` ensina o
 * TypeScript que, se ela devolver true, o valor É uma Task — daí para
 * frente o compilador libera os campos sem cast. É o jeito idiomático de
 * atravessar a fronteira entre o mundo sem tipos (JSON) e o tipado.
 */
function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;

  const baseOk =
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.plannedMs === 'number' &&
    Number.isFinite(t.plannedMs) &&
    typeof t.startedAt === 'number' &&
    Number.isFinite(t.startedAt);

  if (!baseOk) return false;

  switch (t.status) {
    case 'running':
    case 'completed':
      return true;
    case 'stopped':
      return typeof t.elapsedMs === 'number' && Number.isFinite(t.elapsedMs);
    default:
      return false;
  }
}

/** Texto cru do storage → só as tarefas válidas. Pura, para ser testável. */
export function parseTasks(raw: string | null): Task[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(isTask);
  } catch {
    return []; // JSON inválido: recomeça do zero
  }
}

export function loadTasks(): Task[] {
  // No servidor (SSR) não existe window; devolve vazio sem reclamar.
  if (typeof window === 'undefined') return [];
  try {
    return parseTasks(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return []; // storage bloqueado (modo privado etc.)
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage cheio ou bloqueado: o app segue funcionando só em memória
  }
}

/* --------------------------------------------------------------------------
   Ajustes — chave própria, porque mudam num ritmo diferente das tarefas.
   -------------------------------------------------------------------------- */

const SETTINGS_KEY = 'hibi.settings.v1';

/**
 * Diferente do parse de tarefas (que descarta itens inteiros), aqui a
 * validação é campo a campo: um tema inválido no JSON não derruba o
 * idioma salvo ao lado — cada campo ruim volta sozinho para o fallback.
 */
export function parseSettings(raw: string | null, fallback: Settings): Settings {
  if (!raw) return fallback;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return fallback;
    const s = data as Record<string, unknown>;

    return {
      theme:
        s.theme === 'gofun' || s.theme === 'sumi' || s.theme === 'system'
          ? s.theme
          : fallback.theme,
      language: s.language === 'pt' || s.language === 'en' ? s.language : fallback.language,
      sound: typeof s.sound === 'boolean' ? s.sound : fallback.sound,
    };
  } catch {
    return fallback;
  }
}

export function loadSettings(fallback: Settings): Settings {
  if (typeof window === 'undefined') return fallback;
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_KEY), fallback);
  } catch {
    return fallback;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // sem storage, os ajustes valem só para a sessão atual
  }
}
