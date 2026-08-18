/*
 * i18n sem biblioteca — um dicionário TypeScript por idioma.
 *
 * O truque que segura tudo: `pt` é a fonte da verdade e o TIPO dele
 * (typeof pt) vira o contrato. `en` é declarado com esse tipo, então uma
 * chave faltando, sobrando ou com assinatura diferente em inglês é erro
 * de compilação — a tradução nunca fica dessincronizada em silêncio.
 *
 * Mensagens que carregam números ou nomes são FUNÇÕES no dicionário
 * (ex.: hintMinutesRange), tipadas como qualquer outra chave. É a versão
 * simples da "interpolação" das bibliotecas de i18n.
 */

export type Language = 'pt' | 'en';

/*
 * Nomes dos idiomas no seletor: cada um escrito no próprio idioma, por
 * isso ficam fora dos dicionários — não se traduz o nome de um idioma
 * para quem ainda não trocou para ele.
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  pt: 'português',
  en: 'english',
};

const pt = {
  // navegação
  navTimer: 'timer',
  navHistory: 'histórico',
  navSettings: 'ajustes',

  // tela do timer — a frase de intenção
  intentPrefix: 'vou trabalhar em',
  intentMiddle: 'por',
  intentUnit: 'min',
  taskNameAria: 'nome da tarefa',
  minutesAria: 'duração em minutos',
  stepDownAria: (step: number) => `diminuir ${step} minutos`,
  stepUpAria: (step: number) => `aumentar ${step} minutos`,

  // atalhos rápidos
  presetBreath: 'respiro',
  presetPause: 'pausa',
  presetPomodoro: 'pomodoro',

  // ações
  start: 'começar',
  stop: 'interromper',

  // dicas do formulário
  hintMissingBoth: 'dê um nome à tarefa e escolha a duração',
  hintMissingName: 'dê um nome à tarefa para começar',
  hintMissingDuration: 'escolha a duração para começar',
  hintMinutesRange: (min: number, max: number) =>
    `use um valor inteiro entre ${min} e ${max} minutos`,

  // histórico
  historyTitle: 'histórico',
  historyEmpty: 'nenhuma tarefa ainda',
  statusRunning: 'em andamento',
  statusStopped: 'interrompida',
  statusCompleted: 'concluída',
  durationOf: 'de', // "10 min de 25 min"
  deleteAria: (name: string) => `excluir "${name}"`,
  confirm: 'confirmar?',

  // ajustes
  settingsTitle: 'ajustes',
  closeAria: 'fechar ajustes',
  themeLabel: 'tema',
  themeSystem: 'sistema',
  languageLabel: 'idioma',
  soundLabel: 'som',
  soundOn: 'ligado',
  soundOff: 'desligado',
  notifyLabel: 'notificação',
  clearHistory: 'limpar histórico',

  // notificação do navegador
  notificationDone: (name: string) => `"${name}" concluída`,

  // durações e datas
  lessThanMinute: 'menos de 1 min',
  months: [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
  ],
};

/** O contrato que todo idioma precisa cumprir. */
export type Dictionary = typeof pt;

const en: Dictionary = {
  navTimer: 'timer',
  navHistory: 'history',
  navSettings: 'settings',

  intentPrefix: 'i will work on',
  intentMiddle: 'for',
  intentUnit: 'min',
  taskNameAria: 'task name',
  minutesAria: 'duration in minutes',
  stepDownAria: (step) => `decrease ${step} minutes`,
  stepUpAria: (step) => `increase ${step} minutes`,

  presetBreath: 'breath',
  presetPause: 'break',
  presetPomodoro: 'pomodoro',

  start: 'start',
  stop: 'stop',

  hintMissingBoth: 'name your task and choose a duration',
  hintMissingName: 'name your task to start',
  hintMissingDuration: 'choose a duration to start',
  hintMinutesRange: (min, max) =>
    `use a whole number between ${min} and ${max} minutes`,

  historyTitle: 'history',
  historyEmpty: 'no tasks yet',
  statusRunning: 'in progress',
  statusStopped: 'stopped',
  statusCompleted: 'completed',
  durationOf: 'of',
  deleteAria: (name) => `delete "${name}"`,
  confirm: 'confirm?',

  settingsTitle: 'settings',
  closeAria: 'close settings',
  themeLabel: 'theme',
  themeSystem: 'system',
  languageLabel: 'language',
  soundLabel: 'sound',
  soundOn: 'on',
  soundOff: 'off',
  notifyLabel: 'notification',
  clearHistory: 'clear history',

  notificationDone: (name) => `"${name}" completed`,

  lessThanMinute: 'less than 1 min',
  months: [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ],
};

export const dictionaries: Record<Language, Dictionary> = { pt, en };

/** Idioma inicial: o do navegador, com pt para qualquer variante de português. */
export function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return 'pt';
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}
