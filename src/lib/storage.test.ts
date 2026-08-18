import { describe, expect, it } from 'vitest';
import { parseTasks } from './storage';
import type { Task } from './types';

const valid: Task[] = [
  {
    id: 'a',
    name: 'ler',
    plannedMs: 1_500_000,
    startedAt: 1_000_000,
    status: 'completed',
  },
  {
    id: 'b',
    name: 'escrever',
    plannedMs: 1_500_000,
    startedAt: 2_000_000,
    status: 'stopped',
    elapsedMs: 600_000,
  },
];

describe('parseTasks', () => {
  it('aceita uma lista válida de volta, intacta', () => {
    expect(parseTasks(JSON.stringify(valid))).toEqual(valid);
  });

  it('devolve vazio para null, texto corrompido e JSON que não é lista', () => {
    expect(parseTasks(null)).toEqual([]);
    expect(parseTasks('{{{ nem json')).toEqual([]);
    expect(parseTasks('{"tasks": []}')).toEqual([]);
    expect(parseTasks('42')).toEqual([]);
  });

  it('descarta itens inválidos e preserva os válidos', () => {
    const mixed = [
      valid[0],
      { id: 'x' }, // faltando quase tudo
      { ...valid[0], id: 2 }, // id com tipo errado
      { ...valid[0], status: 'paused' }, // status que não existe
      { ...valid[1], elapsedMs: undefined }, // stopped sem elapsedMs
      valid[1],
    ];
    expect(parseTasks(JSON.stringify(mixed))).toEqual(valid);
  });
});
