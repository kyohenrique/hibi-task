/*
 * Notificações do navegador — a mesma fronteira fina de sound.ts e
 * storage.ts: guarda-chuvas em volta de uma API que pode não existir
 * (SSR, navegadores antigos) ou não estar autorizada.
 *
 * A regra do produto: a permissão só é pedida quando o usuário LIGA a
 * opção nos ajustes — nunca no carregamento da página. Pedir permissão
 * de cara é o jeito mais rápido de ganhar um "bloquear" permanente.
 */

function supported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Pede a permissão (se ainda não decidida) e responde se pode notificar.
 * Uma negação anterior devolve false direto — o navegador nem mostraria
 * o pedido de novo, e insistir seria só ruído.
 */
export async function requestNotifyPermission(): Promise<boolean> {
  if (!supported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

/**
 * Notifica a conclusão — mas só para quem NÃO está olhando o app: com a
 * aba visível e a janela em foco, a tela e o rin já comunicam; a
 * notificação serve a quem está em outra aba ou outra janela.
 */
export function notifyCompletion(title: string, body: string): void {
  if (!supported() || Notification.permission !== 'granted') return;
  if (!document.hidden && document.hasFocus()) return;
  try {
    new Notification(title, { body });
  } catch {
    // notificação é um extra: falhou, seguimos em silêncio
  }
}
