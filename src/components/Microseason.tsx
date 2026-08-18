'use client';

import { currentMicroseason } from '@/lib/seasons';
import { useSettings } from '@/state/settings';
import styles from './Microseason.module.css';

/*
 * O rodapé do cartão: a microestação de hoje, no calendário japonês de
 * 72 recortes. Fica quieta, em texto apagado — é para ser notada na
 * segunda ou terceira vez que se olha, não na primeira.
 *
 * Por que só depois de `hydrated`: as páginas são geradas estaticamente
 * no build, então o HTML pronto carregaria a microestação do DIA DO
 * DEPLOY. Esperando a hidratação, o cálculo acontece no navegador, com a
 * data (e o fuso) de quem está lendo — e o servidor e o primeiro render
 * do cliente continuam idênticos, sem risco de hydration mismatch.
 */
export function Microseason() {
  const { settings, hydrated, t } = useSettings();

  if (!hydrated) return <p className={styles.season} aria-hidden="true" />;

  const season = currentMicroseason(new Date());

  return (
    <p className={styles.season}>
      <span className={styles.kanji} lang="ja">
        {season.kanji}
      </span>
      <span className={styles.meaning}>{season[settings.language]}</span>
      <span className={styles.hidden}>{t.microseasonLabel}</span>
    </p>
  );
}
