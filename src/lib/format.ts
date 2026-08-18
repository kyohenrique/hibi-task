/*
 * Formatação de tempo para exibição. Funções puras: recebem ms, devolvem
 * string, sem saber nada de tarefas ou de React.
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
