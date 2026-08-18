import { describe, expect, it } from 'vitest';
import {
  MAX_MINUTES,
  MINUTE_MS,
  completeTask,
  elapsedMs,
  isExpired,
  isValidMinutes,
  progress,
  remainingMs,
  stepMinutes,
  stopTask,
} from './timer';
import type { CompletedTask, RunningTask, StoppedTask } from './types';

/*
 * Os testes fixam um "agora" arbitrário em vez de usar Date.now() — é o
 * ganho de `now` ser parâmetro: o tempo vira um número controlado.
 */

const START = 1_000_000;

const running: RunningTask = {
  id: 'a',
  name: 'estudar typescript',
  plannedMs: 25 * MINUTE_MS,
  startedAt: START,
  status: 'running',
};

describe('elapsedMs / remainingMs / progress', () => {
  it('rodando no meio do caminho: 10 de 25 minutos', () => {
    const now = START + 10 * MINUTE_MS;
    expect(elapsedMs(running, now)).toBe(10 * MINUTE_MS);
    expect(remainingMs(running, now)).toBe(15 * MINUTE_MS);
    expect(progress(running, now)).toBeCloseTo(10 / 25);
  });

  it('nunca passa do planejado, mesmo com o agora muito além do fim', () => {
    const now = START + 60 * MINUTE_MS;
    expect(elapsedMs(running, now)).toBe(25 * MINUTE_MS);
    expect(remainingMs(running, now)).toBe(0);
    expect(progress(running, now)).toBe(1);
  });

  it('nunca fica negativo, mesmo com o agora antes do início', () => {
    const now = START - MINUTE_MS;
    expect(elapsedMs(running, now)).toBe(0);
    expect(progress(running, now)).toBe(0);
  });

  it('interrompida: usa o elapsedMs registrado, ignora o agora', () => {
    const stopped: StoppedTask = {
      ...running,
      status: 'stopped',
      elapsedMs: 10 * MINUTE_MS,
    };
    const now = START + 999 * MINUTE_MS;
    expect(elapsedMs(stopped, now)).toBe(10 * MINUTE_MS);
    expect(remainingMs(stopped, now)).toBe(15 * MINUTE_MS);
  });

  it('concluída: cumpriu tudo, não falta nada', () => {
    const completed: CompletedTask = { ...running, status: 'completed' };
    expect(elapsedMs(completed, START)).toBe(25 * MINUTE_MS);
    expect(remainingMs(completed, START)).toBe(0);
    expect(progress(completed, START)).toBe(1);
  });
});

describe('isExpired', () => {
  it('falso um instante antes do fim, verdadeiro exatamente no fim', () => {
    expect(isExpired(running, START + 25 * MINUTE_MS - 1)).toBe(false);
    expect(isExpired(running, START + 25 * MINUTE_MS)).toBe(true);
  });
});

describe('isValidMinutes', () => {
  it('aceita inteiros dentro dos limites de produto', () => {
    expect(isValidMinutes(1)).toBe(true);
    expect(isValidMinutes(25)).toBe(true);
    expect(isValidMinutes(MAX_MINUTES)).toBe(true);
  });

  it('rejeita zero, negativos, acima do teto e não-inteiros', () => {
    expect(isValidMinutes(0)).toBe(false);
    expect(isValidMinutes(-5)).toBe(false);
    expect(isValidMinutes(MAX_MINUTES + 1)).toBe(false);
    expect(isValidMinutes(25.5)).toBe(false);
    expect(isValidMinutes(NaN)).toBe(false);
  });
});

describe('stepMinutes', () => {
  it('anda de 5 em 5 a partir de valores alinhados', () => {
    expect(stepMinutes(0, 1)).toBe(5);
    expect(stepMinutes(5, 1)).toBe(10);
    expect(stepMinutes(10, -1)).toBe(5);
    expect(stepMinutes(5, -1)).toBe(0);
  });

  it('imanta valores fora da grade para o múltiplo na direção do clique', () => {
    expect(stepMinutes(7, 1)).toBe(10);
    expect(stepMinutes(7, -1)).toBe(5);
    expect(stepMinutes(178, 1)).toBe(180);
  });

  it('respeita os limites 0 e MAX_MINUTES', () => {
    expect(stepMinutes(0, -1)).toBe(0);
    expect(stepMinutes(MAX_MINUTES, 1)).toBe(MAX_MINUTES);
    // valores digitados fora do teto voltam para dentro
    expect(stepMinutes(999, -1)).toBe(MAX_MINUTES);
    expect(stepMinutes(999, 1)).toBe(MAX_MINUTES);
  });

  it('trata entradas não numéricas como 0', () => {
    expect(stepMinutes(NaN, 1)).toBe(5);
    expect(stepMinutes(NaN, -1)).toBe(0);
  });
});

describe('transições', () => {
  it('stopTask registra até onde foi e muda só o status', () => {
    const stopped = stopTask(running, START + 10 * MINUTE_MS);
    expect(stopped).toEqual({ ...running, status: 'stopped', elapsedMs: 10 * MINUTE_MS });
  });

  it('stopTask limita o registrado ao planejado', () => {
    const stopped = stopTask(running, START + 999 * MINUTE_MS);
    expect(stopped.elapsedMs).toBe(25 * MINUTE_MS);
  });

  it('completeTask preserva os campos e troca o status', () => {
    expect(completeTask(running)).toEqual({ ...running, status: 'completed' });
  });
});
