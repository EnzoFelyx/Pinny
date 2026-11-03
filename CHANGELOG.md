# Changelog

Todas as mudanças do Pinny, da mais recente para a mais antiga, agrupadas por etapa do `todo.md`.
Cada item indica o commit em que entrou, para conferir no histórico do git (`git show <hash>`).

Formato baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Tipos: **Adicionado**, **Alterado**, **Corrigido**, **Removido**, **Infraestrutura** e **Documentação**.

---

## 2026-11-03 — Etapa 6.4 (filtro no quadro)

### Alterado

- Linha de filtros do quadro (entre o título e as colunas): sem filtro, atalhos de um toque ("Hoje", "Atrasados", "Alta") e "Filtros", que abre o modal; com filtro, um chip removível ("x") por filtro ligado e "Limpar". Sai a lupa e os chips "Todos os cartões" e "Por prazo". Os chips já ligam e desligam o filtro guardado, mas o quadro ainda não esconde os cartões. (`e501f17`)
- O filtro passou a valer no quadro: todas as colunas continuam, só com os cartões que passam; coluna esvaziada pelo filtro mostra "Nenhum cartão com esses filtros."; contador da coluna e subtítulo ("3 de 8 cartões") contam os visíveis. O arraste funciona com filtro ligado (a vaga visível vira a posição logo depois do vizinho visível). Cartão novo escondido pelo filtro mostra um aviso. O filtro vale só enquanto o quadro está aberto. (`e501f17`)
- Performance do filtro: os cartões escondidos continuam montados (só ficam invisíveis), então ligar e limpar o filtro não monta nem desmonta centenas de cartões; a troca roda em segundo plano (transição do React), e o skeleton aparece por cima das colunas se ela demorar mais de 150 ms. (`e501f17`)
- Trocar o filtro no meio do quique de um cartão: o quique acaba na hora; se o filtro esconde o cartão, ele some, senão vai direto para o lugar novo (antes aparecia no lugar errado e sumia). (`e501f17`)
- Renomear quadro saiu do ViewModel do quadro para `useBoardRename` (arquivo abaixo de ~200 linhas). (`e501f17`)
- Espaço entre o cabeçalho do quadro e a linha de filtros: 24pt (antes 20). (`e501f17`)
- Menu "…" do quadro: "Filtrar…" saiu (os filtros ficam na linha abaixo do título) e entrou "Buscar lembrete", com lupa, ainda sem ação. (`e501f17`)

---

## 2026-11-03 — Etapa 6.4 (modal de filtros)

### Adicionado

- Modal "Filtrar" (centralizado, aberto pelo "Filtrar…" do menu do quadro), seguindo o Figma "Filter panel open": prazo (Todos, Atrasados, Hoje, Próximos 7 dias, Sem prazo), prioridade, etiquetas do quadro, "Mostrar concluídos" e "Checklist pendente", com "Limpar" e "Mostrar N cartões" contando ao vivo. As regras do filtro são funções puras (`cardFilter.ts`). Ainda não esconde os cartões no quadro. (`da06653`)

---

## 2026-11-03 — Etapa 6.4 (menu e título do quadro)

### Adicionado

- Menu "…" do topo do quadro (menu nativo do iOS) em três grupos: Filtrar…, Selecionar cartões, Nova coluna, Reorganizar colunas · Renomear quadro, Duplicar quadro, Mover para outra pasta · Excluir quadro. Só "Renomear quadro" funciona por enquanto. (`f3aff4f`)
- Renomear o quadro direto no título (tocar no nome ou "Renomear quadro" no menu), com desfazer ("Renomeação de Quadro"). (`f3aff4f`)

### Alterado

- Botões de vidro (voltar, "…" e o "+" da Início) com 40pt e ícone de 20 (antes 45 e 22), mantendo a área de toque de 44pt. (`f3aff4f`)
- Título do quadro em 20 (token `header-title`, antes 22) e mais espaço entre o topo da tela e o cabeçalho (16pt, antes 8). (`f3aff4f`)
- A edição de título no lugar virou um hook compartilhado (`useInlineRename`), usado pela coluna e pelo quadro. (`f3aff4f`)

### Documentação

- Meta de desempenho da v1 definida: fluido até ~300 cartões por quadro num aparelho intermediário e sem travar com milhares. A virtualização (cartões e colunas) saiu da v1 e foi para o Roadmap (`CLAUDE.md`, `REGRAS.md` e `todo.md`).

---

## 2026-11-02 — Etapa 6.4 (performance)

### Adicionado

- Opção de desenvolvimento em Ajustes (só em `__DEV__`) para criar um quadro "superlotado" e testar a performance: 10 × 40 ou 20 × 100 cartões, com etiquetas, prioridades, prazos e checklists, gravados numa única transação. (`0aa3e71`)

### Alterado (performance do quadro)

- O objeto do arraste repassado às colunas e aos cartões tem identidade fixa: o cartão segurado saiu dele, e as ações do ViewModel passam por `useBoardActions` / `useStableCallback`. Segurar e soltar não redesenham mais o quadro inteiro. (`8ea4bff`)
- As animações de cada cartão dependem só dos valores que leem. Antes capturavam o objeto do arraste inteiro e rodavam a cada quadro, em todos os cartões. (`8ea4bff`)
- A recarga do banco reaproveita as colunas e os cartões que não mudaram (`toColumnItems`). (`8ea4bff`)
- As alturas dos cartões são gravadas em lote, uma vez por quadro de animação (`useHeightBatch`). (`8ea4bff`)
- Montagem progressiva: depois das 2 primeiras colunas, entra uma coluna por quadro. (`8ea4bff`)
- Excluir coluna: a coluna some da tela na hora, antes de gravar, e volta se a gravação falhar. O retrato dos cartões para o "Desfazer" passou a usar 3 consultas no total, em vez de 3 por cartão (o mesmo vale para "Duplicar coluna"). Desfazer a exclusão recria todos os cartões numa transação só. (`85045e9`)
- Duplicar coluna e desfazer exclusão gravam os cartões com um INSERT por tabela (em lotes), em vez de até quatro por cartão. (`85045e9`)

### Corrigido

- Os avisos de mudança do banco (um por linha alterada) viram uma recarga só, 50 ms depois do último (`db/changes.ts`), para o quadro, a Início e a Busca. Antes, duplicar uma coluna de 40 cartões recarregava cada tela ~80 vezes (3 a 5 s travado). (`85045e9`)
- Coluna que entra no meio do quadro (duplicada ou devolvida pelo "Desfazer") não desmonta mais a última coluna por um quadro: a montagem progressiva só vale na abertura. (`8ea4bff`)

### Documentação

- `todo.md`: item de performance detalhado, com o lembrete da virtualização e da paginação da montagem (cartões por coluna e colunas).
- `CLAUDE.md`: regras de performance do quadro (nunca capturar `drag`/`column` inteiro em worklets de animação).
- `todo.md`: refatoração do `useBoardDrag.ts` (252 linhas) como item pendente da 6.4.
- Este `CHANGELOG.md`, com todo o histórico desde 2026-10-26.

---

## 2026-11-02 — Etapas 6.3 e 6.4

### Adicionado

- **Skeleton loading do quadro**, com shimmer no estilo do YouTube: uma faixa de brilho contínua entre todas as barras, parada com "Reduzir movimento". Mostra o título, 2 filtros e 2 colunas com 4 e 3 cartões. Componentes reutilizáveis `SkeletonGroup` / `SkeletonBar`. (`0ed204a`)
- Transição cruzada do skeleton para o conteúdo e montagem das colunas em duas etapas. (`0ed204a`)
- Soltar um cartão na coluna "Adicionar coluna" abre a folha "Nova coluna" e leva o cartão para ela. Desfazer volta tudo numa ação só. (`49449b4`)
- **Criar coluna:** coluna "fantasma" tracejada no fim do quadro, com a folha nativa de nome. O quadro rola até a coluna nova. (`39a7966`)
- **Renomear coluna** direto no título (lápis ou nome), com desfazer. (`39a7966`)
- **Excluir coluna** (puxar e segurar, ou pelo menu) junto com os cartões. O alerta mostra quantos cartões vão junto, e desfazer restaura tudo. (`39a7966`)
- **Menu nativo da coluna** (`@expo/ui`): adicionar cartão, mover para trás/frente, duplicar e excluir. (`39a7966`)
- Cinco variações de estado vazio (ilustração + legenda), sem repetir entre colunas. (`39a7966`)
- `NameSheet` compartilhado entre as folhas de pasta e de coluna. (`39a7966`)

### Alterado

- Campo de texto em foco: só a borda e o ícone mudam de cor. (`39a7966`)
- Título das folhas com um pouco mais de espaço no topo. (`49449b4`)
- **Refatoração:** módulos do arraste divididos em arquivos de até ~200 linhas (`useDragValues`, `useBoardScroll`, `useDragSettle`, `useColumnAutoScroll`, `ColumnFooterArea`, `useCardAccessibilityActions`, `useInListBounce`, `cardSnapshots`). (`49449b4`)

### Corrigido

- O quique ao soltar não vaza mais por cima do quadro quando a coluna rola no meio dele. (`49449b4`)
- Renomear coluna não mostra mais o nome antigo por um instante. (`49449b4`)
- Aviso `WorkletEventHandler`: o manipulador de rolagem do quadro fica fora dos worklets. (`0ed204a`)

### Documentação

- Lembrete fixo no `todo.md` de perguntar sobre skeleton em toda tela nova que carrega dados. (`0ed204a`)

---

## 2026-10-30 — Etapa 6.2

### Adicionado

- **Arrastar cartões entre colunas:** o cartão segue o dedo nos dois eixos, a coluna de destino abre a vaga preenchida e a de origem fecha o espaço. (`a91b61a`)
- Rolagem lateral automática perto das bordas da tela e encaixe na coluna onde o cartão caiu. (`a91b61a`)
- Ações do VoiceOver "Mover para a coluna anterior/próxima" e a folha nativa "Mover para...". (`a91b61a`)
- Desfazer devolve o cartão à coluna e à posição anteriores. (`a91b61a`)
- Topo do quadro no layout do Figma: voltar, título e "…" na mesma linha, filtros e busca (só visual por enquanto), contador ao lado do menu da coluna e "Solte para reorganizar" na vaga. (`9332093`)

### Alterado

- Cartão arrastado inclinado -5° (anti-horário), como no Figma. (`9332093`)
- Botões de vidro reduzidos para 45pt no app inteiro. (`9332093`)
- Colunas vazias mantêm o tamanho ao receber um cartão. Puxar a coluna para baixo move a coluna inteira. (`a91b61a`)

### Corrigido

- O manipulador de rolagem da coluna fica fora dos worklets (aviso de cópia). (`4d1cc66`)

---

## 2026-10-29 — Etapa 6.1

### Adicionado

- **Quadro com dados reais:** colunas lado a lado, rolagem da coluna inteira com cabeçalho fixo. (`b50794f`)
- **Reordenar cartões** segurando e arrastando, na UI thread (Gesture Handler 3 + Reanimated 4): cópia inclinada por cima de tudo, vaga tracejada, vibração, rolagem automática e quique ao soltar. Respeita "Reduzir movimento". (`b50794f`)
- Só o cartão movido é gravado (posição decimal). Ações acessíveis "Mover para cima/baixo". (`b50794f`)
- **Desfazer ao chacoalhar:** histórico global de desfazer/refazer com o alerta nativo do iOS, respeitando o "Agitar para Desfazer" do sistema (módulo Expo local em Swift). Snackbar de dica no primeiro movimento. (`b50794f`)
- Puxar e segurar a coluna para excluir (só visual nesta etapa). (`b50794f`)
- Tabela de preferências (migração `0002`) e criação de cartão de exemplo para testes. (`b50794f`)

### Documentação

- Decisões de arraste, desfazer e preferências registradas; etapa 6.1 fechada. (`dbee68a`)

---

## 2026-10-28 — Etapas 4 e 5

### Adicionado

- **Navegação com Native Tabs** e Liquid Glass, com ícones vetoriais pré-coloridos (config plugin). (`a6df4a9`)
- Aba de busca com a barra nativa, para pastas e quadros. (`a6df4a9`)
- Tela Início com saudação, botão "+" de vidro e pastas com quadros. (`a6df4a9`)
- Folhas nativas do iOS para criar e renomear pasta. (`a6df4a9`)
- Ícone e cor da pasta (migração `0001`) e recarga automática quando o banco muda. (`a6df4a9`)
- Esqueletos das telas de quadro, modelos, agenda e ajustes; galeria de desenvolvimento em `/dev/gallery`. (`a6df4a9`)
- **Camada de dados local-first:** `expo-sqlite` + Drizzle (pastas, quadros, colunas, cartões, etiquetas, checklist e anexos), validação Zod em toda leitura, repositórios atrás de interfaces, posições decimais, retrato do cartão ao excluir, histórico de ações, status de prazo e tela de erro amigável nas migrações. (`325a2e5`)

### Removido

- `@gorhom/bottom-sheet`, trocado pelas folhas nativas. (`a6df4a9`)

### Documentação

- Decisões de dados e navegação registradas; etapas 4 e 5 fechadas. (`5985c9f`, `ab3059d`)
- PRs #2 e #3 mergeados na `main`. (`a1040c0`, `999b822`)

---

## 2026-10-27 — Etapas 0 a 3

### Adicionado

- **Biblioteca de componentes:** Button, Fab, Chip, Label, PriorityChip, Checkbox, Toggle, ProgressBar, Input, BottomSheet, Card, Column, EmptyState e Snackbar, com ícones Lucide e o hook `useReducedMotion`. (`f4267e4`)
- **Tema:** paleta e tokens semânticos (com ajustes de contraste AA), sombras, escala tipográfica, tokens de animação, fonte Nunito embutida (licença OFL) e NativeWind 4 lendo só `src/theme`. (`3ed91ce`)

### Infraestrutura

- Template do Expo limpo e pastas MVVM criadas. Bundle id `com.enzofelyx.pinny`, só tema claro. (`28bf4f4`)
- ESLint e Prettier com as regras do projeto (sem cor solta, sem estilo inline, sem `any`, sem `console.log`). (`b7dc680`)

### Documentação

- Paleta do Figma registrada, iOS first e testes adiados. Etapas 0 a 3 fechadas. (`f176063`, `1b47bc6`, `8f58b84`, `6bcb757`)
- PR #1 mergeado na `main`. (`041e28b`)

---

## 2026-10-26 — Ferramentas

### Infraestrutura

- ECC (Everything Claude Code) instalado e enxugado para o escopo React Native. A pasta `.claude/` saiu do git. (`b7845f1`, `be78b58`, `8b1b1b2`, `c4fc836`, `5d39d28`)

### Documentação

- Reinstalação do ECC apontando para o repositório `ecc-rn-setup`. (`85f495a`)
