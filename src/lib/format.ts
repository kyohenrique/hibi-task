import { dictionaries, type Language } from './i18n';
import { MINUTE_MS } from './timer';

/*
 * Formatação de tempo para exibição. Funções puras: recebem ms (e, quando
 * o texto muda por idioma, o Language), devolvem string — nada de React.
 */

/**
 * Formata ms como relógio: "25:00", "05:09" e, acima de uma hora,
 * "1:05:00".
 *
 * O arredondamento é para CIMA (Math.ceil): com 24min59.2s restantes o
 * relógio mostra "25:00", e só chega a "00:00" quando o tempo realmente
 * acabou. Com Math.floor, o display pularia para "24:59" logo no primeiro
 * tick e mostraria "00:00" faltando quase um segundo.
 */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Duração legível para o histórico: "25 min", "1 h", "1 h 30 min".
 * Arredonda para o minuto mais próximo; abaixo disso, "menos de 1 min"
 * — melhor do que exibir um seco "0 min" para quem interrompeu cedo.
 */
export function formatDuration(ms: number, language: Language): string {
  const totalMinutes = Math.round(Math.max(0, ms) / MINUTE_MS);
  if (totalMinutes < 1) return dictionaries[language].lessThanMinute;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

/*
 * Meses abreviados à mão (no dicionário) em vez de Intl.DateTimeFormat:
 * o formato fica exatamente como o design quer, sem "de" nem ponto.
 * A ordem dia/mês segue a convenção de cada idioma.
 */

/** Data de criação para o histórico: "17 ago · 14:32" / "aug 17 · 14:32". */
export function formatDate(timestamp: number, language: Language): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');

  const month = dictionaries[language].months[d.getMonth()];
  const dayMonth =
    language === 'pt' ? `${d.getDate()} ${month}` : `${month} ${d.getDate()}`;

  return `${dayMonth} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
