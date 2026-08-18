import { describe, expect, it } from 'vitest';
import { parseSettings, parseTasks } from './storage';
import type { Settings, Task } from './types';

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

const fallback: Settings = { theme: 'system', language: 'pt', sound: true };

describe('parseSettings', () => {
  it('aceita ajustes válidos de volta', () => {
    const saved: Settings = { theme: 'sumi', language: 'en', sound: false };
    expect(parseSettings(JSON.stringify(saved), fallback)).toEqual(saved);
  });

  it('devolve o fallback para null e JSON corrompido', () => {
    expect(parseSettings(null, fallback)).toEqual(fallback);
    expect(parseSettings('{{{', fallback)).toEqual(fallback);
  });

  it('valida campo a campo: um campo ruim não derruba os demais', () => {
    const mixed = { theme: 'neon', language: 'en', sound: 'sim' };
    expect(parseSettings(JSON.stringify(mixed), fallback)).toEqual({
      theme: 'system', // inválido → fallback
      language: 'en', // válido → preservado
      sound: true, // inválido → fallback
    });
  });
});
