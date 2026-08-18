'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSettings } from '@/state/settings';
import { SettingsModal } from './SettingsModal';
import styles from './Topbar.module.css';

/*
 * Barra superior presente em todas as páginas: a marca 日々 (hibi, "dia a
 * dia") à esquerda e a navegação à direita. Virou Client Component na
 * etapa dos ajustes: precisa de estado (o modal aberto/fechado) e dos
 * rótulos traduzidos do dicionário.
 */
export function Topbar() {
  const { t } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className={styles.topbar}>
      <Link href="/" className={styles.wordmark} lang="ja">
        日々
      </Link>
      <nav className={styles.nav}>
        <Link href="/">{t.navTimer}</Link>
        <Link href="/history">{t.navHistory}</Link>
        <button type="button" onClick={() => setSettingsOpen(true)}>
          {t.navSettings}
        </button>
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
