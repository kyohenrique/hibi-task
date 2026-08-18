import { describe, expect, it } from 'vitest';
import { dictionaries } from './i18n';

/*
 * A sincronia das CHAVES já é garantida pelo compilador (en é declarado
 * com o tipo de pt). Este teste cobre o que o tipo não vê: detalhes de
 * conteúdo, como a lista de meses ter os 12.
 */
describe('dicionários', () => {
  it('todos os idiomas têm 12 meses', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(dict.months).toHaveLength(12);
    }
  });

  it('as mensagens com parâmetros os utilizam de fato', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(dict.hintMinutesRange(1, 180)).toContain('180');
      expect(dict.deleteAria('foco')).toContain('foco');
      expect(dict.stepUpAria(5)).toContain('5');
    }
  });
});
