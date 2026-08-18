'use client';

import { useEffect, useRef } from 'react';
import { useNow } from '@/hooks/useNow';
import { formatClock } from '@/lib/format';
import { notifyCompletion } from '@/lib/notify';
import { playRin } from '@/lib/sound';
import { isExpired, remainingMs } from '@/lib/timer';
import { useSettings } from '@/state/settings';
import { useTasks } from '@/state/tasks';

const DEFAULT_TITLE = 'Hibi Task';

/*
 * Componente sem interface: devolve null e existe só pelos efeitos que um
 * timer rodando produz no app INTEIRO, independente da página aberta —
 * por isso mora no layout, não na tela do timer:
 *
 * 1. Conclusão automática — quando o agora ultrapassa o fim, despacha
 *    complete. Se morasse na tela do timer, um usuário parado no
 *    histórico teria um timer eternamente "rodando".
 * 2. Título da aba — a contagem aparece mesmo com a aba em segundo plano,
 *    que é justamente quando o título é a única parte visível do app.
 *
 * O useNow só fica ativo com timer rodando: em repouso, nenhum tick.
 */
export function TimerEffects() {
  const { activeTask, complete } = useTasks();
  const { settings, t } = useSettings();
  const now = useNow(Boolean(activeTask));

  /*
   * Guarda contra o fim tocar duas vezes: o ref lembra o id da última
   * tarefa cujo término já foi tratado. Efeitos podem rodar mais de uma
   * vez para o mesmo instante (StrictMode, re-renders entre o dispatch e
   * o novo estado), e o rin não pode "gaguejar" por isso.
   * A conclusão por RECONCILIAÇÃO (aba fechada) nunca passa por aqui —
   * ela vira 'completed' antes de existir um activeTask.
   */
  const firedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeTask || !isExpired(activeTask, now)) return;
    if (firedRef.current === activeTask.id) return;
    firedRef.current = activeTask.id;

    complete();
    if (settings.sound) playRin();
    if (settings.notify) {
      notifyCompletion(DEFAULT_TITLE, t.notificationDone(activeTask.name));
    }
  }, [activeTask, now, complete, settings.sound, settings.notify, t]);

  useEffect(() => {
    if (!activeTask) {
      document.title = DEFAULT_TITLE;
      return;
    }
    document.title = `${formatClock(remainingMs(activeTask, now))} · ${activeTask.name}`;
  }, [activeTask, now]);

  return null;
}
