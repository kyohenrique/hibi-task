'use client';

import { Bell, Languages, Palette, Trash2, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LANGUAGE_NAMES, type Language } from '@/lib/i18n';
import { requestNotifyPermission } from '@/lib/notify';
import { playRin, primeAudio } from '@/lib/sound';
import type { ThemeSetting } from '@/lib/types';
import { useSettings } from '@/state/settings';
import { useTasks } from '@/state/tasks';
import styles from './SettingsModal.module.css';

const CONFIRM_TIMEOUT_MS = 3_000;

const THEMES: ThemeSetting[] = ['gofun', 'sumi', 'system'];
const LANGUAGES: Language[] = ['pt', 'en'];

/* Mesma régua de ícones do app inteiro (ver Topbar). */
const icon = { size: 15, strokeWidth: 1.5, 'aria-hidden': true } as const;

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
  const { settings, t, setTheme, setLanguage, toggleSound, setNotify } =
    useSettings();
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
        <span className={styles.rowLabel}>
          <Palette {...icon} />
          {t.themeLabel}
        </span>
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
        <span className={styles.rowLabel}>
          <Languages {...icon} />
          {t.languageLabel}
        </span>
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
        <span className={styles.rowLabel}>
          <Volume2 {...icon} />
          {t.soundLabel}
        </span>
        <div className={styles.options}>
          <button
            type="button"
            className={styles.option}
            aria-pressed={settings.sound}
            onClick={() => {
              if (settings.sound) return;
              toggleSound();
              // O clique é um gesto: acorda o áudio e toca uma prévia —
              // a pessoa descobre na hora que som acabou de ligar.
              primeAudio();
              playRin();
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
        <span className={styles.rowLabel}>
          <Bell {...icon} />
          {t.notifyLabel}
        </span>
        <div className={styles.options}>
          {/*
            Ligar é assíncrono: primeiro o navegador pergunta ao usuário
            (só neste momento — regra do produto) e o toggle só liga se a
            permissão vier. Negou? O botão simplesmente não acende.
          */}
          <button
            type="button"
            className={styles.option}
            aria-pressed={settings.notify}
            onClick={async () => {
              if (settings.notify) return;
              if (await requestNotifyPermission()) setNotify(true);
            }}
          >
            {t.soundOn}
          </button>
          <button
            type="button"
            className={styles.option}
            aria-pressed={!settings.notify}
            onClick={() => setNotify(false)}
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
            <Trash2 {...icon} />
            {t.clearHistory}
          </button>
        )}
      </div>
    </dialog>
  );
}
