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

Os valores hexadecimais exatos ainda serão definidos a partir do design gerado no Figma. Quando estiverem definidos, registre-os aqui.

> ⚠️ **Atenção ao contraste:** tons pastéis costumam ter contraste baixo. Texto e ícones **nunca** devem ser pastéis sobre fundo pastel. O pastel fica no fundo e nas superfícies; textos usam tons escuros. Ver regra 14 da seção 12.

### Forma e espaçamento
- Cantos bem arredondados: **16 a 24px**.
- Sombras suaves e difusas.
- Bastante respiro entre os elementos.

### Tipografia
- Fonte do app: **Nunito** ✅ (sans-serif arredondada e amigável, licença SIL OFL).
- Títulos em peso **semibold**.

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
- **Cards infinitos** por coluna, o que exige listas performáticas e virtualizadas.
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

---

## 9. Stack técnica

### Decidido
- **React Native + TypeScript.**
- **Expo com dev client** (por causa dos módulos nativos: widgets, Live Activities etc.). Não usar React Native CLI puro nem Expo Go.
- **Arquitetura MVVM**, com cores centralizadas e reutilização de componentes. Detalhes no `REGRAS.md`.
- **Fonte:** Nunito.
- **Bibliotecas:** serão escolhidas e instaladas **conforme a necessidade de cada etapa**, não todas de uma vez. Não instale bibliotecas antecipadamente. Ao chegar numa etapa que precise de uma, proponha a opção e confirme com o autor antes de instalar.
- **Voz e IA (seção 5.7):** decisão adiada. Serviço de reconhecimento de voz, serviço de IA e onde roda o backend (para proteger a chave) serão definidos mais tarde, na etapa 10 do `todo.md`.

### Sugestões de bibliotecas (ainda não decididas)
Pontos de partida para quando cada etapa chegar. Confirme com o autor antes de adotar qualquer um.
- `react-native-reanimated` e `react-native-gesture-handler` para animações e arraste.
- Lista virtualizada performática para os cards infinitos (ex.: FlashList).
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

---

## 11. Orientações para o Claude neste projeto

- **Respeite o escopo da v1.** Não implemente modo escuro, cor por coluna nem o pet, a menos que o autor peça.
- **Priorize a qualidade das animações e gestos.** É o diferencial do app e o que mais conta no portfólio.
- **Código limpo e exemplar.** É um projeto de portfólio: TypeScript bem tipado, componentes reutilizáveis, organização clara de pastas e boas práticas.
- **Centralize as cores, espaçamentos e fontes em tokens de design**, mesmo sem tema escuro agora.
- **Textos da interface em português do Brasil**, com tom amigável.
- **Pergunte antes de decisões de arquitetura ou bibliotecas** que ainda estão em aberto (seção 9).
- **Siga as regras de privacidade, acessibilidade e conformidade da seção 12** em toda funcionalidade nova. Elas não são opcionais.
- **Mantenha este arquivo atualizado** quando algo novo for decidido.
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
- A v1 **não precisa de conta, e-mail, nome ou login**. Não peça.
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
| _(preencher conforme as bibliotecas forem escolhidas)_ | | | |

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
  - Ficaram 25 agents, 50 commands e 31 skills. Para restaurar algum: `git checkout dedf05e -- .claude/<caminho>`.
- O `npx ecc-universal@2.2.3 doctor` acusa `missing-managed-files` por causa das regras e dos itens removidos acima e `drifted-managed-files` por causa do `env` no `settings.json`. **É esperado**, não é erro.
- **GateGuard desligado** via `env.ECC_DISABLED_HOOKS` no `.claude/settings.json` (gastava tokens exigindo "fatos" antes de cada Bash/edição).
- O observer chama `claude` pelo PATH. A CLI fica em `~/.local/bin`, que não está no PATH do VS Code, por isso existe o link `/opt/homebrew/bin/claude → ~/.local/bin/claude`.
- O aprendizado só separa por projeto dentro de um **repositório git**. O ID do Pinny no homunculus é `5f5ce44e3be0` (hash do remote do GitHub).

### Repositório git
- **Monorepo único na raiz** (`Pinny/`), com remote `https://github.com/EnzoFelyx/Pinny.git` e branch `main`. Decidido em 2026-10-26.
- `mobile/Pinny` não pode ter `.git` próprio: um repositório aninhado divide o versionamento e os instincts do ECC.
- `.gitignore` geral na raiz; cada pacote mantém o seu (ex.: `mobile/Pinny/.gitignore`, do Expo).
