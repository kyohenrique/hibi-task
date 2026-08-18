# 日々 Hibi Task

A minimal task timer that lives entirely in your browser — no backend, no database, no account.
Um timer de tarefas minimalista que vive inteiro no navegador — sem backend, sem banco, sem conta.

**[hibi-task-nine.vercel.app](https://hibi-task-nine.vercel.app/)**

<!-- screenshots: gofun (claro) e sumi (escuro), lado a lado -->

---

## EN

Describe an intention, choose a duration, start. When the time runs out the app rings a bell and, if you allowed it, sends a notification. Everything you do is kept in `localStorage` — close the tab, come back tomorrow, your history is still there.

**Three states, no pause.** A session is either *running*, *stopped* (you interrupted it) or *completed*. There is no pause button: pausing a focus session is how a focus session ends.

### Design

The interface follows *ma* (間), the deliberate interval — the emptiness is the design. Rather than decorating with torii gates and cherry blossoms, the Japanese influence shows up as a principle and as typography: a mincho serif for the clock and a gothic sans for the interface, the standard editorial pairing in Japan.

Two named themes: **gofun** (胡粉, shell white) and **sumi** (墨, ink).

**One rule holds the whole thing together: colour means time is passing.** The vermillion accent — *shu* (朱), the colour of seal ink — appears only while a timer runs. At rest the interface is ink on paper and nothing else. The same rule governs motion: sakura petals fall across the screen only while the clock is counting. They are not decoration; they are the passage of time made visible.

At the bottom of the card sits today's *microseason*: the Japanese calendar splits the year into 72 periods of about five days, each named after one small thing happening in nature — "dew glistens white on the grass", "swallows leave".

### Under the hood

**The timer calculates, it doesn't count.** Nothing stores a "remaining time" that ticks down. A task knows when it started and how long it should last; everything else is derived from the current clock. That single decision makes the timer immune to refreshes, navigation and background tabs — and a timer that expired while the tab was closed is simply reconciled as completed on the next load.

The bell is synthesised with the Web Audio API — five inharmonic partials with exponential decay, no audio file in the repository.

Accessibility: every colour pair meets WCAG AA contrast, the focus ring is visible on every control, icons never speak alone, and `prefers-reduced-motion` removes all animation, petals included.

---

## PT

Descreva uma intenção, escolha a duração, comece. Quando o tempo acaba o app toca um sino e, se você permitir, envia uma notificação. Tudo fica no `localStorage` — feche a aba, volte amanhã, o histórico continua lá.

**Três estados, sem pausa.** Uma sessão está *em andamento*, *interrompida* ou *concluída*. Não existe botão de pausa: pausar uma sessão de foco é o jeito de encerrá-la.

### Design

A interface segue o *ma* (間), o intervalo deliberado — o vazio é o projeto. Em vez de decorar com torii e flores de cerejeira, a influência japonesa aparece como princípio e como tipografia: uma mincho serifada para o relógio e uma gothic sem serifa para a interface, o par editorial padrão no Japão.

Dois temas com nome próprio: **gofun** (胡粉, branco de concha) e **sumi** (墨, tinta).

**Uma regra segura o conjunto inteiro: cor significa tempo passando.** O acento vermelhão — *shu* (朱), a cor da tinta de carimbo — só aparece enquanto um timer corre. Em repouso, a interface é tinta sobre papel e mais nada. A mesma regra rege o movimento: as pétalas de sakura caem pela tela apenas enquanto o relógio conta. Não são enfeite; são o tempo passando, visível.

No rodapé do cartão fica a *microestação* do dia: o calendário japonês divide o ano em 72 períodos de cerca de cinco dias, cada um nomeado por uma coisa pequena acontecendo na natureza — "o orvalho brilha branco na grama", "as andorinhas partem".

### Por dentro

**O timer calcula, não conta.** Nada guarda um "tempo restante" que decresce. A tarefa sabe quando começou e quanto deveria durar; o resto é derivado do relógio do momento. Essa decisão sozinha torna o timer imune a recarregamentos, navegação e abas em segundo plano — e um timer que venceu com a aba fechada é apenas reconciliado como concluído na carga seguinte.

O sino é sintetizado com a Web Audio API — cinco parciais inarmônicos com decaimento exponencial, sem nenhum arquivo de áudio no repositório.

Acessibilidade: todos os pares de cor passam no contraste WCAG AA, o anel de foco é visível em todos os controles, ícones nunca falam sozinhos, e `prefers-reduced-motion` remove toda animação, pétalas incluídas.

---

## Architecture

Dependencies point one way, always down:

```
app  →  components  →  hooks / state  →  lib
```

| | |
|---|---|
| `src/lib/` | Pure TypeScript. Timer maths, formatting, storage parsing, the i18n dictionary, the 72 microseasons. Never imports React. All business rules live here — and this is the only layer with tests. |
| `src/state/` | Two Context + `useReducer` providers: `tasks` and `settings`, kept apart because they change at very different rates. |
| `src/hooks/` | Thin bridges to the UI (`useNow`). |
| `src/components/` | Presentation only, each with its CSS Module. |
| `src/app/` | Two routes: `/` and `/history`. Settings is a modal, not a route. |
| `src/styles/tokens.css` | The entire design system — colours, themes, type, space, motion. No raw values anywhere else. |

Next.js (App Router) · TypeScript · CSS Modules · Vitest · lucide-react. No UI framework, no state library, no i18n library.

## Running locally

```bash
npm install
npm run dev
```

```bash
npm run test
```

## License

[MIT](LICENSE)
