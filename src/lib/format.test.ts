import { describe, expect, it } from 'vitest';
import { formatClock } from './format';

describe('formatClock', () => {
  it('formata minutos e segundos com dois dígitos', () => {
    expect(formatClock(25 * 60_000)).toBe('25:00');
    expect(formatClock(5 * 60_000 + 9_000)).toBe('05:09');
  });

  it('acima de uma hora, mostra as horas sem zero à esquerda', () => {
    expect(formatClock(60 * 60_000)).toBe('1:00:00');
    expect(formatClock(65 * 60_000 + 3_000)).toBe('1:05:03');
  });

  it('arredonda para cima: só mostra 00:00 quando acabou de verdade', () => {
    // faltando 24min59.001s, o display segura o "25:00"
    expect(formatClock(24 * 60_000 + 59_001)).toBe('25:00');
    expect(formatClock(24 * 60_000 + 58_999)).toBe('24:59');
    expect(formatClock(1)).toBe('00:01');
    expect(formatClock(0)).toBe('00:00');
  });

  it('valores negativos viram 00:00 em vez de quebrar', () => {
    expect(formatClock(-5_000)).toBe('00:00');
  });
});
