'use client';

import type { CSSProperties } from 'react';
import { useTasks } from '@/state/tasks';
import styles from './Petals.module.css';

/*
 * Pétalas de sakura caindo — e a razão de existirem: elas só caem
 * enquanto o tempo corre, exatamente como o acento vermelho. Em repouso
 * a tela fica imóvel; ao iniciar, cor e movimento acendem juntos. Não é
 * enfeite: é a mesma regra do design dita com movimento em vez de cor.
 * (A sakura é o símbolo do transitório — o assunto do app.)
 *
 * A coreografia é escrita à mão em vez de sorteada: Math.random() daria
 * valores diferentes no servidor e no navegador (hydration mismatch) e,
 * mais importante, o ritmo aqui é decisão de design, não ruído.
 *
 * left  — de onde a pétala parte, em % da largura da tela
 * size  — largura em px (a altura sai do CSS)
 * fall  — segundos para atravessar a tela de cima a baixo
 * sway  — segundos de um ciclo do balanço lateral
 * delay — atraso inicial, em segundos (negativo = já começa no meio)
 */
const PETALS = [
  { left: 4, size: 13, fall: 34, sway: 9, delay: -4 },
  { left: 11, size: 9, fall: 42, sway: 11, delay: -18 },
  { left: 19, size: 15, fall: 28, sway: 7.5, delay: -26 },
  { left: 26, size: 8, fall: 44, sway: 10.5, delay: -10 },
  { left: 34, size: 12, fall: 32, sway: 8, delay: -36 },
  { left: 41, size: 10, fall: 38, sway: 12, delay: -2 },
  { left: 49, size: 14, fall: 30, sway: 7.8, delay: -22 },
  { left: 57, size: 9, fall: 40, sway: 10, delay: -32 },
  { left: 64, size: 12, fall: 36, sway: 8.6, delay: -14 },
  { left: 72, size: 8, fall: 44, sway: 11.5, delay: -40 },
  { left: 79, size: 15, fall: 26, sway: 7, delay: -6 },
  { left: 86, size: 10, fall: 38, sway: 10.8, delay: -28 },
  { left: 92, size: 13, fall: 32, sway: 9.2, delay: -16 },
  { left: 97, size: 9, fall: 42, sway: 11.8, delay: -24 },
];

export function Petals() {
  const { activeTask } = useTasks();

  /*
   * As pétalas nunca desmontam e nunca param de se mover: o que muda é
   * só a opacidade delas (ver .petal no CSS). Em repouso ficam
   * invisíveis, continuando a cair de mansinho — assim, ao começar o
   * timer, elas já estão espalhadas pela tela em vez de nascerem todas
   * na borda de cima, e ao interromper somem enquanto ainda caem, em
   * vez de congelarem no ar.
   *
   * Elas custam pouquíssimo mesmo invisíveis: o navegador anima só
   * `transform`, direto na GPU, e congela tudo sozinho quando a aba
   * está em segundo plano.
   */
  return (
    <div
      className={`${styles.layer} ${activeTask ? styles.visible : ''}`}
      aria-hidden="true"
    >
      {PETALS.map((p, i) => (
        /*
         * Dois elementos por pétala: o de fora cai, o de dentro balança e
         * gira. Um só elemento não daria conta — são animações com
         * durações diferentes, e cada elemento só executa uma de cada vez.
         */
        <div
          key={i}
          className={styles.fall}
          style={
            {
              '--left': `${p.left}%`,
              '--size': `${p.size}px`,
              '--fall': `${p.fall}s`,
              '--sway': `${p.sway}s`,
              '--delay': `${p.delay}s`,
              /*
               * Cada pétala ganha um atraso diferente para surgir, então
               * elas materializam uma a uma em vez de a tela inteira
               * acender junta. O (i * 5) % 14 espalha a ordem: como 5 e
               * 14 não têm divisor comum, a conta passa por todos os
               * índices, mas fora da sequência — o aparecimento fica
               * disperso e não varre a tela da esquerda para a direita.
               */
              '--fade-delay': `${((i * 5) % PETALS.length) * 0.25}s`,
            } as CSSProperties
          }
        >
          <div className={styles.petal} />
        </div>
      ))}
    </div>
  );
}
