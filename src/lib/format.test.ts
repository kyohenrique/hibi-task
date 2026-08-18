import { describe, expect, it } from 'vitest';
import { formatClock, formatDate, formatDuration } from './format';

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

describe('formatDuration', () => {
  it('minutos puros, horas cheias e horas quebradas', () => {
    expect(formatDuration(25 * 60_000, 'pt')).toBe('25 min');
    expect(formatDuration(60 * 60_000, 'pt')).toBe('1 h');
    expect(formatDuration(90 * 60_000, 'pt')).toBe('1 h 30 min');
  });

  it('arredonda para o minuto mais próximo', () => {
    expect(formatDuration(10 * 60_000 + 20_000, 'pt')).toBe('10 min');
    expect(formatDuration(10 * 60_000 + 40_000, 'pt')).toBe('11 min');
  });

  it('abaixo de meio minuto, o texto segue o idioma', () => {
    expect(formatDuration(20_000, 'pt')).toBe('menos de 1 min');
    expect(formatDuration(20_000, 'en')).toBe('less than 1 min');
  });
});

describe('formatDate', () => {
  // new Date(ano, mêsIndexado, dia, ...) usa o fuso local — determinístico
  // para o teste porque a formatação também lê o fuso local.
  const ts = new Date(2026, 7, 17, 14, 5).getTime();

  it('pt: "dia mês · hh:mm"', () => {
    expect(formatDate(ts, 'pt')).toBe('17 ago · 14:05');
  });

  it('en: "mês dia · hh:mm"', () => {
    expect(formatDate(ts, 'en')).toBe('aug 17 · 14:05');
  });
});
