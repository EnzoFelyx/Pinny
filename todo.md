# todo.md — Roadmap de desenvolvimento da v1

> Ordem de construção do app, dividida em etapas.
> Cada etapa tem um **objetivo**, as **tarefas** e o critério de **pronto quando**.
> Marque as tarefas com `[x]` conforme forem concluídas. Uma etapa só termina quando todos os critérios de "pronto quando" forem atendidos.
> Toda tarefa segue as regras do `REGRAS.md` e o escopo do `CLAUDE.md`.

> 🔁 **Lembrete fixo (2026-11-02):** em toda tela nova que carrega dados (lista, quadro, detalhe, calendário...), perguntar ao autor **se ela vai ter skeleton loading** antes de implementar. O padrão é o do quadro (etapa 6.4): formas nas medidas do conteúdo real, shimmer no estilo do YouTube (parado com "Reduzir movimento", base em `src/components/Skeleton.tsx`) e só enquanto os dados não chegam (sem tempo mínimo: `skeleton.minDurationMs` em 0, decisão do autor).

**Legenda de status:** ⬜ não iniciada · 🟨 em andamento · ✅ concluída

| # | Etapa | Status |
|---|---|---|
| 0 | Decisões pendentes | ✅ |
| 1 | Fundação do projeto | ✅ |
| 2 | Tema e textos centralizados | ✅ |
| 3 | Biblioteca de componentes | ✅ |
| 4 | Dados local-first | ✅ |
| 5 | Navegação e estrutura das telas | ✅ |
| 6 | Quadro kanban (o diferencial) | ✅ |
| 6R | Refac / Perform (branch própria) | ✅ |
| 7 | Card completo | 🟨 |
| 8 | Pastas e templates | ⬜ |
| 9 | Notificações e calendário | ⬜ |
| 10 | Agendamento por voz com IA | ⬜ |
| 11 | Automações e desfazer | ⬜ |
| 12 | Configurações e privacidade | ⬜ |
| 13 | Widgets e Live Activities | ⬜ |
| 14 | Polimento, testes e publicação | ⬜ |

---

## 🎬 Animações (lista contínua do autor)

> Animações que o autor quer no app, anotadas conforme surgem (desde 2026-11-13). Não é uma etapa da ordem acima: cada item entra quando o autor pedir. Seguir os tokens de `motion.ts` e respeitar o "Reduzir movimento".

- [ ] Abrir o campo de busca animado

---

## Etapa 0 — Decisões pendentes

**Objetivo:** fechar o que ainda está em aberto antes de escrever código.

- [x] Escolher o nome do app → **Pinny** (conferir disponibilidade nas lojas antes de publicar, na etapa 14)
- [x] Finalizar as telas no Figma → telas prontas
- [x] Extrair do Figma os valores exatos das cores e registrar no `CLAUDE.md`
- [x] Escolher a fonte → **Nunito**
- [x] Decidir: Expo (com dev client) ou React Native CLI → **Expo com dev client**
- [x] Decidir as bibliotecas → **escolhidas e instaladas conforme a necessidade de cada etapa**, sempre confirmando com o autor
- [x] Decidir onde roda o backend da IA de voz → **adiado para a etapa 10**
- [x] Registrar todas as decisões na seção 9 do `CLAUDE.md`

**Pronto quando:** não houver mais nenhum item "a decidir" na seção 9 do `CLAUDE.md` que bloqueie as próximas etapas.

---

## Etapa 1 — Fundação do projeto

**Objetivo:** projeto criado, organizado e com qualidade automática desde o primeiro commit.

- [x] Criar o projeto com Expo (dev client) e TypeScript em modo `strict`
- [x] Criar o repositório Git, `.gitignore` (incluindo `.env`) e a primeira branch
- [x] Montar a estrutura de pastas MVVM por feature (`src/features`, `src/components`, `src/hooks`, `src/utils`, `src/theme`, `src/i18n`)
- [x] Configurar imports absolutos com alias (`@/`)
- [x] Limpar o template do Expo (telas de demo, suporte web, deps sem uso) e fixar bundle ID `com.enzofelyx.pinny` e tema claro
- [x] Configurar ESLint e Prettier com as regras: `react-native/no-color-literals`, `react-native/no-inline-styles`, `@typescript-eslint/no-explicit-any`, `react-hooks/exhaustive-deps`
- [x] Rodar o app vazio no iOS

> **Adiado (decisão de 2026-10-27):** Android, tudo que envolve testes (Jest, Testing Library, pre-commit com testes) e o README inicial. O README fica para a etapa 14. Android volta quando o autor pedir.
>
> **Testes voltaram em 2026-11-16** (branch `chore/test-suite`): Jest + Testing Library, SQLite em memória para os repositórios, teste de contraste e CI a cada PR. Cobertos: funções puras, repositórios, regras do Model, hooks e componentes compartilhados. Faltam os ViewModels (hooks de tela) e o pre-commit. Detalhes no `CLAUDE.md`, seção 9.

**Pronto quando:** o app abre no iOS, e lint e checagem de tipos passam.

---

## Etapa 2 — Tema e textos centralizados

**Objetivo:** todo valor visual e todo texto do app em um único lugar.

- [x] `src/theme/colors.ts` com paleta base, tokens semânticos e sombras
- [x] Conferir o contraste AA de todos os tokens de texto e ícone
- [x] `typography.ts` e `motion.ts` (espaçamento, raio e tamanhos ficam nos componentes, ver REGRAS.md regra 2)
- [x] Instalar a fonte Nunito e guardar o arquivo de licença (OFL)
- [x] `src/i18n/pt-BR.ts` com a estrutura dos textos da interface
- [x] Constantes nomeadas para limites do app (ex.: "prazo próximo = 24h")
- [x] Adotar NativeWind como padrão de estilo, com o `tailwind.config.ts` lendo os tokens de `src/theme/`
- [x] Regra de lint contra cor arbitrária em `className` no `eslint.config.js`
- [x] Conferir no iPhone a tela provisória com fundo creme e "Pinny" em Nunito ExtraBold

**Pronto quando:** nenhum componente precisar de cor, fonte ou texto escrito à mão, e o lint acusar cores soltas.

---

## Etapa 3 — Biblioteca de componentes

**Objetivo:** todos os componentes reutilizáveis prontos, acessíveis e testados antes das telas.

- [x] Botão (variantes primária, secundária e ghost, além do estado desabilitado)
- [x] Botão flutuante (FAB)
- [x] Input
- [x] Toggle
- [x] Etiqueta
- [x] Chip de prioridade (com ícone e texto, não só cor)
- [x] Barra de progresso
- [x] Bottom sheet (`@gorhom/bottom-sheet`)
- [x] Card (post-it), incluindo os estados de prazo e de seleção
- [x] Coluna
- [x] Estado vazio com ilustração
- [x] Snackbar (para o "Desfazer")
- [x] Checkbox (extra, usado na seleção e no checklist)
- [x] Hook compartilhado `useReducedMotion`
- [x] Galeria de componentes na rota inicial para conferir no aparelho (sai na etapa 5)
- [x] Conferir a galeria no iPhone, comparando com o Figma

> **Adiado (decisão de 2026-10-27):** `useHaptics` vai para a etapa 6 (arraste); `usePermission` vai para a etapa 7 (primeira permissão real); os testes de componentes seguem adiados junto com os demais testes.

**Pronto quando:** todos os componentes tiverem `accessibilityLabel`/`accessibilityRole`, área de toque mínima e seguirem o Figma.

---

## Etapa 4 — Dados local-first

**Objetivo:** a camada Model completa, funcionando offline.

- [x] Tipos das entidades: Folder, Board, Column, Card, Label, Checklist, Attachment (schema Drizzle → Zod → tipo)
- [x] Repositórios com interfaces (pastas, quadros, colunas, cartões, etiquetas e checklist)
- [x] Persistência local: `expo-sqlite` + Drizzle ORM, com migrações versionadas
- [x] Validação dos dados lidos do armazenamento (Zod, via `drizzle-zod`)
- [x] Histórico de ações (base do "Desfazer"): mover, editar, criar e excluir cartão
- [x] Funções puras: estado do prazo e posição decimal (com renumeração rara)
- [x] Seção "Dados" na galeria para conferir criar, mover, excluir, desfazer e apagar tudo
- [x] Conferir no iPhone: os dados continuam lá depois de fechar e abrir o app
- [x] Ignorar `src/db/migrations/*` no `eslint.config.js` (código gerado)

> **Adiado:** testes unitários (decisão de 2026-10-27). Undo de excluir coluna, quadro e pasta entra junto com essas ações (etapas 6 e 8).

**Pronto quando:** for possível criar, editar, mover e apagar dados, fechar o app, abrir de novo e tudo continuar lá.

---

## Etapa 5 — Navegação e estrutura das telas

**Objetivo:** o esqueleto navegável do app.

- [x] Configurar a navegação: Native Tabs (Liquid Glass) com Início, Modelos, Agenda e Ajustes
- [x] Aba de busca separada da tab bar (círculo de vidro), buscando pastas e quadros
- [x] Tela Início: logo, saudação, data, "+" de vidro no topo e pastas com quadros vindos dos repositórios
- [x] Renomear pasta (lápis) e criar pasta pelo "+", em folhas nativas do iOS (`formSheet`)
- [x] Pasta com ícone e cor no banco (migração `0001`); escolha na tela de criar pasta fica para a etapa 8
- [x] Esqueletos navegáveis: Modelos, Agenda, Ajustes e Quadro
- [x] Galeria de componentes movida para `/dev/gallery` (só em desenvolvimento)
- [x] Conferir no iPhone: tab bar de vidro, busca, "+", folhas e Início com os dados reais
- [x] ~~Tela de primeira abertura pedindo o nome~~ → adiada para a etapa 12 (decisão do autor em 2026-10-28)

> As demais telas da seção 6 (detalhe do cartão, criar cartão, voz, automações) ganham View e ViewModel quando suas etapas chegarem, para não criar arquivos vazios antes da hora.

**Pronto quando:** for possível navegar por todas as telas, mesmo que ainda incompletas.

---

## Etapa 6 — Quadro kanban (o diferencial)

**Objetivo:** a tela principal com a movimentação mais fluida possível.

> Dividida em subetapas (decisão do autor em 2026-10-29), cada uma com o seu PR.

### 6.1 — Quadro real e reordenar na coluna
- [x] Tela do quadro com dados reais: título, "Pasta / N cartões" e colunas lado a lado com encaixe
- [x] Arrastar cartão na mesma coluna (segurar 300 ms), com os vizinhos deslizando
- [x] Cartão inclinado, maior e elevado durante o arraste, com espaço tracejado na origem (Figma)
- [x] Feedback tátil ao levantar, a cada troca de vaga e ao soltar (`expo-haptics`)
- [x] Rolagem automática da coluna perto das bordas
- [x] Gravar a nova ordem (só o cartão movido) e registrar no histórico
- [x] Chacoalhar para desfazer (antecipado da etapa 11)
- [x] "Adicionar cartão" provisório cria um cartão de exemplo (até o formulário da etapa 7)
- [x] Alternativa acessível: ações "Mover para cima/baixo" com anúncio da posição
- [x] Respeitar "Reduzir movimento"
- [x] Conferir no iPhone

### 6.2 — Entre colunas
- [x] Arrastar card entre colunas, com scroll automático nas bordas (horizontal)
- [x] Destino tracejado na coluna de chegada (Figma "Destino de arraste")
- [x] Alternativa acessível: ação "Mover para..." (escolher coluna e posição)
- [x] Ações do VoiceOver "Mover para a coluna anterior/próxima"
- [x] Desfazer devolve o cartão à coluna e à posição de antes
- [x] Conferir no iPhone

### 6.3 — Colunas
- [x] Criar, renomear e excluir colunas (com confirmação e desfazer)
- [x] Visual do "puxar para excluir" (adiantado em 2026-10-29): puxar a coluna para baixo e segurar 0,5 s enche um anel vermelho na lixeira e abre o alerta nativo. (exclusão de verdade ligada em 2026-11-02)
- [x] Ligar o "Excluir" do alerta à exclusão de verdade (com desfazer)
- [x] Menu nativo da coluna ("…"): Adicionar cartão, Mover para trás/frente, Duplicar e Excluir coluna (alternativa sem gesto)
- [x] Contador de cards por coluna e "+ Adicionar coluna"
- [x] Conferir no iPhone

### 6.4 — Reordenar colunas
- [x] Skeleton loading do quadro (enquanto carrega): 2 colunas com 4 e 3 cartões, shimmer no estilo do YouTube, sem tempo mínimo.
- [x] Menu "…" do topo do quadro (menu nativo, igual ao da coluna), adiado da 6.3. Ordem decidida (2026-11-02):
  - Grupo 1: Buscar lembrete · Selecionar cartões · Nova coluna ("Reorganizar colunas" saiu em 2026-11-09) (o "Filtrar…" saiu do menu em 2026-11-03: os filtros ficam na linha abaixo do título)
  - Grupo 2: Renomear quadro · Duplicar quadro · Mover para outra pasta
  - Grupo 3: Excluir quadro (vermelho, com desfazer)
  - [x] Renomear quadro (no título e no menu)
  - [x] Nova coluna (abre a folha "Nova coluna")
  - [x] Excluir quadro (alerta, volta para a tela anterior e desfazer)
  - [x] Duplicar quadro (cópia logo depois, na mesma pasta, com desfazer)
  - [x] Mover para outra pasta (folha com as pastas, fixação respeitando o limite, com desfazer)
  - [x] Modal "Filtrar" (centralizado): prazo, prioridade, etiquetas, concluídos e checklist pendente, com contagem ao vivo
  - [x] "Buscar lembrete" (lupa, 2026-11-10): campo de vidro no lugar do título, "X" fecha; busca no título e na descrição a cada letra; um resultado só faz o quadro rolar até ele
  - [x] Linha de filtros abaixo do título: atalhos (Hoje, Atrasados, Alta) e "Filtros"; com filtro, chips removíveis e "Limpar"
  - [x] Aplicar o filtro no quadro: todas as colunas sempre visíveis, só os cartões que passam; arraste pelo vizinho visível; aviso de cartão novo escondido; contador e subtítulo com os visíveis
- [x] Reordenar colunas segurando e arrastando
  - [x] Visual da coluna levantada: segurar o cabeçalho gira -3°, com borda `primary` e sombra elevada (Figma "Quadro · Reordenar colunas")
  - [x] Levantada numa camada por cima de tudo, com só os 4 primeiros cartões, seguindo o dedo nos dois eixos e com rolagem automática horizontal do quadro
  - [x] Vaga: as colunas deslizam para abrir espaço e a vaga tracejada "Solte para reorganizar" aparece do tamanho da coluna
  - [x] Trocar a coluna de lugar ao soltar (cópia assenta na vaga, quadro encaixa, ordem gravada com desfazer)
- [x] Alternativa acessível para reordenar colunas ("Mover para trás/frente" no menu da coluna, feito na 6.3)
- [x] Melhoria de performance do aplicativo (as medições ficaram para a etapa 6R)
  - [x] Objeto do arraste estável (o cartão segurado saiu dele) e ações com identidade fixa: segurar e soltar não redesenham mais todas as colunas e cartões
  - [x] Recarga do banco reaproveita as colunas e os cartões que não mudaram e junta os avisos do banco numa carga só
  - [x] Alturas dos cartões gravadas em lote (uma vez por quadro de animação)
  - [x] Animações de cada cartão dependem só dos valores que leem (antes rodavam a cada quadro do arraste, em todos os cartões)
  - [x] Montagem progressiva: uma coluna por quadro depois das 2 primeiras
  - Medição em build de release: foi para a etapa 6R
  - Virtualização e paginação da montagem: fora da v1 (decisão do autor, 2026-11-03), ver Roadmap no CLAUDE.md

### 6.5 — Seleção em lote
- [x] Modo "Selecionar cartões" (2026-11-09): bolinha em cada cartão, marcado em lavanda com borda roxa, topo com "N selecionados" e "Cancelar" de vidro, arraste desligado enquanto seleciona
- [x] "Selecionar todos" / "Limpar" ao lado da contagem de cada coluna (2026-11-09)
- [x] Barra de baixo com as ações em lote (2026-11-09): Mover (coluna ou outro quadro, numa folha só), Arquivar e Apagar, com desfazer
- [x] Tela da pasta: botões da barra de seleção visíveis e apagados sem seleção, como no quadro (2026-11-10)
- [x] "Arquivados" no "…" do quadro (abaixo de "Nova coluna", 2026-11-09): tela provisória com os cartões arquivados numa coluna só de leitura
- [x] Arraste em lote "pilha", como no Fotos do iOS (plano de 2026-11-10): com cartões marcados, segurar um junta os outros embaixo dele (no máximo 5 à mostra, ângulos alternando 3°: -5°, -2°, -8°, +1°, -11°), a pilha segue o dedo e cai junta na vaga; soltar em outra coluna sai da seleção com desfazer; soltar na própria coluna cancela (os cartões voltam voando e a seleção continua)
  - [x] Parte 1 — Modelo: `moveCards` aceita a vaga (`nextId`), `withCardsMoved` (otimista), `toFullIndexExcluding` (vaga com filtro) e `useBatchMove` (`moveSelectionTo`: segurado primeiro, uma ação no histórico, fecha a seleção)
  - [x] Parte 2 — Estado da pilha na UI thread (`useBatchDrag`, em `drag.batch`: ids da pilha, total, posições de partida, progresso do voo, coluna e vaga de origem), token `batchStack` no `motion.ts` e contas puras em `model/batchStack.ts` (`stackedIds`, `stackRotation`)
  - [x] Parte 3 — Gesto na seleção: segurar só nos marcados (`isDragEnabled`); os outros medem de onde saem (`useBatchOrigin`) e saem da ordem das colunas na UI thread (`useBatchColumnOrder`, `liftedIds`), que fecham o espaço; o soltar do segurado vira o movimento do lote (`dropCard` no `useBatchMove`)
  - [x] Parte 4 — Visual: `DragStack` (até 4 cópias embaixo do segurado, voo de 220 ms só dos cartões à vista; os de fora da tela aparecem com fade), toque tátil ao juntar e "Reduzir movimento" (sem voo nem giro). Sem bolinha do total, e as bolinhas de seleção somem durante o arraste (decisão do autor, 2026-11-10)
  - [x] Parte 5 — Vaga e rolagem: vaga com a altura do segurado e a rolagem automática de hoje. Soltar a pilha na "Adicionar coluna" (que volta a aparecer durante a pilha, com "Solte para criar uma coluna com estes cartões") abre a folha "Nova coluna" com todos os marcados, na ordem em que foram marcados (pedido do autor, 2026-11-10)
  - [x] Parte 6 — Soltar: em outra coluna, assenta e grava; **na própria coluna do segurado, em qualquer vaga, cancela** (decisão do autor, 2026-11-10: voo de volta, nada gravado, seleção continua). O segurado do lote assenta sem quique (só desliza, 150 ms), e as cópias têm o visual de marcado. A mola de assentar (`dragSpring`) ganhou `energyThreshold: 1e-6`: o padrão do Reanimated arrastava a cauda por ~3,5 s e a cópia ficava por cima
  - Partes 7 e 8 (casos de borda e textos): foram para a etapa 6R

> **Pendências passadas para a etapa 6R (decisão do autor, 2026-11-10):** Partes 7 e 8 do arraste em lote, a tela "Arquivados" no Figma, os testes do ViewModel do quadro, a conferência com o VoiceOver e as medições de desempenho.

**Pronto quando:** as funcionalidades do quadro estiverem feitas; o que falta conferir e medir segue na etapa 6R.

---

## Etapa 6R — Refac / Perform

**Objetivo:** fechar as pendências da etapa 6, medir o desempenho de verdade e só então organizar o código que cresceu, sem misturar com funcionalidade nova.

> **Branch própria (decisão do autor, 2026-11-10):** a refatoração e as medições são feitas numa branch separada da `feat/kanban-board`. Antes de criar a branch, decidir com o autor se as pendências da seção 1 entram ainda na `feat/kanban-board`.

> **Ordem desta etapa:** 1. pendências da etapa 6 → 2. desempenho → 3. refatoração (por último).

> 🔔 **Lembrete do autor: medir o desempenho ANTES de refatorar.** Faça a seção 2 e registre os números antes da seção 3: eles são a base para comparar depois de cada refatoração e para decidir, arquivo por arquivo, se vale a pena mexer.

### 1. Pendências que vieram da etapa 6
- [x] Arraste em lote, Parte 7 — casos de borda: filtro e busca (conferidos pelo autor em 2026-11-10), recarga do banco no meio do arraste e gesto interrompido pelo sistema (os cartões voltam às colunas e a seleção continua; conferidos pelo autor em 2026-11-11)
- [x] Arraste em lote, Parte 8 — decisões da pilha registradas no CLAUDE.md. Sem anúncio do VoiceOver nem dica no topo (decisão do autor, 2026-11-11): a pilha é só gesto, e a alternativa acessível é o botão "Mover" da barra de ações em lote
- [x] Tela "Arquivados" (2026-11-11, pedido do autor): busca, desarquivar ao segurar e o "…" com Buscar, Selecionar (Desarquivar/Apagar em lote), Filtrar, Ordenar e Apagar todos
- [x] Arquivados, Variação B, etapa 1 (2026-11-21): seções recolhíveis por coluna de origem e a linha "Arquivado …" no cartão
- [ ] Arquivados, Variação B, etapa 2: folha "Cartão arquivado" (só leitura, "Desarquivar em <coluna>" e "Apagar")
- [x] Conferir todas as ações do quadro pelo VoiceOver (conferido pelo autor em 2026-11-13; o TalkBack fica para quando o Android voltar)
- Testes do ViewModel do quadro: passaram para a etapa 14 (os testes automatizados continuam adiados)

### 2. Desempenho (sempre em build de release: `npx expo run:ios --configuration Release --device`)
> Criar os quadros grandes antes, no build de desenvolvimento (Ajustes, só em `__DEV__`): os dados continuam no aparelho no Release.
- [x] Arraste de um cartão: fluido até ~300 cartões (10 × 40, superlotado) e sem travar nem fechar com 2.000 (20 × 100)
- [x] 60fps em build de release com ~300 cartões num aparelho intermediário
- [x] 🔔 **Lembrete do autor:** testar o desempenho do **arraste em lote (pilha)** em quadros grandes: juntar, mover a pilha com a rolagem automática, soltar em outra coluna e cancelar na própria coluna
- [x] 🔔 **Lembrete do autor:** testar o desempenho do **modo "Selecionar"** em quadros grandes: entrar e sair do modo, marcar e desmarcar, "Selecionar todos" / "Limpar" da coluna e as ações em lote (Mover, Arquivar, Apagar)
- [x] Modo "Selecionar" no 40×10 (2026-11-11): seleção levada para a UI thread e, na investigação, achado o vazamento geral: `drag`/`columnDrag` perdiam a identidade (callbacks do VM sem `useStableCallback` e bailouts do React Compiler em `SortableColumn` e `useColumnReorder`), redesenhando os 400 cartões a cada render do quadro. Detalhes no CLAUDE.md (6.4, performance)
- [x] `npm run compiler:check -- <arquivo>` rodado antes e depois da refatoração, sem bailouts (vale como regra daqui em diante, ver CLAUDE.md)
- [x] Medições em Release conferidas pelo autor no aparelho (2026-11-13), sem números anotados; o que mudou está no CLAUDE.md (6.4, performance)

### 3. Refatoração dos arquivos acima de ~200 linhas (por último)
- [x] 🔔 **Antes de começar, perguntar ao autor, arquivo por arquivo, se vale a pena refatorar ou se é melhor deixar como está por causa do desempenho.** Parte desses arquivos é o caminho quente do arraste (worklets e mappers da UI thread): dividir pode criar objetos ou dependências novas nos worklets e piorar o arraste. Medir antes e depois de cada refatoração.
- Alvos (contagem de 2026-11-10; decisões do autor em 2026-11-13):
  - [x] `features/board/viewmodel/useBoardViewModel.ts` (298 → 97): carga dos dados em `useBoardData`, ações de cartão em `useCardActions`, seleção e arraste em lote em `useBoardSelection`
  - [x] `features/board/view/BoardScreen.tsx` (381 → 210): `BoardScreenHeader`, `BoardSelectionToolbar`, `BoardColumnList`, `useBoardConfirms`, `useBoardFocus` e `useStagedColumns`; o que sobrou é a ligação do `useBoardDrag`, que precisa ficar na tela
  - [x] `features/board/viewmodel/useColumnActions.ts` (227 → 177): apagar coluna em `useDeleteColumn` (mesmo formato de `useDeleteBoard`/`useDeleteFolder`, com o alerta pronto); corrigido também um bailout do React Compiler (`?.`/`??` dentro de try/catch), que deixava o hook sem memoização nenhuma
  - [x] `features/history/model/actionHistory.ts` (228 → 89): o `applyUndo` (e `UndoRepositories`) foi para `applyUndo.ts`
  - [x] `features/board/model/cardFilter.ts` (188 → 160): `toFullIndex`/`toFullIndexExcluding` (vaga do arraste com filtro) foram para `reorder.ts`
  - Mantido de propósito (decisão do autor, 2026-11-13): `SortableColumn.tsx` (290), caminho quente, sem refatorar o cabeçalho
  - Mantidos de propósito (caminho quente do arraste, lógica amarrada na UI thread): `useBoardDrag.ts` (301), `SortableCard.tsx` (286), `useSortableColumn.ts` (223)
  - Mantidos de propósito (coesos ou fora do app publicado): `pt-BR.ts` (textos num lugar só, REGRAS.md), `cardRepository.ts` (223), `boardData.ts` (201), `devDataService.ts` (243, só desenvolvimento)

**Pronto quando:** as pendências da seção 1 estiverem resolvidas, as medições passarem em build de release e cada arquivo da lista tiver a decisão do autor (refatorado ou mantido de propósito).

---

## Etapa 7 — Card completo

**Objetivo:** o detalhe do card com todos os campos.

> **Decisões do autor (2026-11-13):** o detalhe é uma **tela cheia**, como no Figma ("Cartão · Proposta para a Marina", node `3:45511`; começou como folha e virou tela no mesmo dia). "Criar cartão" continua em **folha nativa** (o Figma a desenha em tela cheia: "Criar cartão · Texto ou voz", node `3:45582`). Salva **na hora**, sem botão "Salvar", e cada edição entra no histórico. Sem skeleton. Fotos com `expo-image-picker` e `expo-image-manipulator`. O lembrete ("Lembrete às 9:45", do Figma) fica para a etapa 9.

**Partes (ordem de construção):**
- [x] Parte 1 — Modelo: carregar o detalhe (cartão, coluna, quadro, pasta, etiquetas, checklist, anexos), repositório de anexos e as operações novas do histórico (checklist)
- [x] Parte 2 — Tela do detalhe: tocar no cartão abre (fora do modo "Selecionar"); título e descrição editáveis, chips de etiquetas, prioridade e prazo, status (coluna, abre a folha "Mover para…") e o "…" (Mover, Arquivar, Apagar)
- [x] Parte 3 — Prioridade (menu nativo) e etiquetas (escolher as do quadro e criar uma nova com nome e cor)
- [x] Parte 4 — Data e horário (DatePicker do `@expo/ui`) e remover o prazo
- [x] Parte 5 — Checklist: adicionar, marcar, renomear e apagar itens, com a barra de progresso
- [x] Parte 6 — Fotos: instalar as bibliotecas, textos de permissão, tela curta explicando antes do pedido, câmera e galeria, sem EXIF de localização, miniatura, ver e apagar
- [x] Foto de capa no post-it do quadro (2026-11-21): a primeira foto vira capa, "Usar como capa"/"Tirar da capa" no "…" da foto
- [x] Barra de progresso do checklist animada (2026-11-21)
- [ ] Parte 7 — Prazo visual nos cartões do quadro (conferir com a seção 5.3 do CLAUDE.md)
- [ ] Parte 8 — Folha "Criar cartão" (substitui o cartão de exemplo do "Adicionar cartão"); o microfone fica para a etapa 10

**Tarefas (marcadas conforme as partes terminam):**
- [x] Tela/bottom sheet de detalhe do card
- [x] Título e descrição
- [x] Etiquetas coloridas
- [x] Prioridade
- [x] Data e horário
- [x] Checklist de subtarefas com barra de progresso
- [x] Anexar foto pela câmera ou galeria (permissão just-in-time, sem EXIF de localização, miniatura)
- [x] Trocar a coluna/status
- [ ] Indicador visual de prazo nos cards (normal, próximo, vencido)
- [ ] Tela Criar card
- [ ] Testes do ViewModel

**Pronto quando:** todos os campos da seção 5.2 do `CLAUDE.md` funcionarem e forem salvos, e o app continuar funcionando se a permissão de câmera for negada.

---

## Etapa 8 — Pastas e templates

**Objetivo:** organizar vários quadros e começar rápido.

- [ ] Criar, renomear e excluir pastas
  - [x] Tela da pasta (`/folder/[folderId]`, aberta pelo "+N quadros" da Início): todos os quadros em grade, busca pelo nome, "Novo quadro" no fim, renomear no título e no "…", estado vazio e skeleton (adiantado em 2026-11-03)
  - [x] "Apagar" pasta no "⋮" da Início e no "…" da tela da pasta, com confirmação e desfazer (adiantado em 2026-11-11: o item existia mas não fazia nada)
  - [ ] Segurar e arrastar para reordenar os quadros na tela da pasta
- [ ] Pastas arquivadas (pedido do autor, 2026-11-03)
  - [ ] Opção "Arquivar" no "⋮" da pasta (Início) e no "…" da tela da pasta; a pasta arquivada sai da Início (e das fixadas)
  - [ ] Botão de arquivados na Início: ícone ao lado da contagem de pastas ("Minhas pastas · N pastas"), que abre a tela das pastas arquivadas
  - [ ] Tela das pastas arquivadas: ver os quadros, desarquivar e excluir (perguntar sobre skeleton antes de implementar)
- [ ] Criar, renomear, mover e excluir quadros
  - [x] Criar quadro pelo "+" da pasta (folha "Novo quadro", já com "Pendentes" e "Concluídas")
  - [x] Excluir quadro segurando o quadro na tela da pasta (alerta de confirmação e desfazer)
- [ ] Templates prontos (Estudos, Tarefas da semana, Projeto pessoal, Viagem)
- [ ] Criar template personalizado a partir de um quadro
- [ ] Testes

**Pronto quando:** for possível criar um quadro novo a partir de um template e salvar um quadro próprio como template.

---

## Etapa 9 — Notificações e calendário

**Objetivo:** lembretes no horário certo e cards no calendário.

- [ ] Tela de explicação antes de pedir permissão de notificações
- [ ] Agendar, atualizar e cancelar notificações locais conforme o card
- [ ] Tela Calendário: visões mensal e semanal com mini post-its
- [ ] Tela de explicação antes de pedir permissão de calendário
- [ ] Sincronização com o calendário do celular (começa desligada)
- [ ] Ao desativar a sincronização, oferecer remover os eventos criados pelo app
- [ ] Testes

**Pronto quando:** o lembrete tocar no horário, os cards aparecerem no calendário do app e do celular, e o app funcionar normalmente com as permissões negadas.

---

## Etapa 10 — Agendamento por voz com IA

**Objetivo:** criar um card falando, sempre com confirmação do usuário.

- [ ] Decidir o serviço de reconhecimento de voz, o serviço de IA e onde roda o backend, e registrar na seção 9 do `CLAUDE.md`
- [ ] Backend para a chamada à IA (chave fora do app)
- [ ] Interface do serviço de voz/IA no Model, com mock para testes
- [ ] Tela de explicação antes de pedir permissão de microfone
- [ ] Tela de voz: microfone, onda sonora, transcrição
- [ ] Interpretação da resposta da IA com validação (título, descrição, data/horário, coluna)
- [ ] Prévia do card com "Confirmar" e "Editar"
- [ ] Em caso de erro, preencher o card manualmente
- [ ] Não guardar o áudio depois do uso
- [ ] Registrar o serviço na tabela de SDKs da seção 12 do `CLAUDE.md`
- [ ] Testes da interpretação da resposta

**Pronto quando:** uma frase como "Me lembra de estudar amanhã às 14h" gerar a prévia correta, e nada for salvo sem a confirmação do usuário.

---

## Etapa 11 — Automações e desfazer

**Objetivo:** menos trabalho manual e liberdade para errar.

- [ ] Tela de automações da coluna
- [ ] Regra: ao mover para Concluído, marcar todo o checklist
- [ ] Regra: arquivar concluídos após X dias
- [x] Shake to undo usando o histórico de ações (antecipado na etapa 6.1, 2026-10-29: acelerômetro + histórico global)
- [x] Snackbar após mover: dica do chacoalhar na primeira vez; botão "Desfazer" sempre, para quem desligou o "Agitar para Desfazer" do iPhone
- [ ] Toggle "Desfazer ao chacoalhar" em Ajustes (etapa 12)
- [ ] Testes das automações e do desfazer

**Pronto quando:** as automações rodarem corretamente, e mover, editar ou excluir puderem ser desfeitos tanto chacoalhando quanto pelo botão.

---

## Etapa 12 — Configurações e privacidade

**Objetivo:** cumprir as regras da seção 12 do `CLAUDE.md` dentro do app.

- [ ] 🔔 **Lembrete:** tela de primeira abertura pedindo o nome ou apelido da saudação (adiada da etapa 5). Hoje o nome está fixo ("Enzo") no `useHomeViewModel`. Guardar só no aparelho, incluir em "Apagar todos os meus dados" e citar na política de privacidade
- [ ] Notificações (ativar e desativar)
- [ ] Sincronização do calendário
- [ ] Desfazer ao chacoalhar (ativar e desativar)
- [ ] Política de privacidade
- [ ] Termos de uso
- [ ] Sobre (desenvolvedor, contato e versão)
- [ ] Licenças de código aberto
- [ ] Exportar dados (JSON)
- [ ] Apagar todos os meus dados (com confirmação)
- [ ] Revisar textos de permissão nativos em português

**Pronto quando:** todos os itens do resumo da seção 12 do `CLAUDE.md` estiverem disponíveis em Configurações, sem nenhuma opção de tema ou cor.

---

## Etapa 13 — Widgets e Live Activities

**Objetivo:** o app presente fora dele, com código nativo.

- [ ] Cores do widget centralizadas em um arquivo por plataforma, espelhando os tokens
- [ ] Compartilhar os dados dos próximos cards com o widget
- [ ] Widget iOS (pequeno e médio)
- [ ] Widget Android (pequeno e médio)
- [ ] Live Activity / Dynamic Island para card com prazo próximo
- [ ] Widget atualizando quando os cards mudam

**Pronto quando:** o widget mostrar os próximos cards nas duas plataformas, e a Live Activity aparecer para um card com prazo próximo, no estilo pastel do app.

---

## Etapa 14 — Polimento, testes e publicação

**Objetivo:** um app pronto para as lojas e para o portfólio.

- [ ] Revisão de performance em build de release
- [ ] Skeleton loading das telas da tab bar (Início, Modelos, Agenda, Ajustes e Busca), no padrão do quadro (pedido do autor, 2026-11-09)
- [ ] Testes do ViewModel do quadro (vieram da etapa 6R; a base de testes já existe desde 2026-11-16)
- [ ] Teste completo com VoiceOver e TalkBack
- [ ] Teste com fonte grande do sistema e "Reduzir movimento"
- [ ] Revisão do tom amigável em todos os textos
- [ ] Privacy Manifest, Rótulos de privacidade (App Store) e Segurança dos dados (Google Play)
- [ ] Classificação etária
- [ ] Ícone do app, splash screen e prints para as lojas
- [ ] Descrição das lojas sem promessas exageradas
- [ ] README final com GIFs, arquitetura MVVM e decisões técnicas
- [ ] Checklist "antes de publicar" da seção 12 do `CLAUDE.md` concluída
- [ ] Publicar nas lojas

**Pronto quando:** o app estiver publicado e o README pronto para mostrar no portfólio.

---

## Depois da v1

Ver a seção 10 do `CLAUDE.md`: pet/mascote, tema claro/escuro e cores personalizáveis.
