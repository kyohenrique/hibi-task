'use client';

import { useEffect } from 'react';
import { useNow } from '@/hooks/useNow';
import { formatClock } from '@/lib/format';
import { isExpired, remainingMs } from '@/lib/timer';
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
  const now = useNow(Boolean(activeTask));

  useEffect(() => {
    if (activeTask && isExpired(activeTask, now)) complete();
  }, [activeTask, now, complete]);

  useEffect(() => {
    if (!activeTask) {
      document.title = DEFAULT_TITLE;
      return;
    }
    document.title = `${formatClock(remainingMs(activeTask, now))} · ${activeTask.name}`;
  }, [activeTask, now]);

  return null;
}
