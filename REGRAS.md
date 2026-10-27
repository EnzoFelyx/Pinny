# REGRAS.md — Regras de código do projeto

> Consulte este arquivo **antes de escrever, alterar ou revisar qualquer código** deste projeto.
> As regras da **Parte 1 são obrigatórias**. As da **Parte 2 são boas práticas adotadas** pelo projeto e também devem ser seguidas, salvo quando o autor disser o contrário.
> Se alguma regra impedir uma tarefa, **pare e pergunte** ao autor em vez de quebrá-la em silêncio.

---

# Parte 1 — Regras obrigatórias

## Regra 1 — Arquitetura MVVM

Todo o app segue **MVVM (Model–View–ViewModel)**, adaptado para React Native:

| Camada | O que é no projeto | Responsabilidade | Não pode |
|---|---|---|---|
| **Model** | Tipos, entidades, repositórios e serviços | Dados e regras de negócio: estrutura de um card, persistência local, chamada à IA, calendário, notificações | Importar nada de UI (componentes, hooks de tela, estilos) |
| **ViewModel** | Hook customizado `useNomeDaTelaViewModel` | Estado da tela, ações do usuário, formatação de dados para exibição, chamadas ao Model | Retornar JSX, conter estilos ou acessar diretamente APIs nativas sem passar pelo Model |
| **View** | Componente da tela (`.tsx`) | Renderizar a interface a partir do que o ViewModel entrega e repassar eventos | Conter regra de negócio, acessar armazenamento ou serviços, fazer cálculos além do trivial |

### Fluxo

```
View  ──(eventos do usuário)──►  ViewModel  ──►  Model (repositórios / serviços)
View  ◄──(estado pronto para exibir)──  ViewModel  ◄──  Model
```

### Exemplo de estrutura de uma tela

```
src/features/board/
├── model/
│   ├── board.types.ts          # Board, Column, Card...
│   ├── boardRepository.ts      # persistência local
│   └── boardAutomations.ts     # regras das automações (lógica pura)
├── viewmodel/
│   └── useBoardViewModel.ts    # estado e ações da tela do quadro
└── view/
    ├── BoardScreen.tsx         # só renderiza
    └── components/             # componentes exclusivos desta feature
```

### Regras práticas

- **Uma tela = uma View + um ViewModel.** A View chama apenas o seu ViewModel.
- O ViewModel expõe **dados já prontos para exibir** (ex.: `deadlineLabel: "Amanhã às 14h"`, `progressText: "2 de 5"`), e a View não formata nada.
- O ViewModel expõe **ações com nomes de intenção**: `moveCard`, `confirmVoiceCard`, `toggleCalendarSync`. Nada de expor `setState` cru.
- Lógica de negócio que não depende de React (cálculo de prazo, automações, interpretação da resposta da IA) fica em **funções puras no Model**, fáceis de testar.
- Serviços externos (IA de voz, calendário, notificações, câmera) ficam atrás de uma **interface** no Model. O ViewModel depende da interface, não da biblioteca. Assim dá para trocar a biblioteca ou usar um mock nos testes.

---

## Regra 2 — Todas as cores em um único lugar

- **Todas as cores do app ficam em um único arquivo de tema**: `src/theme/colors.ts`.
- O arquivo tem duas camadas:
  1. **Paleta base**: os valores brutos (`lavender100`, `mint200`, `cream50`...). Só este arquivo pode conter códigos hexadecimais.
  2. **Tokens semânticos**: nomes pelo **uso**, não pela cor (`background`, `surface`, `columnBackground`, `textPrimary`, `textSecondary`, `border`, `deadlineSoon`, `deadlineOverdue`, `priorityHigh`...).
- Componentes e telas usam **somente os tokens semânticos**, nunca a paleta base diretamente.

```ts
// src/theme/colors.ts
const palette = {
  cream50: '#FFF9F2',
  lavender200: '#DCD3F5',
  ink900: '#2E2A3A',
  // ...
} as const;

export const colors = {
  background: palette.cream50,
  columnBackground: palette.lavender200,
  textPrimary: palette.ink900,
  // ...
} as const;

export type ColorToken = keyof typeof colors;
```

- Isso facilita a manutenção e prepara o terreno para o tema escuro e as cores customizáveis do roadmap, sem precisar mexer em cada tela.
- **Só o fundamental vira token** (decisão do autor, 2026-10-27). Em `src/theme/` ficam apenas:
  - `colors.ts`: cores **e sombras** (`shadows.card`, `shadows.lifted`).
  - `typography.ts`: família, tamanho, peso e altura de linha dos textos.
  - `motion.ts`: durações e configurações de animação.
- **Espaçamento, raio de borda e tamanhos de componente não viram token.** Eles ficam nas classes do próprio componente, usando a escala do Tailwind ou valores arbitrários (`p-3`, `rounded-[18px]`). Não crie `spacing.ts`, `radius.ts` nem `sizes.ts`.
- O `tailwind.config.ts` **não tem valores próprios**: ele só lê `colors.ts` e `typography.ts` e traduz para classes (`bg-surface`, `text-text-primary`, `text-display`, `shadow-card`). A paleta padrão do Tailwind foi removida, então `bg-white` ou `text-red-500` não existem.
- Ao definir ou alterar uma cor de texto, confira o **contraste AA** (ver regra 14 da seção 12 do CLAUDE.md).

---

## Regra 3 — Nunca usar cor hardcoded

- É **proibido** escrever cores diretamente em componentes, estilos ou telas: nada de `'#FFF'`, `'white'`, `'rgba(0,0,0,0.1)'` ou `'red'` fora de `src/theme/colors.ts`.
- **Exceção, só em extrema necessidade** (ex.: uma cor exigida por uma API nativa ou biblioteca que não aceita token, como configuração de widget em Swift/Kotlin):
  1. Primeiro tente usar ou criar um token.
  2. Se for mesmo impossível, deixe um comentário logo acima explicando o motivo:

     ```ts
     // COR-HARDCODED: o WidgetKit não lê o tema do JS; manter igual a colors.surface
     ```

  3. Avise o autor na resposta que uma exceção foi criada.
- No código nativo (widgets, Live Activities), centralize as cores também em **um único arquivo por plataforma** (ex.: `WidgetColors.swift`, `widget_colors.xml`), espelhando os tokens do JS.
- **Garantia automática:** ativar a regra de lint `react-native/no-color-literals` (do `eslint-plugin-react-native`) para que o projeto acuse erro ao encontrar cor solta no código.
- Em `className`, também é proibido usar cor arbitrária (`bg-[#fff]`, `text-[rgb(...)]`). A `no-color-literals` não enxerga `className`, então o lint precisa de uma regra própria para isso.

---

## Regra 5 — Estilização com NativeWind (className primeiro)

- O padrão de estilo do app é o **NativeWind** (Tailwind para React Native): estilize com `className`.
- `StyleSheet.create` e a prop `style` **só** entram quando `className` não resolve:
  1. Estilos animados do Reanimated (`useAnimatedStyle`, valores compartilhados).
  2. Valores calculados em tempo de execução (ex.: posição do cartão durante o arraste, largura vinda de uma medição).
  3. Props de bibliotecas que não aceitam `className`.
- Objeto de estilo escrito direto no JSX (`style={{ ... }}`) continua proibido (`react-native/no-inline-styles`). Quando `style` for necessário, use `StyleSheet.create` ou o estilo animado.
- Quando um estilo precisar de cor, sombra ou texto fora do `className`, importe os tokens de `@/theme` (`colors`, `shadows`, `textScale`), nunca valores soltos.
- Classes que mudam por variante ou estado ficam em um mapa tipado no componente (ex.: `const variantClass: Record<ButtonVariant, string>`), não em strings montadas espalhadas pelo JSX.

---

## Regra 4 — Reutilização de componentes e zero duplicidade

- **Não duplique código.** Se um trecho de UI ou de lógica aparece pela **segunda vez**, extraia para um componente, hook ou função reutilizável antes de seguir.
- **Antes de criar algo novo, procure se já existe** um componente, hook ou utilitário parecido no projeto. Prefira estender o existente (com props) a criar uma cópia.
- Onde cada coisa reutilizável vive:
  - `src/components/` — biblioteca de componentes compartilhados (Card, Coluna, Etiqueta, Chip de prioridade, Botões, FAB, Input, Toggle, Barra de progresso, Bottom sheet, estado vazio...).
  - `src/hooks/` — hooks compartilhados (ex.: `usePermission`, `useReducedMotion`, `useHaptics`).
  - `src/utils/` — funções puras compartilhadas (datas, formatação, IDs).
  - `src/features/<feature>/view/components/` — componentes usados **só** por aquela feature. Se outra feature precisar, mova para `src/components/`.
- Componentes compartilhados devem ser **genéricos e configuráveis por props**, sem saber em qual tela estão.
- Variações de um mesmo componente usam **props de variante** (ex.: `<Button variant="primary" | "secondary" />`), e não componentes copiados (`PrimaryButton`, `SecondaryButton` com código repetido).
- Conjuntos de classes repetidos viram um componente ou uma constante compartilhada, nunca cópias.

---

# Parte 2 — Boas práticas adotadas no projeto

## TypeScript

- `strict: true` no `tsconfig.json`.
- **Proibido `any`.** Use tipos explícitos, `unknown` com validação ou genéricos.
- Tipos das entidades (Card, Column, Board, Folder) definidos uma única vez no Model e reutilizados em todo lugar.
- Prefira **union types** a strings soltas: `type Priority = 'low' | 'medium' | 'high'`.
- Dados que vêm de fora (resposta da IA, armazenamento local) devem ser **validados** antes de usar (ex.: com uma biblioteca de schema como Zod, a confirmar com o autor).

## Organização e nomes

- **Pastas por feature** (`board`, `card`, `calendar`, `voice`, `automations`, `settings`, `folders`, `templates`), cada uma com `model/`, `viewmodel/` e `view/`.
- Componentes e telas em **PascalCase** (`BoardScreen.tsx`); hooks começando com `use` (`useBoardViewModel.ts`); funções e variáveis em **camelCase**; constantes globais em **UPPER_SNAKE_CASE**.
- Código (nomes de variáveis, funções, tipos) em **inglês**; textos exibidos ao usuário em **português do Brasil**.
- **Imports absolutos** com alias (ex.: `@/components/Button` em vez de `../../../components/Button`).
- Arquivos pequenos e focados. Se uma View ou ViewModel passar de ~200 linhas, avalie dividir.

## Textos centralizados

- Assim como as cores, **todos os textos da interface ficam centralizados** (ex.: `src/i18n/pt-BR.ts`), nunca escritos direto no JSX.
- Isso facilita revisar o tom amigável em um lugar só e deixa o app pronto para outros idiomas no futuro.

## Sem números mágicos

- Durações de animação e limites do app (ex.: "arquivar após X dias", "prazo próximo = 24h") ficam em **constantes nomeadas** (`src/constants/`) ou nos tokens do tema, nunca soltos no código.
- Exceção: valores de layout (espaçamento, raio, tamanho) nas classes do próprio componente são permitidos (ver regras 2 e 5).

## Estado e dados

- Estado de tela no ViewModel; estado global só para o que é realmente compartilhado entre telas (quadros, cards, configurações).
- O app é **local-first**: o acesso a dados passa sempre pelos **repositórios** do Model, nunca direto do ViewModel para o armazenamento.
- Estado imutável: nunca altere objetos e arrays diretamente; crie novos.
- Toda ação que altera dados deve ser registrada no **histórico de ações**, para alimentar o "Desfazer" (shake to undo e snackbar).

## Performance (crucial para o diferencial do app)

- Animações e gestos rodando na **UI thread** (worklets do Reanimated), nunca dependendo de re-render do React a cada frame.
- Listas de cards **virtualizadas**, com `keyExtractor` estável e itens memoizados.
- Use `React.memo`, `useCallback` e `useMemo` onde evitam re-renders reais em listas e componentes pesados, sem exagero no resto.
- Evite funções e objetos criados inline em props de itens de lista.
- Imagens anexadas: gere **miniaturas** para exibir nos cards em vez de carregar a foto inteira.
- Teste a performance em **build de release** e em um aparelho Android intermediário, não só no simulador.

## Tratamento de erros

- Toda chamada a serviço externo (IA, calendário, permissões, armazenamento) trata o erro e mostra uma **mensagem amigável** ao usuário, sem travar o app.
- Falha na IA de voz deve permitir que o usuário **preencha o card manualmente**.
- Nunca engula erros em silêncio (`catch {}` vazio). Registre ou trate.

## Acessibilidade em todo componente

- Componentes compartilhados já nascem com `accessibilityLabel`, `accessibilityRole` e área de toque mínima.
- Todo gesto tem alternativa sem gesto (ver regra 15 da seção 12 do CLAUDE.md).
- Respeitar "Reduzir movimento" usando o hook compartilhado de movimento reduzido.

## Testes

- **ViewModels e funções do Model** devem ter testes unitários (Jest). São a parte mais importante a testar, porque concentram a lógica.
- Componentes compartilhados testados com **React Native Testing Library**, priorizando comportamento e acessibilidade.
- Serviços externos substituídos por **mocks** nos testes, usando as interfaces do Model.
- Funções puras críticas com testes obrigatórios: cálculo de estado de prazo, automações de coluna, reordenação de cards e interpretação da resposta da IA.

## Qualidade automática

- **ESLint + Prettier** configurados e rodando no projeto.
- Regras de lint que reforçam este arquivo: `react-native/no-color-literals`, `react-native/no-inline-styles`, `@typescript-eslint/no-explicit-any`, `react-hooks/exhaustive-deps` e a proibição de cor arbitrária em `className` (`no-restricted-syntax`).
- **Hook de pre-commit** (ex.: Husky + lint-staged) rodando lint, checagem de tipos e testes afetados.
- Nenhum `console.log` esquecido no código final.

## Git

- Commits pequenos e com mensagens no padrão **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- Uma branch por funcionalidade.
- README do projeto bem escrito, já que é portfólio: objetivo, prints/GIFs, arquitetura (MVVM), tecnologias, como rodar e decisões técnicas.

## Segurança

- **Nenhuma chave de API no código.** Chaves (ex.: do serviço de IA) ficam fora do repositório, em variáveis de ambiente não versionadas, e o ideal é que a chamada à IA passe por um backend próprio para a chave não ficar exposta no app.
- `.env` e arquivos de credenciais no `.gitignore`.

---

# Checklist antes de entregar qualquer código

- [ ] Segue MVVM: View sem lógica, ViewModel sem JSX, Model sem UI?
- [ ] Nenhuma cor hardcoded fora de `src/theme/colors.ts` (ou exceção comentada e avisada)?
- [ ] Estilizou com `className` (NativeWind), deixando `StyleSheet`/`style` só para animação, valores dinâmicos ou bibliotecas sem `className`?
- [ ] Usou os tokens do tema para cor, sombra, texto e animação?
- [ ] Procurou componentes existentes antes de criar? Nada duplicado?
- [ ] Textos vindos do arquivo central de pt-BR?
- [ ] Tipado sem `any`?
- [ ] Acessibilidade aplicada (labels, roles, área de toque, alternativa a gestos)?
- [ ] Erros tratados com mensagem amigável?
- [ ] Testes do ViewModel/Model criados ou atualizados?
- [ ] Respeita o escopo da v1 e as regras da seção 12 do CLAUDE.md?
