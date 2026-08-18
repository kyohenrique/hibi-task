import { describe, expect, it } from 'vitest';
import { MICROSEASONS, currentMicroseason } from './seasons';

/* new Date(ano, mêsIndexado, dia) usa o fuso local — o mesmo que a
   função lê, então o teste é determinístico em qualquer máquina. */
const at = (month: number, day: number) => new Date(2026, month - 1, day);

describe('MICROSEASONS', () => {
  it('tem as 72 entradas', () => {
    expect(MICROSEASONS).toHaveLength(72);
  });

  it('está em ordem de calendário, sem datas repetidas', () => {
    const chaves = MICROSEASONS.map((s) => s.month * 100 + s.day);
    expect(chaves).toEqual([...chaves].sort((a, b) => a - b));
    expect(new Set(chaves).size).toBe(chaves.length);
  });

  it('traz kanji e tradução nos dois idiomas em todas', () => {
    for (const s of MICROSEASONS) {
      expect(s.kanji.length).toBeGreaterThan(0);
      expect(s.pt.length).toBeGreaterThan(0);
      expect(s.en.length).toBeGreaterThan(0);
    }
  });
});

describe('currentMicroseason', () => {
  it('acerta no primeiro dia da microestação', () => {
    expect(currentMicroseason(at(3, 11)).kanji).toBe('桃始笑');
  });

  it('mantém a microestação até a véspera da seguinte', () => {
    // 桃始笑 começa em 11/mar e vale até 15/mar; 菜虫化蝶 assume no dia 16
    expect(currentMicroseason(at(3, 15)).kanji).toBe('桃始笑');
    expect(currentMicroseason(at(3, 16)).kanji).toBe('菜虫化蝶');
    expect(currentMicroseason(at(3, 20)).kanji).toBe('菜虫化蝶');
    expect(currentMicroseason(at(3, 21)).kanji).toBe('雀始巣');
  });

  it('na virada do ano, volta para a última de dezembro', () => {
    expect(currentMicroseason(at(1, 1)).kanji).toBe('雪下出麦');
    expect(currentMicroseason(at(1, 4)).kanji).toBe('雪下出麦');
    expect(currentMicroseason(at(1, 5)).kanji).toBe('芹乃栄');
  });

  it('cobre o ano inteiro sem buraco', () => {
    // qualquer dia de qualquer mês devolve alguma microestação
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 28; d++) {
        expect(currentMicroseason(at(m, d)).kanji).toBeTruthy();
      }
    }
  });
});
