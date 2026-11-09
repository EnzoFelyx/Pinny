# CLAUDE.md — Contexto do projeto

> Este arquivo reúne tudo o que já foi decidido sobre o aplicativo. Leia-o inteiro antes de qualquer tarefa.
> Sempre que uma decisão nova for tomada, atualize este arquivo.

## ⚠️ Regras de código obrigatórias

Antes de escrever, alterar ou revisar qualquer código, siga as regras do arquivo abaixo (MVVM, cores centralizadas, nada de cor hardcoded, zero duplicidade e boas práticas):

@REGRAS.md

---

## 1. Visão geral

App mobile de **organização pessoal no estilo quadro kanban** (parecido com o Trello), pensado como um **mural de post-its amigável**.

É o **projeto de portfólio** do autor, um desenvolvedor mobile focado em **React Native + TypeScript**. Por isso, o app precisa mostrar domínio de React Native **do básico ao avançado**, usando as principais tendências do mercado mobile.

### Diferencial principal

A **movimentação suave de cards**, dentro de uma coluna e entre colunas, com a mesma fluidez de um kanban no desktop. Animações e gestos são o coração do produto e devem ter qualidade alta (60fps, feedback tátil, sem travamentos).

### Tom do produto

- **Amigável, acolhedor e leve.** Nada corporativo ou frio.
- Linguagem próxima e gentil nos textos do app.
- Todo o texto da interface em **português do Brasil**.
- **Termo "card":** no código (nomes, tipos, arquivos) usa-se `card`; em todo texto que o usuário vê, usa-se **"cartão"** (ex.: "Adicionar cartão", "Mover 2 cartões").

---

## 2. Nome do app: **Pinny** ✅

O nome do app é **Pinny** (decidido).

### Observações sobre o nome

- Já existe o **Pinny Notes**, um app open-source de sticky notes **só para Windows** (pequeno, cerca de 115 estrelas no GitHub). É da mesma categoria, então há algum risco de confusão.
- Também existem uma extensão do Firefox chamada Pinny (sem relação com notas) e o app "Piny" (cliente do Pinterest para Windows).
- Antes de publicar, **confira manualmente a disponibilidade na App Store e na Play Store**. Se houver conflito, variações possíveis: **Pinny Board**, **Pinny Notas**, **Pinni** ou **Pinnie**.

### No código

- Defina o nome em **um único lugar** (ex.: `app.json`/`app.config.ts` do Expo e uma constante no `src/i18n/pt-BR.ts`). Não espalhe "Pinny" escrito à mão em vários arquivos, para facilitar uma eventual troca.

---

## 3. Escopo da primeira versão (v1)

### ❌ Fora da v1 (decisão explícita)

- **Tema claro/escuro:** não haverá modo escuro nem alternância de tema. O app tem **apenas tema claro**.
- **Troca de cor das colunas:** todas as colunas têm a **mesma cor neutra**. Não há opção para personalizar a cor de uma coluna.
  - **Exceção (2026-10-28): pastas.** Ao criar uma pasta, o usuário escolhe o **ícone** e a **cor** (um dos 5 acentos). A tela de escolha entra na etapa 8; até lá, as pastas usam `folder` e `lavender`.
- **Pet/mascote:** o mascote que reage às interações fica para depois. Não implemente nada dele agora.

Também **não crie opções de tema ou cores na tela de Configurações**.

> Mesmo fora do escopo, vale manter as cores centralizadas em tokens (ver seção 4). Assim, tema escuro e cores customizáveis podem entrar no futuro sem refatoração grande.

### ✅ Dentro da v1

Todas as funcionalidades da seção 5 e as telas da seção 6.

---

## 4. Identidade visual

### Paleta

- **Uma única paleta pastel clara** usada no app inteiro.
- **Fundo:** off-white quente (creme bem suave).
- **Cores de apoio (acentos):** lavanda, menta, pêssego, azul-bebê e amarelo-manteiga. Usadas em etiquetas, botões e destaques.
- **Colunas:** todas com um mesmo tom pastel neutro e suave sobre o fundo.

#### Valores (extraídos do Figma em 2026-10-27) ✅

Lidos das camadas da biblioteca (node `3:46232`), com dois ajustes de contraste aprovados pelo autor (marcados com ⚠️). Vão para `src/theme/colors.ts` na etapa 2.

| Token (uso) | Hex | Observação |
|---|---|---|
| `background` (fundo creme) | `#FBF8F1` | |
| `surface` (cartões, inputs, bottom sheets) | `#FFFEFB` | |
| `columnBackground` | `#EFECE5` | |
| `border` (bordas decorativas, trilho da barra, botão desabilitado) | `#E8E2D8` | 1,28:1, só decorativo |
| `borderStrong` (borda de input, trilho do toggle desligado) | `#8B867E` | Não existe no Figma. Criado para passar 3:1: 3,06 a 3,58:1 |
| `textPrimary` | `#39352F` | 10,3 a 12,1:1 |
| `textSecondary` | `#6F6A62` | ⚠️ Figma usa `#827C73` (3,5 a 4,1:1, reprovado). Ajustado para 4,55 a 5,3:1 |
| `primary` (botão, FAB, toggle, checkbox, progresso) | `#776098` | Texto `surface` sobre ele: 5,32:1 |
| `onSecondary` (texto do botão secundário) | `#604A80` | 6,5:1 sobre `secondary` |
| `secondary` (fundo do botão secundário) | `#F2ECF7` | |
| `lavender` | `#EAE1F4` | Acento (etiquetas, seleção) |
| `mint` | `#DDEDE2` | Acento (etiquetas, prioridade baixa, concluído) |
| `peach` | `#F6DECE` | Acento (etiquetas, prioridade alta, atrasado) |
| `babyBlue` | `#DDEAF2` | Acento (etiquetas) |
| `butter` | `#F6EDBE` | Acento (etiquetas, prioridade média, prazo próximo) |
| `alert` (prioridade alta, prazo vencido) | `#9E4D42` | ⚠️ Figma usa `#A95246` (4,08:1 sobre pêssego, reprovado). Ajustado para 4,52:1 |
| `disabledBackground` (botão desabilitado) | `#EFECE5` | Igual ao Figma; texto `textDisabled` sobre ele: 4,55:1 |
| `inverseSurface` / `onInverseSurface` / `inverseAction` (snackbar) | `#39352F` / `#FFFEFB` / `#EAE1F4` | Não existe no Figma. Texto 12,1:1; ação 9,6:1 |
| `illustrationLine` (linhas do post-it do estado vazio) | `#8A622D` | |
| `lavenderInk` / `mintInk` / `peachInk` / `babyBlueInk` / `butterInk` (ícone e miniatura da pasta) | `#776098` / `#537360` / `#9E4D42` / `#4F6F86` / `#8A622D` | Versão escura de cada acento. `#537360` vem do Figma; `#4F6F86` foi criado. Todos ≥ 4,4:1 nas superfícies |

Sombras (cor base `rgb(81, 68, 53)`):

- Cartão parado: `0 4 6`, opacidade **0,05**.
- Cartão arrastado / elevado: `0 12 24`, opacidade **0,15**.

Texto sobre os acentos pastéis usa sempre `textPrimary` (9,4 a 10,3:1).

> ⚠️ **Atenção ao contraste:** tons pastéis costumam ter contraste baixo. Texto e ícones **nunca** devem ser pastéis sobre fundo pastel. O pastel fica no fundo e nas superfícies; textos usam tons escuros. Ver regra 14 da seção 12.

### Forma e espaçamento

- Cantos bem arredondados: **16 a 24px**.
- Sombras suaves e difusas.
- Bastante respiro entre os elementos.

### Tipografia

- Fonte do app: **Nunito** ✅ (sans-serif arredondada e amigável, licença SIL OFL).
- Títulos em peso **ExtraBold (800)**, como no Figma (decidido em 2026-10-27; substitui o "semibold" anterior).
- Pesos usados: Medium (500), Bold (700) e ExtraBold (800). Embutidos no binário pelo plugin `expo-font` (pacote `@expo-google-fonts/nunito`). Licença em `mobile/Pinny/assets/fonts/LICENSE-Nunito-OFL.txt`.
- Altura de linha: **1,35** em todos os textos.
- Escala (`src/theme/typography.ts`, vira as classes `text-<nome>`): `display` 26, `title` 22, `subtitle` 17, `card-title` 15, `label` 13 e `tag` 12 em ExtraBold; `body` 14 e `caption` 12 em Medium. Cada classe já define tamanho, altura de linha e fonte.
- **Tamanho mínimo: 12px.** O Figma usa 11px em etiquetas, chips e prazo; no app esses textos usam 12px.

### Ícones e ilustrações

- Ícones com **traço arredondado**.
- **Microilustrações** simples e fofas nos estados vazios.
  - Exemplo de texto: "Nenhum card aqui ainda, que tal criar o primeiro?"

### Cards

- Visual de **post-it levemente arredondado**.
- Ao ser arrastado, o card fica **levemente inclinado e elevado, com sombra maior**.

---

## 5. Funcionalidades

### 5.1 Quadro kanban

- **Colunas customizáveis:** criar, renomear (título editável) e excluir. Cada coluna mostra um contador de cards.
- **Muitos cartões por quadro**, com meta medível (decisão de 2026-11-03): fluido a 60fps até **~300 cartões por quadro** num aparelho intermediário e, com milhares (teste do quadro superlotado), sem travar nem fechar. O uso real de lembretes e rotina fica bem abaixo disso. Virtualização ficou para depois da v1 (seção 10).
- **Arrastar cards** dentro da mesma coluna e entre colunas, com animação fluida.
- **Reordenar colunas** com "hold & drop": segurar e arrastar.
- **Arraste em lote:** modo de seleção múltipla para mover vários cards juntos.
- Botão **"+ Adicionar coluna"** ao final das colunas.

### 5.2 Card completo

- Título e descrição.
- **Etiquetas coloridas** (as etiquetas podem ter cores; só as colunas é que não).
- **Prioridade:** baixa, média ou alta.
- **Data e horário**, com lembrete e notificação.
- **Checklist de subtarefas**, com barra de progresso.
- **Anexos de foto**, pela câmera ou pela galeria.
- Coluna/status atual.

### 5.3 Prazo visual

O post-it muda de aparência conforme o prazo:

1. **Normal:** aparência padrão.
2. **Prazo próximo:** borda ou selo de alerta suave.
3. **Vencido:** destaque discreto.

O visual deve continuar amigável. Nada de vermelho agressivo.

### 5.4 Pastas de quadros (kanban por pipeline)

- O usuário organiza **vários quadros kanban dentro de pastas**.
- Pastas e quadros têm **título editável**.

### 5.5 Templates

- **Templates prontos** de quadro. Exemplos: Estudos, Tarefas da semana, Projeto pessoal, Viagem.
- Opção de criar um **template personalizado**.

### 5.6 Calendário

- Visões **mensal e semanal**.
- Os cards aparecem como **mini post-its** nos dias correspondentes.
- **Sincronização com o calendário do celular** (toggle).

### 5.7 Agendamento por voz com IA

- O usuário fala, e a IA configura o card: **título, descrição, data/horário e coluna/status**.
- Fluxo da tela:
  1. Botão de microfone grande no centro, com animação de onda sonora.
  2. Transcrição da fala exibida abaixo.
  3. Prévia do card preenchida pela IA.
  4. Botões **"Confirmar"** e **"Editar"**.
- A IA nunca cria o card sozinha: o usuário sempre confirma antes.

### 5.8 Automações simples por coluna

Exemplos de regras:

- "Ao mover para **Concluído**, marcar todo o checklist."
- "Arquivar cards concluídos após **X dias**."

### 5.9 Desfazer ao chacoalhar (shake to undo)

Chacoalhar o celular desfaz a última ação (ex.: mover, excluir ou editar um card). Precisa haver um histórico de ações e uma confirmação visual amigável.

### 5.10 Widgets e Live Activities

- **Widget de tela inicial**, nos tamanhos pequeno e médio, mostrando os próximos cards.
- **Live Activity / Dynamic Island** (iOS) exibindo um card com prazo próximo.
- Mesmo estilo pastel do app.
- Exige código nativo (Swift para iOS, Kotlin para Android). O autor já tem experiência com integrações nativas e estuda as duas linguagens.

---

## 6. Telas

1. **Início / Pastas de quadros:** lista de pastas com prévia dos quadros. Botão flutuante "+" cria pasta ou quadro.
2. **Templates de quadro:** galeria de modelos prontos e opção "Criar template personalizado".
3. **Quadro kanban (tela principal):** colunas lado a lado com scroll horizontal. Inclui arrastar cards, reordenar colunas, seleção múltipla, estados de prazo e "+ Adicionar coluna".
4. **Detalhe do card:** bottom sheet ou tela cheia, com todos os campos da seção 5.2.
5. **Criar card:** formulário simples, com botão de microfone em destaque.
6. **Agendamento por voz com IA:** fluxo da seção 5.7.
7. **Calendário:** visões mensal e semanal, com toggle de sincronização.
8. **Automações da coluna:** configuração das regras da seção 5.8.
9. **Configurações:** notificações, sincronização do calendário e "Desfazer ao chacoalhar" (toggle). **Sem opções de tema ou cor.** Também inclui os itens de privacidade e transparência listados no resumo da seção 12.
10. **Extras:** widget de tela inicial e Live Activity.

As telas 3 (quadro) e 4 (detalhe do card) são as mais importantes e devem receber mais cuidado.

---

## 7. Biblioteca de componentes

O design prevê componentes reutilizáveis. Implemente-os como componentes React Native isolados e consistentes:

- Card (post-it)
- Coluna
- Etiqueta
- Chip de prioridade
- Botão primário e botão secundário
- Botão flutuante (FAB)
- Input
- Toggle
- Barra de progresso
- Bottom sheet

---

## 8. Design no Figma

✅ **As telas já estão prontas no Figma.** O Figma é a referência visual do app.

As telas foram geradas com a **IA do Figma**. O prompt usado (versão resumida, em inglês, até 2000 caracteres) foi este:

```
Design a friendly kanban-style mobile app (like Trello), 390×844 frames, iOS/Android. Tone: warm and light, like a tidy sticky-note board, never corporate.

Style:
- Single light pastel palette: warm cream background; lavender, mint, peach, baby blue and butter yellow accents.
- Light theme only. No dark mode or theme toggle.
- All columns share one neutral pastel color; no column color options.
- Rounded corners (16-24px), soft shadows, generous spacing.
- Rounded sans-serif font (Nunito/Quicksand), semibold headings, rounded icons, cute empty-state illustrations.
- UI text in Brazilian Portuguese. No mascot.

Screens:
1. Home: folders of boards with editable titles, "+" FAB.
2. Templates: ready-made boards + custom template option.
3. Kanban board: horizontal columns with editable titles and card count. Sticky-note cards with title, colored labels, priority, checklist progress, photo thumbnail, date. Show a card being dragged (tilted, lifted), column reordering, multi-select batch move, and deadline states (normal, due soon, overdue). "+ Add column" at the end.
4. Card details: description, labels, priority, date/time reminder, subtask checklist with progress bar, photo attachments, status.
5. Create card: simple form with a prominent mic button.
6. AI voice scheduling: big mic, sound wave, transcription, AI-filled card preview with Confirm/Edit.
7. Calendar: month/week views with cards as mini sticky notes; phone calendar sync toggle.
8. Column automations: e.g. "When moved to Done, check all items", "Archive done cards after X days".
9. Settings: notifications, calendar sync, shake to undo. No theme or color options.
10. Home screen widget (small/medium) and Live Activity for a card near its deadline.

Include a reusable component library: card, column, label, priority chip, buttons, FAB, input, toggle, progress bar, bottom sheet.
```

Em caso de conflito entre o Figma e este arquivo, pergunte ao autor antes de seguir.

- Arquivo: `wfGj6T0xiY95z4AQ8dP3zT`. A biblioteca de componentes está no node `3:46232` ("Biblioteca · Miolo").
- O nome **"Miolo"** que aparece no Figma foi inventado pela IA. **Ignore-o**: o app se chama Pinny.
- O Figma **não tem variáveis de cor**. Os valores foram lidos das camadas (ver seção 4).

---

## 9. Stack técnica

### Decidido

- **React Native + TypeScript.**
- **Expo com dev client** (por causa dos módulos nativos: widgets, Live Activities etc.). Não usar React Native CLI puro nem Expo Go.
- **Arquitetura MVVM**, com cores centralizadas e reutilização de componentes. Detalhes no `REGRAS.md`.
- **Fonte:** Nunito.
- **Bibliotecas:** serão escolhidas e instaladas **conforme a necessidade de cada etapa**, não todas de uma vez. Não instale bibliotecas antecipadamente. Ao chegar numa etapa que precise de uma, proponha a opção e confirme com o autor antes de instalar.
- **iOS first (2026-10-27):** o desenvolvimento e os testes manuais são feitos só no iOS por enquanto. O Android volta quando o autor pedir; até lá, não gere a pasta `android/` nem teste nele.
- **Testes automatizados adiados (2026-10-27):** Jest, Testing Library e pre-commit com testes ficam para depois, quando o autor pedir. Não escreva testes nem instale ferramentas de teste até lá.
- **Componentes (etapa 3, 2026-10-27):** ícones com `lucide-react-native` + `react-native-svg` (os mesmos do Figma) e bottom sheet com `@gorhom/bottom-sheet` (trocado pela folha nativa em 2026-10-28, ver Navegação). Nenhum dos dois acessa dados do usuário. Os componentes compartilhados ficam em `mobile/Pinny/src/components/`.
- **Ajustes de componentes pedidos pelo autor (2026-10-27):**
  - Coluna do quadro com **75% da largura da tela**, para a próxima aparecer pela borda; rolagem horizontal com encaixe por coluna.
  - Cartão **sem checkbox**. Enquanto pressionado, mostra a borda `borderSelected`; ao soltar, volta ao normal. O toque longo e a seleção em lote serão definidos na etapa 6.
  - Toggle com **48×25** (Figma: 44×28), bolinha de 19 e área de toque de 45pt.
  - Cartão aceita foto opcional (`thumbnail`, arquivo local ou `{ uri }`).
- **Dados local-first (etapa 4, 2026-10-28):** `expo-sqlite` + **Drizzle ORM** (migrações em `src/db/migrations`, geradas com `npm run db:generate`) + **Zod** via `drizzle-zod`. As tabelas em `src/db/schema.ts` são a fonte única: os schemas Zod e os tipos derivam delas. IDs com `expo-crypto` (`randomUUID`). Datas em ISO 8601 UTC.
  - **Ordenação por posição decimal:** mover um item grava só ele, com o ponto médio entre `previousId` e `nextId`; a lista é renumerada só quando o vão fica pequeno demais (`src/utils/position.ts`). Vale para pastas, quadros, colunas, cartões e checklist.
  - **Repositórios** atrás de interfaces em `features/<feature>/model/`; toda leitura passa pelo Zod (`parseRows`).
  - **Histórico de ações** em `features/history/model/actionHistory.ts`: pilha imutável de até `HISTORY_LIMIT` (20) entradas, cada uma com a operação que desfaz a ação.
- **Navegação (etapa 5, 2026-10-28):** Expo Router com **Native Tabs** (`expo-router/native-tabs`): tab bar nativa, com o **Liquid Glass** do iOS 26. Abas: Início, Modelos, Agenda e Ajustes, com ícones SF Symbols.
  - **Ícones das abas = os do Figma (Lucide), exceto Início**, que usa cartões empilhados no estilo do SF Symbol `rectangle.stack` (desenhado em SVG para seguir as mesmas cores). No iOS, os SVGs de `mobile/Pinny/assets/images/tabs/` entram no `Images.xcassets` como **vetor** via config plugin (`mobile/Pinny/plugins/withTabBarIcons.js`, roda a cada prebuild); no Android, usam os PNGs 1x/2x/3x gerados do mesmo SVG. Para trocar um ícone: substitua o SVG, gere os PNGs e rode `npx expo prebuild --clean`.
  - **Sem rótulos visíveis e ícones de 26pt**, decisão do autor em 2026-10-28: o Liquid Glass do iOS 26 ignora a cor de texto dos itens não focados. Cada aba tem `accessibilityLabel` para o VoiceOver.
  - Ícones: não focado = contorno em `textSecondary` (`#6F6A62`; o `#827C73` do Figma ficava apagado no vidro); focado = **versão preenchida** em `onSecondary` (`tab-x-active.svg`, com detalhes vazados em `surface`), para a aba ativa não depender só de cor. No iOS, os ícones são gerados **já coloridos** em modo `original` (`plugins/tabBarColors.js`, exceção `COR-HARDCODED`), porque o vidro ignora a cor de ícones `template`.
  - **Busca na aba separada (2026-10-28):** o círculo de vidro ao lado da barra é a aba `search` (`role="search"`, iOS 26.1+), com a barra de busca nativa (`Stack.SearchBar` em `(tabs)/search/`). Busca pastas e quadros sem diferenciar acentos. Em iOS mais antigo, aparece como mais um item da barra. A Início não tem mais campo de busca.
  - **"+" no topo da Início (2026-10-28):** no lugar do avatar com as iniciais, um botão redondo de **40pt** (padrão de todos os botões de vidro do app desde 2026-11-03; antes 45pt e, até 2026-10-30, 50pt), com ícone de 20 e área de toque de 44pt completada por fora (`hitSlop`) com Liquid Glass (`GlassIconButton`, `expo-glass-effect`; sem a expansão do vidro ao toque, só escurece) abre a folha "Nova pasta". Sem Liquid Glass, vira uma superfície clara com borda.
  - **Folhas nativas do iOS (2026-10-28):** o `@gorhom/bottom-sheet` não abria dentro da navegação nativa e foi removido. Cada folha é uma rota do `Stack` raiz com `presentation: 'formSheet'` e altura pelo conteúdo (`sheetScreenOptions` em `app/_layout.tsx`), com o conteúdo em `SheetLayout`. Ex.: `/folder/new` e `/folder/[folderId]/rename`. O puxador, o arraste e o teclado são do sistema.
  - Telas por cima das abas usam o `Stack` raiz com só o botão de voltar. **Exceção: o quadro (2026-10-30)** esconde a barra nativa e desenha o próprio topo (`BoardHeader`), com voltar, título e "…" na mesma linha, como no Figma, usando o `GlassIconButton`. O gesto de voltar pela borda continua do sistema.
  - A galeria de componentes saiu da rota inicial: agora fica em `/dev/gallery`, aberta por Ajustes **só em `__DEV__`**.
  - As telas recarregam sozinhas quando o banco muda (`src/db/changes.ts`, ouvinte do `expo-sqlite`).
- **Arraste do quadro (etapa 6.1, 2026-10-29):** `react-native-gesture-handler` 3 (API `usePanGesture`, com `activateAfterLongPress`) + `react-native-reanimated` 4 + `expo-haptics`.
  - Cartões em **posição absoluta** dentro de cada coluna. A ordem visual (`order`) e as alturas medidas (`heights`) ficam em shared values. Os topos (`offsets`) são calculados uma vez por mudança, com as funções puras de `features/board/model/reorder.ts`.
  - O gesto e a rolagem automática (`useFrameCallback` + `scrollTo`) rodam na **UI thread** (`useSortableColumn`). O React só recebe a intenção final (`moveCard(columnId, cardId, toIndex)`), que grava só o cartão movido (posição decimal) e entra no histórico para o "Desfazer".
  - Shared values com `.get()`/`.set()`, por causa do React Compiler.
  - **Camada de arraste (2026-10-29):** ao levantar, o cartão é desenhado num "fantasma" por cima da tela do quadro (`DragOverlay` + `useBoardDrag`, antes `useDragOverlay`), acima dos cabeçalhos fixos e sem o corte da coluna. O original fica na coluna, invisível, com o gesto e as vagas. A posição vem de `measure` da lista da coluna, na UI thread. **Ao soltar**, a cópia some e o cartão da lista assume do mesmo ponto, ainda girado, e assenta com a mola dentro da própria lista, para o quique acompanhar a rolagem. Isso prepara o arraste entre colunas (6.2).
  - **Entre colunas (etapa 6.2, 2026-10-30):** o fantasma segue o dedo nos dois eixos. O `useBoardDrag` guarda, na UI thread, o cartão, a coluna de origem e a coluna sob o dedo (`columnIndexAt`, conta pura com a rolagem do quadro). Cada coluna põe o cartão na própria ordem quando fica sob o dedo e o tira quando ele sai: a de origem fecha o espaço e a de destino abre a vaga preenchida (decisão do autor: sempre com "Solte para reorganizar", sem a seta do Figma). Com o dedo perto da borda da tela, o quadro rola sozinho para os lados e encaixa na coluna mais próxima ao soltar. Soltar em outra coluna (2026-10-30, corrigido): o fantasma para onde está e, assim que o cartão aparece na coluna de destino, ele assume desse ponto e assenta com a mola dentro da própria lista (`takeOver`), para o quique acompanhar a rolagem, igual à mesma coluna. Antes o fantasma voava na camada e ficava preso na tela se o quadro rolasse durante o voo. As alturas medidas ficam num mapa único do quadro. O gesto continua no cartão de origem até soltar.
  - **Organização dos arquivos do arraste (refatoração de 2026-11-02, nenhum acima de ~200 linhas):** `useBoardDrag` (segurar, mover, soltar, troca de coluna) usa `useDragValues` (shared values), `useBoardScroll` (rolagem lateral, encaixe e foco na coluna) e `useDragSettle` (quique pelo fantasma); a interface fica em `boardDrag.types.ts`. Cada coluna: `useSortableColumn` (ordem e vaga), `useColumnAutoScroll` (rolagem vertical e acompanhamento do quique), `ColumnFooterArea` (estado vazio de tamanho fixo) e `sortableColumn.types.ts`. O cartão usa `useCardAccessibilityActions`. A tela passa às colunas os objetos `cardActions`, `columnActions` e `haptics` (`boardActions.ts`). No modelo, `cardSnapshots.ts` tira, grava e copia retratos de cartões (desfazer e duplicar).
  - Movimento gravado por `moveCardWithHistory` (`features/board/model/cardMove.ts`), usado pelo arraste e pela folha "Mover para...": grava só o cartão e registra no histórico a coluna e a posição de antes.
  - **Alternativas sem gesto (regra 15):** ações do VoiceOver no cartão: "Mover para cima/baixo", "Mover para a coluna anterior/próxima" (vai para o topo e anuncia "Movido para X, posição 1 de N") e "Mover para…", que abre a folha nativa `/card/[cardId]/move` (coluna e "No início"/"No fim"). Na etapa 7, o menu do cartão abre a mesma folha.
  - Visual do Figma "Quadro · Arrastar cartão": rotação -5° (anti-horário), escala 1,03, sombra `lifted` e espaço tracejado com "Solte para reorganizar" (`dropZoneBorder`; fundo vazio na coluna de origem, `dropZoneTargetBackground` em outra coluna). Com "Reduzir movimento", sem rotação, escala nem mola.
  - Referência usada: o kanban antigo do autor (Vendd), reescrito com melhorias (cálculo por coluna em vez de ordenar o quadro inteiro a cada quadro de animação, rolagem automática na UI thread, acessibilidade).
- **Criar coluna (etapa 6.3, 2026-11-02):** uma coluna "fantasma" no fim do quadro (`AddColumnButton`, Figma "Ghost column"): borda tracejada `addColumnBorder` (primary a 55%, decorativa), "+" num círculo `columnBackground` e a legenda "Toque para adicionar / uma nova coluna" (decisão do autor, no lugar do "Add column"). Tem a altura de uma coluna vazia: o conteúdo dela fica desenhado invisível por dentro. Abre a folha nativa `/column/new?boardId=` (`NameSheet`, o mesmo componente das folhas de pasta). A coluna entra no fim, vai para o histórico ("Nova Coluna": desfazer apaga, refazer recria com o mesmo id) e o quadro rola até ela (`focusColumn`), como ao soltar um cartão em outra coluna. Também foi decidido um atalho "Nova coluna" no "…" do topo do quadro (ainda não feito).
- **Menu da coluna (etapa 6.3, 2026-11-02):** o "…" da coluna abre o menu suspenso nativo do iOS (`ColumnMenu`, `Menu`/`Button` do `@expo/ui/swift-ui`, instalado com aprovação do autor; precisa de rebuild), com ícones SF Symbols: Adicionar cartão (`plus`), Mover para trás/frente (`arrow.left`/`arrow.right`, somem nas pontas), Duplicar (`plus.square.on.square`) e Excluir coluna (`trash`, vermelho, papel destrutivo). Mover troca com a vizinha, entra no histórico ("Movimento de Coluna", desfazer volta à posição exata) e o quadro acompanha a coluna; é também a alternativa sem gesto da 6.4. Duplicar cria "Nome (cópia)" logo depois, com cópias dos cartões ativos, etiquetas e checklist (anexos não vão junto), e desfazer apaga a cópia. Excluir abre o mesmo alerta do puxar para excluir.
- **Renomear coluna (etapa 6.3, 2026-11-02):** direto no título (`ColumnTitle`), sem folha e fora do "…" (decisão do autor). Tocar no lápis ou no nome vira campo com o texto selecionado; o lápis e a borda ficam em `primary`. "OK" ou tocar fora salva (só no blur, para não salvar duas vezes) e nome vazio volta ao anterior. Enquanto edita, a coluna não rola (sem "puxar para excluir") e os cartões não arrastam. Entra no histórico ("Renomeação de Coluna"). VoiceOver: o título tem a dica e a ação "Renomear coluna".
- **Atalho: soltar o cartão na coluna "Adicionar coluna" (2026-11-02):** ela vira um destino a mais depois da última coluna (`ADD_COLUMN_SLOT`). Com o cartão por cima, acende como a vaga de destino (tracejado `dropZoneBorder`, fundo `dropZoneTargetBackground`) e a legenda vira "Solte para criar uma coluna com este cartão". Soltar devolve o cartão à vaga de antes e abre a folha "Nova coluna" com o aviso "O cartão "X" vai para a coluna nova." (`/column/new?boardId=&cardId=`). Criar leva o cartão para a coluna nova; fechar a folha deixa tudo como estava. No histórico é uma ação só (operação `sequence`): desfazer devolve o cartão e apaga a coluna.
- **Skeleton loading (etapa 6.4, 2026-11-02):** base reutilizável em `src/components/Skeleton.tsx` (`SkeletonGroup` + `SkeletonBar`), no estilo do YouTube: só as barras animam, com uma faixa de brilho (`skeletonHighlight`, gradiente do `react-native-svg`) que atravessa a tela em velocidade constante, contínua entre as barras (cada uma mede a própria posição na tela). Parado com "Reduzir movimento". Só um grupo por tela tem `accessibilityLabel` ("Carregando o quadro"). No quadro: barras no título, 2 pílulas nos filtros e 2 colunas com 4 e 3 cartões, sem tempo mínimo (`skeleton.minDurationMs` = 0, decisão do autor). Transição cruzada com `FadeOut`/`FadeIn` (250 ms) e montagem em duas etapas (2 primeiras colunas, depois o resto) para não travar. Em toda tela nova que carrega dados, perguntar se ela terá skeleton.
- **Performance do quadro (etapa 6.4, 2026-11-02):** medido com o quadro "superlotado" de Ajustes (só em `__DEV__`). Regras que ficaram:
  - O objeto `drag` repassado às colunas e aos cartões tem identidade fixa: estado do React (ex.: `activeCardId`) fica fora dele, e as ações do ViewModel passam por `useBoardActions` (`useStableCallback`, em `src/hooks`).
  - **Worklets de mapper (`useAnimatedStyle`, `useDerivedValue`, preparo do `useAnimatedReaction`) nunca capturam o objeto `drag` ou `column` inteiro**: desestruture só os shared values lidos. O Reanimated torna dependência todo shared value dentro do objeto capturado, e o mapper rodaria a cada quadro do arraste em todos os cartões.
  - A recarga do banco reaproveita os itens que não mudaram (`toColumnItems`) e junta os avisos do banco numa carga só; as alturas entram em lote (`useHeightBatch`); as colunas montam uma por quadro depois das 2 primeiras.
  - Virtualização dos cartões e das colunas: fora da v1 (seção 10).
- **Menu e título do quadro (etapa 6.4, 2026-11-03):** o "…" do topo abre o menu nativo (`BoardMenu`, `@expo/ui`), em três grupos: Buscar lembrete (lupa; substituiu o "Filtrar…", que foi para a linha de filtros abaixo do título), Selecionar cartões, Nova coluna, Reorganizar colunas · Renomear quadro, Duplicar quadro, Mover para outra pasta · Excluir quadro (vermelho). Só "Renomear quadro" funciona por enquanto. "Reorganizar colunas" (modo lista, colunas como linhas arrastáveis na vertical) e o arraste direto das colunas no quadro coexistem (decisão do autor). O título do quadro usa `text-header-title` (20) e é renomeado ali mesmo, como o da coluna (`useInlineRename`, em `src/hooks`, compartilhado pelos dois): tocar no nome ou "Renomear quadro" no menu; entra no histórico ("Renomeação de Quadro").
- **Filtro do quadro (etapa 6.4, 2026-11-03):** modal centralizado "Filtrar" (prazo, prioridade, etiquetas, concluídos, checklist pendente; entre categorias "e", dentro de uma "ou") e a linha abaixo do título (atalhos Hoje, Atrasados e Alta + "Filtros"; com filtro, um chip removível por filtro e "Limpar"). Decisões do autor:
  - **Todas as colunas aparecem sempre**; só os cartões que não passam somem. Coluna esvaziada pelo filtro mostra "Nenhum cartão com esses filtros." O contador da coluna mostra só os visíveis; o subtítulo vira "Pasta / 3 de 8 cartões".
  - **O arraste continua com filtro ligado (abordagem A):** a vaga é contada entre os visíveis e vira posição na coluna completa logo depois do vizinho visível de cima (ou antes do primeiro visível), com os escondidos mantendo a ordem (`toFullIndex`, `useVisibleCards`).
  - Cartão novo escondido pelo filtro mostra o snackbar "Cartão criado, mas escondido pelos filtros".
  - O filtro vale só enquanto o quadro está aberto (não é salvo).
  - **Performance:** cartões escondidos pelo filtro continuam montados, com `display: none` (`cards` = todos, `visibleCards` = os que passam): ligar e limpar o filtro não cria nem destrói views. A troca roda como transição do React (`useTransition` no `useBoardFilter`) e, se passar de `skeleton.filterDelayMs` (150 ms), o skeleton aparece por cima das colunas (`FilterSkeletonOverlay`, atraso na animação de entrada, sem timer no React).
- **Criar quadro (2026-11-03):** na Início, cada pasta tem um "+" tracejado (estilo da coluna "Adicionar coluna") depois do último quadro; na pasta vazia, ele ocupa a linha com "Criar o primeiro quadro". Abre a folha nativa "Novo quadro" (`/folder/[folderId]/new-board`, `NameSheet`), com o aviso da pasta de destino; o quadro entra no fim da pasta, já com as colunas "Pendentes" e "Concluídas" (vazias, decisão do autor), e abre em seguida. Como a "Nova pasta", ainda não entra no histórico (desfazer). **Regra de apresentação:** criar ou nomear algo usa a folha de baixo (pasta, coluna, quadro); escolher opções sobre o que está na tela usa o modal centralizado (filtros).
- **Pastas grandes na Início e tela da pasta (2026-11-03):** cada pasta mostra até `HOME_PREVIEW_BOARDS` (3) quadros; com mais, a última vaga é o bloco "Ver todos" (decisão do autor, 2026-11-08): do mesmo tamanho dos outros, em lavanda, com o ícone de pilha (`Layers`) e "Ver todos ›", alinhados à esquerda como nos quadros (o "+N" saiu, decisão do autor). Ele abre a tela da pasta. Nesse caso o "+" some: o novo quadro fica no "⋮" da pasta ("Novo quadro") ou dentro da pasta. **Layout do card da pasta (Figma `114:2177`, 2026-11-08):** padding 12, cabeçalho numa linha só de 32 (ícone 20, nome, contador, alfinete roxo `primary` se fixada e "⋮"), quadros de 64 de altura com o ícone `Columns3` na cor escura da pasta (substituiu a miniatura desenhada) e grade com 8 de espaço. Entre as pastas, 20 (decisão do autor; o Figma usa 10) (`/folder/[folderId]`): mesmo topo do quadro (`ScreenHeader`), com o selo do ícone e da cor da pasta; tocar no nome abre a folha "Personalizar" (futuro atalho para nome, cor e ícone; hoje, a de renomear), e o "…" tem Personalizar, Novo quadro, Fixar quadros e Excluir pasta, busca pelo nome (`Input` com rótulo escondido), grade com "Novo quadro" tracejado no fim, estado vazio com "Criar quadro" e skeleton (decisão do autor). Peças compartilhadas: `ScreenHeader`, `EditableTitle` e `GlassMenu` (em `src/components`) e `BoardGrid` (pastas). Ajustes (só em `__DEV__`) cria pastas com 8 e 30 quadros para testar.
- **Fixar pasta (2026-11-03):** "Fixar no topo" no "⋮" da pasta (só na Início; a tela da pasta tem só "Fixar quadros") grava `pinned_at` (migração `0003`). As fixadas vêm primeiro na Início, da fixada mais recente para a mais antiga; depois, as outras pela posição. Antes do "⋮" aparece um alfinete em `primary` (antes `textSecondary` ao lado do nome; mudou com o layout do Figma em 2026-11-08); o nome encolhe antes dele, então nome longo corta com "…" e o alfinete continua visível. Fixada, o menu mostra "Desafixar". **No máximo 3 fixadas** (`PINNED_FOLDERS_LIMIT`): com 3, o "Fixar no topo" some do menu das outras pastas (decisão do autor, sem aviso); o modelo também não fixa a quarta. Ainda não entra no histórico (desfazer).
- **Fixar quadro na Início (2026-11-03):** na tela da pasta, segurar um quadro abre o menu de contexto nativo do iOS (`ContextMenu` do `@expo/ui`, com o bloco em `RNHostView`) com "Fixar na Início" / "Desafixar" e "Excluir quadro" (vermelho, separado); o VoiceOver tem as mesmas ações no bloco. O menu aparece sempre: com 3 fixados, fica só o "Excluir quadro" (2026-11-08). Segurar mais de `CONTEXT_MENU_HOLD_MS` (300 ms) e soltar não abre o quadro. **Excluir quadro (2026-11-08):** alerta nativo "Excluir o quadro "X"?" (`useDestructiveConfirm`, em `src/hooks`, o mesmo do excluir coluna); apaga o quadro com colunas, cartões (inclusive arquivados) e etiquetas (`removeBoardWithContent`, com retrato), registra "Exclusão de Quadro" no histórico e mostra o aviso de desfazer. Desfazer recria tudo com os mesmos ids, posições e fixação. Se o quadro excluído estava fixado e o usuário fixar outro quadro da mesma pasta depois (pelo menu ou pelo "Fixar quadros"), essa exclusão sai do histórico e não pode mais ser desfeita (`forgetPinnedBoardRestores`, decisão do autor), para a pasta nunca passar de 3 fixados. Grava `pinned_at` em `boards` (migração `0004`). A prévia da pasta na Início mostra primeiro os fixados (do mais recente para o mais antigo) e completa com os outros na ordem da pasta (`orderForPreview`). **No máximo 3 por pasta** (`PINNED_BOARDS_PER_FOLDER`, igual ao que a Início mostra): com 3, a opção some dos outros. O fundo lavanda do bloco passou a marcar os quadros fixados (antes era o primeiro da pasta); o alfinete ao lado do nome aparece só na tela da pasta (na Início, só o lavanda). **Modo "Fixar quadros"** (no "…" da tela da pasta): como a seleção de fotos do iOS, cada quadro ganha um círculo no canto superior direito (vazio ou com check), o toque marca/desmarca até 3 (marcados em lavanda), começa com os já fixados marcados, o topo vira "Fixar N quadros" com "Cancelar" e "Pronto" (grava na ordem da escolha, `applyPinnedBoards`); depois do "Pronto", os fixados aparecem primeiro também na tela da pasta.
- **Campo de texto (2026-11-02):** em foco, só a borda do campo e o ícone ficam em `primary` (sem a moldura em volta do componente).
- **Puxar para excluir coluna (2026-10-29; exclusão de verdade em 2026-11-02):** puxar a coluna para baixo além de `pullToDelete.distance` e segurar `holdMs` (0,5 s) enche um anel vermelho (`alert`) em volta da lixeira, que fica atrás da coluna (`PullToDeleteIndicator`, `usePullToDelete`). Ao completar, abre o alerta nativo "Excluir a coluna?". "Excluir" apaga a coluna e todos os cartões dela, inclusive arquivados (`removeColumnWithCards`, com retrato de cada cartão: etiquetas, checklist e anexos), registra "Exclusão de Coluna" no histórico e mostra o aviso de desfazer. Desfazer recria tudo com os mesmos ids e posições, e o quadro rola até a coluna.
- **Desfazer ao chacoalhar (antecipado na etapa 6.1, 2026-10-29):**
  - Histórico **global** em memória (`features/history/model/historyStore.ts`): toda tela registra a ação com a operação que a desfaz.
  - **Desfazer várias vezes e refazer (2026-10-29):** duas pilhas (até 20 ações). `applyUndo` devolve a operação inversa; desfazer a guarda em "refazer" e refazer a devolve. Uma ação nova limpa o "refazer".
  - **Igual ao "Agitar para Desfazer" do iOS (decisão do autor, 2026-10-29):**
    - Chacoalhar abre o **alerta nativo** (`Alert.alert`): "Desfazer Movimento" com [Desfazer], "Refazer Movimento" com [Refazer], ou as duas opções juntas, sempre com "Cancelar". A regra fica em `shakePrompt.ts`.
    - Nada é desfeito sem confirmação. Sem nada no histórico, chacoalhar não faz nada, e não há aviso depois de desfazer.
    - Nomes das ações no estilo do iOS: `ptBR.history.actions` ("Movimento", "Criação").
  - O chacoalhar vem do acelerômetro (`expo-sensors`), detectado pela função pura `shakeDetector.ts` (valores em `src/constants/shake.ts`) atrás da interface `ShakeService`. O sensor só fica ligado com o app aberto.
  - Respeita o **"Agitar para Desfazer"** do iPhone (Ajustes → Acessibilidade → Toque), lido pelo módulo Expo local `modules/shake-to-undo` (Swift, `UIAccessibility.isShakeToUndoEnabled`). Com ele desligado, chacoalhar não faz nada.
  - Aviso depois de mover (`decideUndoNotice`): na primeira vez, um snackbar ensina o chacoalhar ("Experimente chacoalhar para desfazer a ação", com ícone), sem botão. Quem não pode chacoalhar recebe sempre o snackbar com "Desfazer" (regra 15), que desfaz direto, sem alerta. A primeira vez fica gravada na tabela `preferences`.
  - Um único snackbar global (`features/feedback`), montado no layout raiz.
  - No dev client, o gesto de chacoalhar do menu de desenvolvimento foi desligado no aparelho (Go home → Settings → Menu gestures). O menu abre com três dedos ou `m` no Metro.
- **Preferências (2026-10-29):** tabela `preferences` (chave/valor, migração `0002`) com `preferencesRepository` em `features/settings/model`. Entra em "Apagar todos os meus dados".
- **Estilização: NativeWind 4 + Tailwind 3 (2026-10-27).** `className` é o padrão; `StyleSheet`/`style` só em animação (Reanimated), valores dinâmicos ou bibliotecas sem `className` (REGRAS.md, regra 5). O NativeWind 5 ainda era release candidate na época; reavaliar quando sair estável. Configuração em `mobile/Pinny/`: `tailwind.config.ts` (lê os tokens de `src/theme/`), `src/global.css`, `babel.config.js` e `metro.config.js`.
- **Lint e formatação:** ESLint (`eslint-config-expo` + `eslint-plugin-react-native`) e Prettier, configurados em `mobile/Pinny/eslint.config.js` e `.prettierrc.json`. Rode `npm run lint`, `npm run typecheck` e `npm run format`.
- **Voz e IA (seção 5.7):** decisão adiada. Serviço de reconhecimento de voz, serviço de IA e onde roda o backend (para proteger a chave) serão definidos mais tarde, na etapa 10 do `todo.md`.

### Sugestões de bibliotecas (ainda não decididas)

Pontos de partida para quando cada etapa chegar. Confirme com o autor antes de adotar qualquer um.

- `react-native-reanimated` e `react-native-gesture-handler` para animações e arraste.
- Lista virtualizada para quadros muito grandes: adiada para depois da v1 (seção 10).
- Gerenciamento de estado e persistência local (o app deve funcionar offline).
- Notificações locais para lembretes.
- Acesso ao calendário do aparelho, câmera e galeria.
- Reconhecimento de voz e serviço de IA para interpretar a fala.
- Acelerômetro para o shake to undo.
- Módulos nativos para widgets e Live Activities.

---

## 10. Roadmap (depois da v1)

Funcionalidades já desejadas, mas fora da primeira versão:

- **Pet/mascote fofo** (animal ou robô) que reage às interações do usuário. Ele pode ter o mesmo nome do app.
- **Tema claro/escuro.**
- **Cores e tema personalizáveis**, incluindo cor por coluna.
- **Virtualização do quadro** (adiada em 2026-11-03): montar só os cartões visíveis de cada coluna (mais uma margem), usando as posições absolutas e as alturas que o arraste já calcula, e só as colunas perto da tela (com um espaço do mesmo tamanho no lugar das outras). Alternativa mais simples: paginar a montagem (ex.: 30 cartões por vez, mais ao rolar). Os dados continuam carregados inteiros; só a montagem é limitada. Cuidados: o cartão segurado nunca é desmontado durante o arraste, e o VoiceOver só enxerga o que está montado.

---

## 11. Orientações para o Claude neste projeto

- **Respeite o escopo da v1.** Não implemente modo escuro, cor por coluna nem o pet, a menos que o autor peça.
- **Priorize a qualidade das animações e gestos.** É o diferencial do app e o que mais conta no portfólio.
- **Código limpo e exemplar.** É um projeto de portfólio: TypeScript bem tipado, componentes reutilizáveis, organização clara de pastas e boas práticas.
- **Centralize só o fundamental em tokens:** cores (com sombras), tipografia e motion. Espaçamento, raio e tamanhos ficam nas classes de cada componente (REGRAS.md, regra 2).
- **Estilize com `className` (NativeWind).** Use `StyleSheet` ou `style` só quando a regra 5 do REGRAS.md permitir.
- **Textos da interface em português do Brasil**, com tom amigável.
- **Pergunte antes de decisões de arquitetura ou bibliotecas** que ainda estão em aberto (seção 9).
- **Siga as regras de privacidade, acessibilidade e conformidade da seção 12** em toda funcionalidade nova. Elas não são opcionais.
- **Mantenha este arquivo atualizado** quando algo novo for decidido.
- **Skeleton loading:** antes de implementar qualquer tela nova que carrega dados, pergunte ao autor se ela vai ter skeleton (lembrete fixo no topo do `todo.md`).
- **Siga a ordem de etapas do `todo.md`.** Antes de começar uma tarefa, veja em que etapa o projeto está. Ao concluir uma tarefa, marque-a com `[x]` e atualize o status da etapa na tabela do topo.

---

## 12. Regras de privacidade, acessibilidade e conformidade

Esta seção adapta ao app uma checklist de 20 pontos de conformidade. Como o projeto é um **app mobile publicado no Brasil**, a referência principal é a **LGPD** (Lei Geral de Proteção de Dados), além das regras da **App Store** e da **Google Play**.

Cada regra indica se vale **agora (v1)**, **quando acontecer** (só se a condição surgir) ou se **não se aplica** ao app.

> Este conteúdo é uma orientação técnica de produto, não aconselhamento jurídico. Antes de publicar nas lojas, revise os textos legais com cuidado.

### Princípio geral: privacidade por padrão

O app deve ser **local-first**: os dados do usuário (quadros, cards, fotos) ficam **no próprio aparelho** por padrão. Qualquer dado que saia do celular precisa de um motivo claro, aviso ao usuário e registro neste arquivo.

---

### Documentos legais

**1. Política de privacidade** — ✅ v1

- Obrigatória para publicar nas duas lojas, ainda mais porque o app acessa microfone, câmera, galeria, calendário e notificações.
- Deve explicar, em linguagem simples e amigável: quais dados são coletados, por quê, onde ficam, com quem são compartilhados (ex.: serviço de IA de voz), por quanto tempo e como apagá-los.
- Precisa estar acessível **dentro do app** (em Configurações) e por um link público (exigido no cadastro das lojas).

**2. Termos de uso** — ✅ v1

- Regras de uso do app, limitações de responsabilidade e, principalmente, o aviso de que a **IA pode interpretar a fala errado** e que o usuário deve conferir o card antes de confirmar.
- Acessível em Configurações.

**3. Política de reembolso** — ⏳ quando acontecer

- Só será necessária se o app tiver compras ou assinaturas.
- Nesse caso, reembolsos seguem as regras da App Store e da Google Play, e o app deve explicar isso claramente.

**4. Política de cookies** — 🚫 não se aplica ao app

- Apps nativos não usam cookies. Só passa a valer se houver um **site ou landing page** do app com analytics. Nesse caso, o site precisa da política.

---

### Consentimento e coleta de dados

**5. Banner de consentimento de cookies** — 🔁 adaptado para mobile

- O equivalente mobile é o **pedido de permissão de rastreamento**.
- Se algum dia houver analytics ou SDK que rastreie o usuário, no iOS é obrigatório o pedido de **App Tracking Transparency (ATT)**, e na LGPD o consentimento deve ser livre e opcional.
- Na v1, o ideal é **não rastrear** o usuário, e assim não precisar de nada disso.

**6. Consentimento nos formulários e permissões** — ✅ v1 (muito importante)

- Peça cada permissão **só no momento em que ela for necessária** (*just-in-time*), nunca tudo na abertura do app:
  - **Microfone e reconhecimento de voz:** ao tocar no botão de voz pela primeira vez.
  - **Câmera / galeria:** ao adicionar a primeira foto em um card.
  - **Calendário:** ao ativar o toggle de sincronização.
  - **Notificações:** ao criar o primeiro card com lembrete.
- Antes do pedido do sistema, mostre uma **tela curta e amigável explicando o porquê** da permissão.
- Se o usuário negar, o app **continua funcionando** sem aquela função e explica como reativar nas configurações do celular. Nunca bloqueie o app por uma permissão negada.
- Os textos de permissão (`NSMicrophoneUsageDescription`, `NSCameraUsageDescription`, `NSCalendarsUsageDescription` etc. no iOS) devem ser claros, específicos e em português.
- Sincronização com o calendário e envio de voz para IA começam **desligados** e só funcionam após ação do usuário.

**7. Sem dados desnecessários** — ✅ v1

- Colete apenas o mínimo necessário para cada função.
- A v1 **não precisa de conta, e-mail ou login**. Não peça.
- **Exceção decidida em 2026-10-28:** na primeira abertura, o app pede um **nome ou apelido** para a saudação ("Oi, Enzo"). Ele fica **só no aparelho**, nunca sai dele, e entra em "Apagar todos os meus dados". Por enquanto o nome está fixo ("Enzo") no `useHomeViewModel`; a tela de primeira abertura foi adiada para a etapa 12 do `todo.md`. Lembrar de citar esse dado na política de privacidade.
- Áudio de voz: envie para processamento apenas o necessário e **não guarde a gravação** depois que o card for criado.
- Fotos anexadas ficam no armazenamento local do app. Remova metadados sensíveis (ex.: localização GPS do EXIF) quando possível.
- Leia do calendário do celular apenas o necessário para a sincronização.

**8. Auditar SDKs de terceiros** — ✅ v1

- Mantenha nesta seção uma lista de **toda biblioteca ou serviço externo que acesse dados do usuário** (IA de voz, reconhecimento de fala, analytics, crash reporting etc.), com: o que coleta, para onde envia e por quê.
- Prefira bibliotecas sem coleta de dados. Antes de adicionar uma dependência nova, verifique se ela envia dados para fora.
- Essa lista é a base para preencher os **"Rótulos de privacidade" da App Store** e a seção **"Segurança dos dados" da Google Play**, que precisam ser fiéis ao que o app realmente faz.
- Desde iOS 17, inclua o **Privacy Manifest** (`PrivacyInfo.xcprivacy`) e confira se as bibliotecas usadas também têm o seu.

| SDK / serviço | Dados acessados | Enviado para | Motivo |
|---|---|---|---|
| `expo-sqlite` + `drizzle-orm` | Quadros, cartões, etiquetas, checklist e registros de anexos | Nada sai do aparelho (banco local `pinny.db`) | Persistência local-first |
| `expo-crypto` | Nenhum dado do usuário (só gera IDs aleatórios) | — | IDs únicos |
| `lucide-react-native`, `react-native-svg`, `expo-glass-effect`, `expo-haptics`, `@expo/ui`, `nativewind`, `zod`, `drizzle-zod` | Nenhum | — | Interface e validação |
| `expo-sensors` (acelerômetro) e o módulo local `shake-to-undo` | Movimento do aparelho, só para detectar o chacoalhar, e a opção "Agitar para Desfazer" do iOS | Nada sai do aparelho; nada é gravado | Desfazer ao chacoalhar |

---

### Design honesto

**9. Sem dark patterns** — ✅ v1

- Combina com o tom amigável do app. É proibido:
  - Pedidos de permissão ou avaliação insistentes ou enganosos.
  - Botões de "recusar" escondidos, apagados ou com texto que culpe o usuário ("Não, prefiro ficar desorganizado").
  - Notificações manipuladoras para forçar o uso.
  - Dificultar apagar dados ou desativar funções.
- Ações destrutivas (excluir coluna, quadro ou pasta) pedem confirmação clara e, sempre que possível, permitem desfazer (ver shake to undo).

**10. Sem taxas escondidas** — ⏳ quando acontecer

- Se houver monetização, o preço e o que está incluso devem aparecer **antes** da compra.
- Atenção especial à **IA de voz**: se ela gerar custo e for limitada ou paga, isso deve ficar claro desde o início, nunca revelado depois.

**11. Sem avaliações falsas** — ✅ v1

- Nada de depoimentos inventados na página da loja, no site ou no portfólio.
- Pedidos de avaliação devem usar a API oficial (`SKStoreReviewController` no iOS e In-App Review no Android), no máximo de vez em quando, e nunca oferecer recompensa em troca de nota.

**12. Sem afirmações sem comprovação** — ✅ v1

- Na descrição da loja, no README e no portfólio, não prometa o que o app não faz.
- Exemplos a evitar: "100% seguro", "a IA nunca erra", "seus dados nunca saem do celular" (falso se o áudio vai para um serviço externo).
- Descreva os recursos de forma precisa.

---

### Acessibilidade

O diferencial do app é o arraste de cards, que por natureza **não é acessível** para quem usa leitor de tela ou tem dificuldade motora. Por isso, acessibilidade é prioridade, não detalhe.

**13. Texto alternativo** — ✅ v1

- Todo elemento interativo e toda imagem relevante precisam de `accessibilityLabel` (e, quando útil, `accessibilityHint` e `accessibilityRole`).
- Cards devem ser lidos de forma completa. Exemplo: "Card Estudar para a prova, prioridade alta, prazo amanhã às 14h, 2 de 5 subtarefas concluídas".
- Fotos anexadas: permitir uma legenda ou usar um rótulo descritivo.
- Ilustrações puramente decorativas devem ser ocultadas do leitor de tela.

**14. Contraste de cores** — ✅ v1 (risco alto com a paleta pastel)

- Siga o **WCAG 2.1 AA**: contraste mínimo de **4.5:1** para texto normal e **3:1** para texto grande, ícones e bordas importantes.
- Use tons escuros para textos sobre fundos pastéis.
- Etiquetas coloridas, prioridades e estados de prazo **não podem depender só de cor**. Sempre combine com texto, ícone ou forma (ex.: prazo vencido tem ícone e texto, não só uma borda colorida).
- Verifique o contraste dos tokens de cor assim que forem definidos.

**15. Navegação acessível** — 🔁 adaptado para mobile

- No mobile, o equivalente da navegação por teclado é o suporte a **VoiceOver (iOS) e TalkBack (Android)**, além de teclados externos e controle por botão.
- **Obrigatório:** toda ação feita por gesto precisa de uma alternativa sem gesto:
  - Arrastar card → ação **"Mover para..."** (escolher coluna e posição) no menu do card e como `accessibilityActions`.
  - Reordenar colunas → opções "Mover para a esquerda / direita".
  - Seleção em lote → modo de seleção acessível por botões.
  - Shake to undo → botão ou aviso com **"Desfazer"** visível (ex.: snackbar). O gesto de chacoalhar deve poder ser desativado.
- Ordem de foco lógica, áreas de toque de no mínimo **44×44pt (iOS) / 48×48dp (Android)**.
- Respeitar o **tamanho de fonte do sistema** (Dynamic Type) sem quebrar o layout.
- Respeitar a opção **"Reduzir movimento"**: suavizar ou desligar animações não essenciais, como inclinação de cards e ondas sonoras.

---

### Transparência e públicos específicos

**16. Dados do responsável pelo app** — ✅ v1

- Na loja e dentro do app (tela "Sobre", em Configurações): nome do desenvolvedor, e-mail de contato para suporte e privacidade, e versão do app.
- A LGPD exige um canal para o titular exercer seus direitos. Esse e-mail cumpre esse papel.

**17. Consentimento de idade para dados de crianças** — ✅ v1 (cuidado com o estilo fofo)

- O visual fofo e pastel pode atrair crianças, mas o app é voltado a **público geral**, não infantil.
- Defina a **classificação etária** corretamente nas lojas e **não** cadastre o app como infantil (isso traz regras bem mais rígidas).
- Pela LGPD, dados de crianças exigem consentimento de um dos pais. Como a v1 não coleta dados pessoais em servidor, o risco é baixo. Mas, se o app passar a ter contas ou enviar dados, avalie um aviso de idade.
- O pet/mascote (futuro) reforça esse ponto. Revise esta regra quando ele entrar.

**18. Link de descadastro em e-mails** — ⏳ quando acontecer

- A v1 não envia e-mails.
- Equivalente atual: **notificações**. O usuário deve conseguir desativar lembretes e qualquer tipo de notificação facilmente, nas Configurações do app.
- Se no futuro houver e-mails (ex.: newsletter), todos precisam de link de descadastro de um clique.

**19. Licença de fontes e imagens** — ✅ v1

- A Nunito (fonte do app) é distribuída pela licença **SIL Open Font License**, que permite uso em apps. Mantenha o arquivo de licença junto à fonte no projeto.
- Ícones, ilustrações dos estados vazios e templates: use apenas material próprio, gerado com direitos claros ou com licença que permita uso comercial. Registre a origem de cada pacote.
- Ilustrações geradas por IA (incluindo pelo Figma): confira os termos de uso da ferramenta.
- **Fotos de exemplo** em `mobile/Pinny/assets/images/samples/` (`desk-proposal.jpg`, `desk-references.jpg`): vêm do Figma do projeto, geradas pela IA do Figma. Uso só na galeria de desenvolvimento; **não podem ir para a versão publicada** sem conferir os termos da ferramenta.
- Crie uma tela de **"Licenças de código aberto"** em Configurações listando as bibliotecas usadas.

**20. Pedido de exclusão de dados** — ✅ v1

- Em Configurações, opção **"Apagar todos os meus dados"**, com confirmação clara, que remove quadros, cards, fotos, histórico e preferências.
- Ao desativar a sincronização com o calendário, oferecer remover os eventos que o app criou.
- Se no futuro houver contas: a App Store exige **exclusão de conta dentro do app**, e a Google Play exige também um **link externo** para pedir a exclusão. A LGPD garante ao usuário o direito de pedir a exclusão dos seus dados.
- Opcional e bem-visto: **exportar os dados** (ex.: JSON) antes de apagar, atendendo ao direito de portabilidade da LGPD.

---

### Resumo: o que entra nas telas por causa desta seção

- **Configurações** ganha: Política de privacidade, Termos de uso, Sobre (contato e versão), Licenças de código aberto, Notificações (desativar), Desfazer ao chacoalhar (desativar), Exportar dados e Apagar todos os meus dados.
- **Telas de explicação de permissão** antes de microfone, câmera/galeria, calendário e notificações.
- **Menu do card** com a ação "Mover para...".
- **Snackbar de "Desfazer"** após ações importantes.

### Checklist antes de publicar

- [ ] Política de privacidade e termos de uso publicados e linkados no app e nas lojas
- [ ] Rótulos de privacidade (App Store), Segurança dos dados (Google Play) e Privacy Manifest preenchidos de acordo com a tabela de SDKs
- [ ] Todas as permissões pedidas no momento certo, com explicação, e o app funciona se forem negadas
- [ ] Contraste AA conferido em todos os tokens de cor
- [ ] Fluxos principais testados com VoiceOver e TalkBack, incluindo "Mover para..."
- [ ] Fonte grande do sistema e "Reduzir movimento" testados
- [ ] Classificação etária definida
- [ ] Licenças de fontes, ícones e ilustrações registradas
- [ ] "Apagar todos os meus dados" funcionando
- [ ] Descrição da loja revisada, sem promessas exageradas

---

## 13. Ferramentas de desenvolvimento

### ECC (Everything Claude Code)

- Instalado em **2026-10-26**, versão **2.2.3**, só neste projeto (`Pinny/.claude/`), com o perfil **core** e hooks `standard` (`npx ecc-universal@2.2.3 install --target claude-project --profile core --enable-hooks`).
- **A `/.claude/` é local e fica fora do git** (`.gitignore`), para a versão enxugada do ECC não ir para o GitHub. Ela foi removida também do histórico (reescrito em 2026-10-26). O `mobile/Pinny/.claude/settings.json` é do template do Expo e continua versionado.
- **Regras mantidas** em `.claude/rules/ecc/`: `common`, `typescript`, `react-native`, `swift` e `kotlin` (as duas últimas só carregam em arquivos `.swift`/`.kt`, para a etapa 13).
- **Removidas por conflito com este projeto:** `common/agents.md` (disparava agents automaticamente e aumentava o custo), `common/development-workflow.md` e `common/patterns.md` (pesquisa no GitHub e clonar projetos-base antes de codar), `typescript/testing.md` (Playwright, que é para web) e `react-native/production-readiness.md` (Sentry e analytics obrigatórios, o que contraria a seção 12). Também saíram as regras das linguagens que o app não usa, incluindo `web` e `react`.
- **Prioridade:** em caso de conflito, **`REGRAS.md` e este `CLAUDE.md` vencem as regras do ECC**. Exemplos: o limite de ~200 linhas do REGRAS.md vale em vez do de 400/800; TDD e cobertura de 80% do `common/testing.md` são recomendações, não obrigações; a "tela clara e escura" do `react-native/accessibility.md` não se aplica (v1 só tem tema claro).
- **Aprendizado contínuo (continuous-learning-v2):** observa as sessões e cria "instincts" a partir das correções do autor. Os dados ficam locais, em `~/.local/share/ecc-homunculus/`. A análise roda com o Haiku via CLI `claude` a cada 5 minutos.
- Ao atualizar ou reinstalar o ECC, as regras removidas voltam. Repita a limpeza acima.
- **Enxugamento (2026-10-26):** o `/context` mediu ~20,5 mil tokens do ECC por mensagem (agents 5,9k, skills/commands ~7,7k, regras ~6,9k), o dobro da estimativa. Foram removidos:
  - **43 agents** de outras linguagens/áreas (C++, C#, F#, Dart/Flutter, Django, FastAPI, Python, PyTorch, ML, RAG, Go, Java, Rust, PHP, Vue, HarmonyOS, React web, Postgres, rede, homelab, saúde, marketing, SEO, chief-of-staff, opensource-*, gan-*, e2e-runner, agent-evaluator, harness-optimizer, loop-operator, spec-miner).
  - **44 commands** (cpp/go/rust/flutter/python/fastapi/vue, react-build, epic-*, jira, pm2, setup-pm, marketing, model-route, multi-*, orch-*, gan-*, santa-loop, auto-update, plan-canvas). O `gradle-build` ficou (Android do RN).
  - **17 skills** (continuous-learning v1, windows-desktop-e2e, browser-qa, e2e-testing, codehealth-mcp, repo-scan, council-multi-model, santa-method, dev-team, eval-harness, loop-design-check, skill-comply, delivery-gate, growth-log, unified-memory, inherit-legacy-style, plankton-code-quality).
  - **3 regras**: `rules/ecc/README.md` (manual de instalação), `common/performance.md` e `common/hooks.md`.
  - Ficaram 25 agents, 50 commands e 31 skills. Para restaurar algum, copie-o da instalação original do `npx ecc-universal@2.2.3` (o histórico do git não tem mais a `.claude`).
- **Reinstalar ou levar para outro projeto:** use o repositório privado [`EnzoFelyx/ecc-rn-setup`](https://github.com/EnzoFelyx/ecc-rn-setup). O `./install.sh <projeto>` reproduz esta instalação: perfil core, as 224 remoções, GateGuard desligado, observer ligado, `CLAUDE_PLUGIN_ROOT` e `/.claude/` no `.gitignore`. O `./export-instincts.sh <projeto>` faz backup dos instincts.
  - **Depois do enxugamento** (`/context` de 2026-10-26): ~11,9 mil tokens do ECC por mensagem (agents 2k, skills ~3,5k, commands ~2,6k, regras ~3,8k), uma queda de ~42%. As regras de `typescript`, `react-native`, `swift` e `kotlin` não carregam sem arquivos desses tipos. Para comparar: `CLAUDE.md` + `REGRAS.md` somam ~18,2 mil.
- O `npx ecc-universal@2.2.3 doctor` acusa `missing-managed-files` por causa das regras e dos itens removidos acima e `drifted-managed-files` por causa do `env` no `settings.json`. **É esperado**, não é erro.
- **GateGuard desligado** via `env.ECC_DISABLED_HOOKS` no `.claude/settings.json` (gastava tokens exigindo "fatos" antes de cada Bash/edição).
- **`env.CLAUDE_PLUGIN_ROOT`** no `.claude/settings.json` aponta para `Pinny/.claude`. Sem ele, `/instinct-status`, `/promote`, `/evolve`, `/prune`, `/projects` e `/skill-health` procuram o ECC em `~/.claude` e falham. O caminho é absoluto: se a pasta do projeto mudar de lugar, atualize-o.
- O observer chama `claude` pelo PATH. A CLI fica em `~/.local/bin`, que não está no PATH do VS Code, por isso existe o link `/opt/homebrew/bin/claude → ~/.local/bin/claude`.
- O aprendizado só separa por projeto dentro de um **repositório git**. O ID do Pinny no homunculus é `5f5ce44e3be0` (hash do remote do GitHub).

### Repositório git

- **Monorepo único na raiz** (`Pinny/`), com remote `https://github.com/EnzoFelyx/Pinny.git` e branch `main`. Decidido em 2026-10-26.
- `mobile/Pinny` não pode ter `.git` próprio: um repositório aninhado divide o versionamento e os instincts do ECC.
- `.gitignore` geral na raiz; cada pacote mantém o seu (ex.: `mobile/Pinny/.gitignore`, do Expo).
