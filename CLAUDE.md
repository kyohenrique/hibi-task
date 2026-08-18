# Hibi Task — 日々

Timer de tarefas minimalista, 100% client-side: sem backend e sem banco — tudo vive no `localStorage` do navegador. Estética "Sumi" (tinta sobre papel), com dois temas nomeados: **gofun** (claro) e **sumi** (escuro).

## Comandos

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint
- `npm run test` — testes (Vitest); `npm run test:watch` para modo contínuo. Só a lógica pura de `src/lib/` é testada.

## Arquitetura

A regra central é **dependência em direção única**, sempre para baixo:

```
app  →  components  →  hooks / state  →  lib
```

- `src/lib/` — funções puras de TypeScript (types, timer, format, storage, i18n). **Nunca importa React** nem nada das camadas de cima. Toda regra de negócio mora aqui.
- `src/state/` — providers de Context + `useReducer`: `tasks` (tarefas + sessão ativa) e `settings` (tema, idioma, som), separados porque mudam em ritmos diferentes.
- `src/hooks/` — pontes finas entre estado/lib e a UI (`useNow`, etc.).
- `src/components/` — só apresentação; recebem dados e disparam ações. CSS Module ao lado de cada componente.
- `src/app/` — rotas: `/` (timer) e `/history` (histórico). Ajustes são um modal, não uma rota.
- `src/styles/tokens.css` — o design system inteiro (cores, temas, tipografia, espaço, movimento).

Diretórios ainda inexistentes são criados conforme as etapas do projeto avançam.

## Regras do produto

- **Cor significa tempo passando**: o acento vermelho (shu) só aparece enquanto um timer corre. Em repouso, a interface é monocromática. Na dúvida sobre usar `--accent`: se a coisa não está rodando, use `--text-muted`.
- **O timer calcula, não conta**: guarda-se `startedAt` (timestamp) + duração, e o restante é derivado de `Date.now()`. Nunca decrementar contador com `setInterval`. Timer vencido com a aba fechada é marcado como concluído na próxima carga.
- **Três status, sem pausa**: `running` (em andamento), `stopped` (interrompida — única ação possível após iniciar) e `completed` (concluída). `Task` é uma discriminated union por status.
- **Atalhos rápidos** (respiro 5 · pausa 15 · pomodoro 25) só preenchem os minutos; nunca iniciam o timer sozinhos.
- **Duração limitada**: inteiro entre `MIN_MINUTES` (1) e `MAX_MINUTES` (180), constantes de `lib/timer.ts` — teto de produto (sessões de foco, não turnos), única fonte da verdade para formulário e validação.
- **i18n sem biblioteca**: dicionário TypeScript em `lib/i18n.ts` (pt/en), escolha salva nos ajustes. Sem rotas por locale. Para adicionar uma string: criar a chave no dicionário `pt` (a fonte da verdade) — o compilador exige a tradução em `en`, porque `en` é tipado como `typeof pt`.
- **Notificação**: pedir permissão apenas quando o usuário ligar a opção, nunca no carregamento. Dispara só com a aba fora de vista ou a janela sem foco.
- **Som**: o rin é sintetizado via Web Audio em `lib/sound.ts` — não há assets de áudio no repo. Áudio precisa nascer de gesto do usuário (`primeAudio()` nos cliques de começar e de ligar o som).
- Persistência em `localStorage` sob chaves versionadas (`hibi.v1` para tarefas, `hibi.settings.v1` para ajustes), com parse defensivo.

## Convenções

- Nenhum valor cru de cor, espaço ou duração fora do `tokens.css` — componentes sempre consomem `var(--*)`.
- Comentários de código em **pt-BR**, didáticos: explicam o porquê e conceitos de JS/TS/React quando valem a pena, sem ruído linha a linha.
- Commits em **inglês**, no padrão conventional commits (`feat:`, `fix:`, `docs:`...). Commits são sempre propostos e aprovados pelo mantenedor antes de executados.
- Componentes usam export nomeado; páginas usam export default (exigência do Next).
- Nenhuma string fixa de UI em componente — todo texto visível vem de `useSettings().t`.
