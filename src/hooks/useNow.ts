'use client';

import { useEffect, useState } from 'react';

/*
 * O intervalo NÃO é o relógio — é só um "acorde e olhe as horas de novo".
 * A hora em si vem sempre de Date.now(); se o navegador atrasar os ticks
 * (aba em segundo plano, por exemplo), o próximo tick já mostra a hora
 * certa, sem acumular erro. É a regra "o timer calcula, não conta"
 * aplicada à UI.
 *
 * 250ms em vez de 1s: um interval de 1s dispara *quase* a cada segundo,
 * e a deriva faria o display ocasionalmente pular um número. Olhando 4x
 * por segundo, cada segundo exibido aparece.
 */
const TICK_MS = 250;

/** Date.now() que re-renderiza o componente enquanto `active` for true. */
export function useNow(active: boolean = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;

    // O primeiro tick chega em até TICK_MS — não há setNow síncrono aqui
    // de propósito: setState direto no corpo de um efeito dispara um
    // segundo render imediato (o ESLint do React reprova, com razão), e o
    // valor inicial do useState já cobre a montagem.
    const id = setInterval(() => setNow(Date.now()), TICK_MS);

    // Função de limpeza: o React a chama quando o componente sai de cena
    // ou quando `active` muda — sem ela, o interval vazaria para sempre.
    return () => clearInterval(id);
  }, [active]);

  return now;
}
