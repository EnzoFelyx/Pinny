# todo.md — Roadmap de desenvolvimento da v1

> Ordem de construção do app, dividida em etapas.
> Cada etapa tem um **objetivo**, as **tarefas** e o critério de **pronto quando**.
> Marque as tarefas com `[x]` conforme forem concluídas. Uma etapa só termina quando todos os critérios de "pronto quando" forem atendidos.
> Toda tarefa segue as regras do `REGRAS.md` e o escopo do `CLAUDE.md`.

**Legenda de status:** ⬜ não iniciada · 🟨 em andamento · ✅ concluída

| # | Etapa | Status |
|---|---|---|
| 0 | Decisões pendentes | ✅ |
| 1 | Fundação do projeto | ✅ |
| 2 | Tema e textos centralizados | ✅ |
| 3 | Biblioteca de componentes | ✅ |
| 4 | Dados local-first | ✅ |
| 5 | Navegação e estrutura das telas | ✅ |
| 6 | Quadro kanban (o diferencial) | 🟨 |
| 7 | Card completo | ⬜ |
| 8 | Pastas e templates | ⬜ |
| 9 | Notificações e calendário | ⬜ |
| 10 | Agendamento por voz com IA | ⬜ |
| 11 | Automações e desfazer | ⬜ |
| 12 | Configurações e privacidade | ⬜ |
| 13 | Widgets e Live Activities | ⬜ |
| 14 | Polimento, testes e publicação | ⬜ |

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

> **Adiado (decisão de 2026-10-27):** Android, tudo que envolve testes (Jest, Testing Library, pre-commit com testes) e o README inicial. O README fica para a etapa 14. Android e testes voltam quando o autor pedir.

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
- [ ] Menu "…" do topo do quadro (com "Nova coluna"), adiado da 6.3
- [ ] Reordenar colunas segurando e arrastando
- [x] Alternativa acessível para reordenar colunas ("Mover para trás/frente" no menu da coluna, feito na 6.3)

### 6.5 — Seleção em lote
- [ ] Modo de seleção múltipla e arraste em lote

### 6.6 — Virtualização e desempenho
- [ ] Lista virtualizada de cards por coluna (montar só os cartões visíveis)
- [ ] Medir 60fps em build de release
- [ ] Testes do ViewModel do quadro (quando os testes voltarem)

**Pronto quando:** o arraste rodar a 60fps em build de release num Android intermediário, e todas as ações também funcionarem pelo VoiceOver e pelo TalkBack.

---

## Etapa 7 — Card completo

**Objetivo:** o detalhe do card com todos os campos.

- [ ] Tela/bottom sheet de detalhe do card
- [ ] Título e descrição
- [ ] Etiquetas coloridas
- [ ] Prioridade
- [ ] Data e horário
- [ ] Checklist de subtarefas com barra de progresso
- [ ] Anexar foto pela câmera ou galeria (permissão just-in-time, sem EXIF de localização, miniatura)
- [ ] Trocar a coluna/status
- [ ] Indicador visual de prazo nos cards (normal, próximo, vencido)
- [ ] Tela Criar card
- [ ] Testes do ViewModel

**Pronto quando:** todos os campos da seção 5.2 do `CLAUDE.md` funcionarem e forem salvos, e o app continuar funcionando se a permissão de câmera for negada.

---

## Etapa 8 — Pastas e templates

**Objetivo:** organizar vários quadros e começar rápido.

- [ ] Criar, renomear e excluir pastas
- [ ] Criar, renomear, mover e excluir quadros
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
