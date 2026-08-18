/*
 * O rin — sintetizado com a Web Audio API, sem arquivo de áudio.
 *
 * Um sino de metal, fisicamente, é um conjunto de PARCIAIS inarmônicos
 * (frequências que não são múltiplos exatos da fundamental) decaindo
 * devagar. Recriamos isso com osciladores senoidais: cada parcial é um
 * oscilador → um ganho com envelope de decaimento exponencial → a saída.
 * O par levemente desafinado da fundamental produz o "shimmer", aquele
 * batimento lento característico de tigela de metal.
 *
 * Autoplay: navegadores só deixam áudio tocar depois de um gesto do
 * usuário. O AudioContext nasce "suspended" e precisa de resume() DENTRO
 * de um clique — é o papel do primeAudio(), chamado no "começar" e ao
 * ligar o som nos ajustes. Depois de acordado uma vez, vale até o fim da
 * sessão da página.
 *
 * Mesmo padrão de fronteira do storage.ts: fala com o navegador, não
 * importa React — e por depender de APIs que não existem no Node, fica
 * fora dos testes (a regra do projeto: testa-se só a lógica pura).
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  // ??= : atribui só se ainda for null — o contexto é um singleton.
  ctx ??= new AudioContext();
  return ctx;
}

/** Acorda o áudio. Só funciona chamado dentro de um gesto do usuário. */
export function primeAudio(): void {
  const c = getContext();
  if (c && c.state === 'suspended') void c.resume();
}

/* A "receita" do sino: proporção da frequência, volume e duração de cada
   parcial. Proporções inarmônicas típicas de sino; a de 1.003 é o par
   desafinado que gera o batimento. Afinado de ouvido:
   - BASE_HZ dá a altura percebida (520 ≈ tigela média; 840 soava agudo);
   - os parciais 5.43 e 8.91 são o brilho da batida — ganho alto neles
     deixa o sino "metálico". */
const BASE_HZ = 520;
const PARTIALS = [
  { ratio: 1, gain: 0.34, decay: 3.5 },
  { ratio: 1.003, gain: 0.26, decay: 3.5 },
  { ratio: 2.74, gain: 0.15, decay: 1.75 },
  { ratio: 5.43, gain: 0.05, decay: 1 },
  { ratio: 8.91, gain: 0.015, decay: 0.5 },
];

export function playRin(): void {
  const c = getContext();
  if (!c) return;
  if (c.state === 'suspended') {
    // Sem gesto prévio o resume falha e o sino não toca — em silêncio,
    // sem erro: som é um extra, nunca uma quebra.
    void c.resume();
  }

  const now = c.currentTime;

  for (const { ratio, gain, decay } of PARTIALS) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = BASE_HZ * ratio;

    /*
     * O envelope: ataque quase instantâneo (a batida) e decaimento
     * exponencial até o inaudível. exponentialRamp não aceita zero,
     * por isso o alvo é um valor minúsculo.
     */
    const env = c.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(gain, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(env).connect(c.destination);
    osc.start(now);
    osc.stop(now + decay + 0.1); // libera o oscilador quando termina
  }
}
