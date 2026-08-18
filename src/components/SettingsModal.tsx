'use client';

import { useEffect, useRef, useState } from 'react';
import { LANGUAGE_NAMES, type Language } from '@/lib/i18n';
import type { ThemeSetting } from '@/lib/types';
import { useSettings } from '@/state/settings';
import { useTasks } from '@/state/tasks';
import styles from './SettingsModal.module.css';

const CONFIRM_TIMEOUT_MS = 3_000;

const THEMES: ThemeSetting[] = ['gofun', 'sumi', 'system'];
const LANGUAGES: Language[] = ['pt', 'en'];

/*
 * O modal usa o elemento <dialog> NATIVO do HTML: showModal() prende o
 * foco lá dentro, Esc fecha, o resto da página vira inerte e o ::backdrop
 * escurece o fundo — acessibilidade que custaria dezenas de linhas à mão.
 *
 * O React não tem prop declarativa para abrir um dialog em modo modal;
 * é um caso legítimo de useRef + useEffect: o estado `open` (React)
 * comanda o método imperativo showModal()/close() (DOM).
 */
export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { settings, t, setTheme, setLanguage, toggleSound } = useSettings();
  const { clearFinished } = useTasks();

  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!confirmingClear) return;
    const id = setTimeout(() => setConfirmingClear(false), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [confirmingClear]);

  return (
    /*
     * onClose: o dialog fecha sozinho no Esc; esse evento avisa o React
     * para o estado `open` não ficar mentindo. onClick no próprio dialog:
     * clique no backdrop tem o dialog como alvo (o conteúdo interno tem
     * os elementos como alvo), então dá para fechar clicando fora.
     */
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <header className={styles.header}>
        <span className="eyebrow">{t.settingsTitle}</span>
        <button
          type="button"
          className={styles.close}
          aria-label={t.closeAria}
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className={styles.row}>
        <span className={styles.rowLabel}>{t.themeLabel}</span>
        <div className={styles.options}>
          {THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              className={styles.option}
              aria-pressed={settings.theme === theme}
              onClick={() => setTheme(theme)}
            >
              {/* gofun e sumi são nomes próprios; só "sistema" se traduz */}
              {theme === 'system' ? t.themeSystem : theme}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>{t.languageLabel}</span>
        <div className={styles.options}>
          {LANGUAGES.map((language) => (
            <button
              key={language}
              type="button"
              className={styles.option}
              aria-pressed={settings.language === language}
              onClick={() => setLanguage(language)}
            >
              {LANGUAGE_NAMES[language]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>{t.soundLabel}</span>
        <div className={styles.options}>
          <button
            type="button"
            className={styles.option}
            aria-pressed={settings.sound}
            onClick={() => {
              if (!settings.sound) toggleSound();
            }}
          >
            {t.soundOn}
          </button>
          <button
            type="button"
            className={styles.option}
            aria-pressed={!settings.sound}
            onClick={() => {
              if (settings.sound) toggleSound();
            }}
          >
            {t.soundOff}
          </button>
        </div>
      </div>

      <div className={styles.row}>
        {confirmingClear ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              clearFinished();
              setConfirmingClear(false);
            }}
          >
            {t.confirm}
          </button>
        ) : (
          <button
            type="button"
            className={styles.clear}
            onClick={() => setConfirmingClear(true)}
          >
            {t.clearHistory}
          </button>
        )}
      </div>
    </dialog>
  );
}
