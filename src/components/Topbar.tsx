'use client';

import { ScrollText, Settings, Timer } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSettings } from '@/state/settings';
import { SettingsModal } from './SettingsModal';
import styles from './Topbar.module.css';

/*
 * Todos os ícones do app seguem a mesma régua: 15px, traço de 1.5 (o
 * hairline do design), cor herdada do texto e aria-hidden — o ícone
 * acompanha o rótulo, nunca fala sozinho com o leitor de tela.
 */
const icon = { size: 15, strokeWidth: 1.5, 'aria-hidden': true } as const;

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
        <Link href="/">
          <Timer {...icon} />
          {t.navTimer}
        </Link>
        <Link href="/history">
          <ScrollText {...icon} />
          {t.navHistory}
        </Link>
        <button type="button" onClick={() => setSettingsOpen(true)}>
          <Settings {...icon} />
          {t.navSettings}
        </button>
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
