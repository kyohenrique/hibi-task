'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { detectLanguage, dictionaries, type Dictionary, type Language } from '@/lib/i18n';
import { loadSettings, saveSettings } from '@/lib/storage';
import type { Settings, ThemeSetting } from '@/lib/types';

/*
 * O segundo provider do app, no mesmo desenho do de tarefas: reducer,
 * hidratação em efeito e persistência em efeito. Separado do de tarefas
 * porque mudam em ritmos diferentes — tarefas mexem a cada segundo com o
 * timer rodando; ajustes, quase nunca. Juntos, todo tick re-renderizaria
 * também quem só lê o idioma.
 */

interface SettingsState {
  settings: Settings;
  hydrated: boolean;
}

type SettingsAction =
  | { type: 'hydrate'; settings: Settings }
  | { type: 'patch'; patch: Partial<Settings> };

/*
 * O idioma detectado do navegador entra como fallback só na hidratação
 * (dentro do efeito): antes dela, o servidor e o primeiro render usam o
 * mesmo default fixo — a regra de sempre contra o hydration mismatch.
 */
const DEFAULTS: Settings = { theme: 'system', language: 'pt', sound: true };

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'hydrate':
      return { settings: action.settings, hydrated: true };
    case 'patch':
      // Partial<Settings> permite trocar um campo sem repetir os outros.
      return { ...state, settings: { ...state.settings, ...action.patch } };
  }
}

interface SettingsContextValue {
  settings: Settings;
  hydrated: boolean;
  /** O dicionário do idioma atual — `t.start`, `t.historyEmpty`, etc. */
  t: Dictionary;
  setTheme: (theme: ThemeSetting) => void;
  setLanguage: (language: Language) => void;
  toggleSound: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, {
    settings: DEFAULTS,
    hydrated: false,
  });

  useEffect(() => {
    dispatch({
      type: 'hydrate',
      settings: loadSettings({ ...DEFAULTS, language: detectLanguage() }),
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    saveSettings(state.settings);
  }, [state.hydrated, state.settings]);

  /*
   * Aplica o tema no <html>. Antes da hidratação quem manda é o script
   * inline do layout (que já leu o storage); depois, este efeito assume.
   * No modo 'system', escuta o matchMedia: trocar o tema do SO com o app
   * aberto troca o app junto, em tempo real.
   */
  useEffect(() => {
    if (!state.hydrated) return;
    const root = document.documentElement;

    if (state.settings.theme !== 'system') {
      root.dataset.theme = state.settings.theme;
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      root.dataset.theme = mq.matches ? 'sumi' : 'gofun';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [state.hydrated, state.settings.theme]);

  // O atributo lang do <html> acompanha o idioma — leitores de tela e o
  // corretor do navegador dependem dele.
  useEffect(() => {
    if (!state.hydrated) return;
    document.documentElement.lang =
      state.settings.language === 'pt' ? 'pt-BR' : 'en';
  }, [state.hydrated, state.settings.language]);

  const value: SettingsContextValue = {
    settings: state.settings,
    hydrated: state.hydrated,
    t: dictionaries[state.settings.language],
    setTheme: (theme) => dispatch({ type: 'patch', patch: { theme } }),
    setLanguage: (language) => dispatch({ type: 'patch', patch: { language } }),
    toggleSound: () =>
      dispatch({ type: 'patch', patch: { sound: !state.settings.sound } }),
  };

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

/** Acesso aos ajustes e ao dicionário. Só funciona sob um <SettingsProvider>. */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings precisa estar dentro de <SettingsProvider>');
  return ctx;
}
