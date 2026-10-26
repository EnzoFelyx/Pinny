# todo.md — Roadmap de desenvolvimento da v1

> Ordem de construção do app, dividida em etapas.
> Cada etapa tem um **objetivo**, as **tarefas** e o critério de **pronto quando**.
> Marque as tarefas com `[x]` conforme forem concluídas. Uma etapa só termina quando todos os critérios de "pronto quando" forem atendidos.
> Toda tarefa segue as regras do `REGRAS.md` e o escopo do `CLAUDE.md`.

**Legenda de status:** ⬜ não iniciada · 🟨 em andamento · ✅ concluída

| # | Etapa | Status |
|---|---|---|
| 0 | Decisões pendentes | 🟨 |
| 1 | Fundação do projeto | ⬜ |
| 2 | Tema e textos centralizados | ⬜ |
| 3 | Biblioteca de componentes | ⬜ |
| 4 | Dados local-first | ⬜ |
| 5 | Navegação e estrutura das telas | ⬜ |
| 6 | Quadro kanban (o diferencial) | ⬜ |
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
- [ ] Extrair do Figma os valores exatos das cores e registrar no `CLAUDE.md`
- [x] Escolher a fonte → **Nunito**
- [x] Decidir: Expo (com dev client) ou React Native CLI → **Expo com dev client**
- [x] Decidir as bibliotecas → **escolhidas e instaladas conforme a necessidade de cada etapa**, sempre confirmando com o autor
- [x] Decidir onde roda o backend da IA de voz → **adiado para a etapa 10**
- [x] Registrar todas as decisões na seção 9 do `CLAUDE.md`

**Pronto quando:** não houver mais nenhum item "a decidir" na seção 9 do `CLAUDE.md` que bloqueie as próximas etapas.

---

## Etapa 1 — Fundação do projeto

**Objetivo:** projeto criado, organizado e com qualidade automática desde o primeiro commit.

- [ ] Criar o projeto com Expo (dev client) e TypeScript em modo `strict`
- [ ] Criar o repositório Git, `.gitignore` (incluindo `.env`) e a primeira branch
- [ ] Montar a estrutura de pastas MVVM por feature (`src/features`, `src/components`, `src/hooks`, `src/utils`, `src/theme`, `src/i18n`)
- [ ] Configurar imports absolutos com alias (`@/`)
- [ ] Configurar ESLint e Prettier com as regras: `react-native/no-color-literals`, `react-native/no-inline-styles`, `@typescript-eslint/no-explicit-any`, `react-hooks/exhaustive-deps`
- [ ] Configurar Jest e React Native Testing Library
- [ ] Configurar hook de pre-commit (lint, tipos e testes)
- [ ] Criar um README inicial com objetivo, stack e como rodar
- [ ] Rodar o app vazio no iOS e no Android

**Pronto quando:** o app abre nas duas plataformas, e lint, checagem de tipos e testes passam no pre-commit.

---

## Etapa 2 — Tema e textos centralizados

**Objetivo:** todo valor visual e todo texto do app em um único lugar.

- [ ] `src/theme/colors.ts` com paleta base e tokens semânticos
- [ ] Conferir o contraste AA de todos os tokens de texto e ícone
- [ ] `spacing.ts`, `radius.ts`, `shadows.ts`, `typography.ts` e `motion.ts`
- [ ] Instalar a fonte Nunito e guardar o arquivo de licença (OFL)
- [ ] `src/i18n/pt-BR.ts` com a estrutura dos textos da interface
- [ ] Constantes nomeadas para limites do app (ex.: "prazo próximo = 24h")

**Pronto quando:** nenhum componente precisar de cor, tamanho ou texto escrito à mão, e o lint acusar cores soltas.

---

## Etapa 3 — Biblioteca de componentes

**Objetivo:** todos os componentes reutilizáveis prontos, acessíveis e testados antes das telas.

- [ ] Botão (variantes primária e secundária)
- [ ] Botão flutuante (FAB)
- [ ] Input
- [ ] Toggle
- [ ] Etiqueta
- [ ] Chip de prioridade (com ícone e texto, não só cor)
- [ ] Barra de progresso
- [ ] Bottom sheet
- [ ] Card (post-it), incluindo os estados de prazo
- [ ] Coluna
- [ ] Estado vazio com ilustração
- [ ] Snackbar (para o "Desfazer")
- [ ] Hooks compartilhados: `useReducedMotion`, `useHaptics`, `usePermission`
- [ ] Testes de cada componente, incluindo acessibilidade

**Pronto quando:** todos os componentes tiverem `accessibilityLabel`/`accessibilityRole`, área de toque mínima, testes passando e seguirem o Figma.

---

## Etapa 4 — Dados local-first

**Objetivo:** a camada Model completa, funcionando offline.

- [ ] Tipos das entidades: Folder, Board, Column, Card, Label, Checklist, Attachment
- [ ] Repositórios com interfaces (pastas, quadros, colunas, cards)
- [ ] Persistência local escolhida na etapa 0
- [ ] Validação dos dados lidos do armazenamento
- [ ] Histórico de ações (base do "Desfazer")
- [ ] Funções puras: estado do prazo, reordenação de cards e colunas
- [ ] Testes unitários dos repositórios e das funções puras

**Pronto quando:** for possível criar, editar, mover e apagar dados, fechar o app, abrir de novo e tudo continuar lá, com testes cobrindo a lógica.

---

## Etapa 5 — Navegação e estrutura das telas

**Objetivo:** o esqueleto navegável do app.

- [ ] Configurar a navegação entre as telas
- [ ] Criar View e ViewModel vazios para cada tela da seção 6 do `CLAUDE.md`
- [ ] Tela Início: listar pastas e quadros a partir dos repositórios

**Pronto quando:** for possível navegar por todas as telas, mesmo que ainda incompletas.

---

## Etapa 6 — Quadro kanban (o diferencial)

**Objetivo:** a tela principal com a movimentação mais fluida possível.

- [ ] Colunas lado a lado com scroll horizontal
- [ ] Criar, renomear e excluir colunas (com confirmação e desfazer)
- [ ] Contador de cards por coluna e "+ Adicionar coluna"
- [ ] Lista virtualizada de cards por coluna
- [ ] Arrastar card na mesma coluna
- [ ] Arrastar card entre colunas, com scroll automático nas bordas
- [ ] Card inclinado e elevado durante o arraste, com feedback tátil
- [ ] Reordenar colunas segurando e arrastando
- [ ] Modo de seleção múltipla e arraste em lote
- [ ] Alternativa acessível: ação "Mover para..." e `accessibilityActions`
- [ ] Alternativa acessível para reordenar colunas
- [ ] Respeitar "Reduzir movimento"
- [ ] Testes do ViewModel do quadro

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
- [ ] Shake to undo usando o histórico de ações
- [ ] Snackbar "Desfazer" após ações importantes
- [ ] Testes das automações e do desfazer

**Pronto quando:** as automações rodarem corretamente, e mover, editar ou excluir puderem ser desfeitos tanto chacoalhando quanto pelo botão.

---

## Etapa 12 — Configurações e privacidade

**Objetivo:** cumprir as regras da seção 12 do `CLAUDE.md` dentro do app.

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
