// Textos da interface. O nome do app também está no app.json (único outro lugar).
// Na UI usamos "cartão"; no código, "card".
export const ptBR = {
  appName: 'Pinny',
  common: {
    undo: 'Desfazer',
    back: 'Voltar',
    databaseError:
      'Não conseguimos abrir seus quadros agora. Feche o Pinny e abra de novo, por favor.',
    loadError: 'Não conseguimos carregar suas pastas. Tente de novo em instantes.',
    saveError: 'Não deu para salvar agora. Tente de novo, por favor.',
    save: 'Salvar',
    comingSoon: 'Esta tela chega em breve por aqui.',
  },
  tabs: {
    home: 'Início',
    templates: 'Modelos',
    calendar: 'Agenda',
    settings: 'Ajustes',
    search: 'Buscar',
  },
  folders: {
    greeting: (name: string) => `Oi, ${name}. Vamos dar espaço às ideias?`,
    createFolderA11y: 'Criar pasta',
    sectionTitle: 'Minhas pastas',
    folderCount: (count: number) => (count === 1 ? '1 pasta' : `${count} pastas`),
    boardCount: (count: number) => (count === 1 ? '1 quadro' : `${count} quadros`),
    folderSummary: (title: string, count: number) =>
      `Pasta ${title}, ${count === 1 ? '1 quadro' : `${count} quadros`}`,
    renameFolderA11y: (title: string) => `Renomear a pasta ${title}`,
    openBoardA11y: (title: string) => `Abrir o quadro ${title}`,
    empty: 'Nenhuma pasta ainda. Que tal criar a primeira?',
    emptyFolder: 'Esta pasta ainda não tem quadros.',
    noResults: (query: string) => `Nenhum quadro encontrado para "${query}".`,
    newFolderTitle: 'Um lugar para seus quadros',
    folderNameLabel: 'Nome da pasta',
    folderNamePlaceholder: 'Minha próxima ideia',
    createFolder: 'Criar pasta',
    renameFolderTitle: 'Renomear pasta',
  },
  search: {
    title: 'Buscar',
    placeholder: 'Pastas e quadros',
    hint: 'Digite o nome de uma pasta ou de um quadro para encontrá-lo.',
  },
  templates: {
    title: 'Modelos',
  },
  history: {
    shakeHint: 'Experimente chacoalhar para desfazer a ação',
    // Nomes das ações nos alertas, como no iOS ("Desfazer Digitação").
    actions: {
      moveCard: 'Movimento',
      createCard: 'Criação',
    },
    undoAction: (actionName: string) => `Desfazer ${actionName}`,
    redoAction: (actionName: string) => `Refazer ${actionName}`,
    undo: 'Desfazer',
    redo: 'Refazer',
    cancel: 'Cancelar',
    undoError: 'Não deu para desfazer ou refazer agora. Tente de novo, por favor.',
  },
  board: {
    addCard: 'Adicionar cartão',
    emptyColumn: 'Todo plano começa com uma notinha.',
    columnOptions: 'Opções da coluna',
    boardOptions: 'Opções do quadro',
    dropToReorder: 'Solte para reorganizar',
    columnSummary: (title: string, count: number) =>
      `${title}, ${count === 1 ? '1 cartão' : `${count} cartões`}`,
    subtitle: (folderTitle: string, count: number) =>
      `${folderTitle} / ${count === 1 ? '1 cartão' : `${count} cartões`}`,
    loadError: 'Não conseguimos abrir este quadro agora. Tente de novo em instantes.',
    cardMoved: 'Cartão movido',
    moveUp: 'Mover para cima',
    moveDown: 'Mover para baixo',
    movedTo: (position: number, total: number) =>
      `Cartão movido para a posição ${position} de ${total}`,
    moveToPreviousColumn: 'Mover para a coluna anterior',
    moveToNextColumn: 'Mover para a próxima coluna',
    moveTo: 'Mover para…',
    movedToColumn: (columnTitle: string, position: number, total: number) =>
      `Movido para ${columnTitle}, posição ${position} de ${total}`,
    moveSheet: {
      title: 'Mover cartão',
      columnLabel: 'Coluna',
      positionLabel: 'Posição',
      positionStart: 'No início',
      positionEnd: 'No fim',
      currentColumn: (title: string) => `${title} (atual)`,
      submit: 'Mover',
      loadError: 'Não conseguimos abrir as colunas agora. Tente de novo em instantes.',
    },
    dragHint: 'Segure um cartão para mudar a ordem.',
    filterAll: 'Todos os cartões',
    filterByDeadline: 'Por prazo',
    deleteColumnTitle: (title: string) => `Excluir a coluna "${title}"?`,
    deleteColumnMessage: 'Os cartões dela também vão embora.',
    deleteColumnConfirm: 'Excluir',
    deleteColumnCancel: 'Cancelar',
  },
  card: {
    priority: {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
    },
    priorityA11y: {
      low: 'Prioridade baixa',
      medium: 'Prioridade média',
      high: 'Prioridade alta',
    },
    labelA11y: (name: string) => `Etiqueta ${name}`,
    deadlineStatus: {
      normal: '',
      soon: 'Em breve',
      overdue: 'Atrasado',
      done: 'Concluído',
    },
    today: (time: string) => `Hoje, ${time}`,
    checklist: (done: number, total: number) => `${done}/${total}`,
    // Leitura completa do cartão (CLAUDE.md, regra 13).
    summaryTitle: (title: string) => `Cartão ${title}`,
    summaryDeadline: (text: string) => `prazo ${text}`,
    summaryChecklist: (done: number, total: number) =>
      `${done} de ${total} ${total === 1 ? 'subtarefa concluída' : 'subtarefas concluídas'}`,
  },
  calendar: {
    title: 'Agenda',
  },
  voice: {},
  automations: {},
  settings: {
    title: 'Ajustes',
    componentGallery: 'Galeria de componentes (dev)',
  },
} as const;

export type Strings = typeof ptBR;
