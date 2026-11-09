// Textos da interface. O nome do app também está no app.json (único outro lugar).
// Na UI usamos "cartão"; no código, "card".
export const ptBR = {
  appName: 'Pinny',
  common: {
    undo: 'Desfazer',
    back: 'Voltar',
    renameLaterHint: 'Depois você pode mudar o nome.',
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
    greeting: (name: string) => `Bem vindo, ${name}!`,
    createFolderA11y: 'Criar pasta',
    sectionTitle: 'Minhas pastas',
    folderCount: (count: number) => (count === 1 ? '1 pasta' : `${count} pastas`),
    boardCount: (count: number) => (count === 1 ? '1 quadro' : `${count} quadros`),
    folderSummary: (title: string, count: number, isPinned: boolean) =>
      `Pasta ${title}${isPinned ? ', fixada' : ''}, ${count === 1 ? '1 quadro' : `${count} quadros`}`,
    folderOptionsA11y: (title: string) => `Opções da pasta ${title}`,
    folderMenu: {
      customize: 'Personalizar',
      newBoard: 'Novo quadro',
      pin: 'Fixar no topo',
      unpin: 'Desafixar',
      delete: 'Apagar',
    },
    openBoardA11y: (title: string, isPinned: boolean) =>
      `Abrir o quadro ${title}${isPinned ? ', fixado na Início' : ''}`,
    selectBoardA11y: (title: string, isPinned: boolean) =>
      `${title}${isPinned ? ', fixado na Início' : ''}`,
    pinBoard: 'Fixar na Início',
    unpinBoard: 'Desafixar',
    // Segurar o quadro na tela da pasta: apagar com confirmação e desfazer.
    deleteBoard: 'Apagar',
    deleteBoardTitle: (title: string) => `Apagar o quadro "${title}"?`,
    deleteBoardMessage: 'As colunas e os cartões dele também serão apagados.',
    deleteBoardsTitle: (count: number) => `Apagar ${count} quadros?`,
    deleteBoardsMessage: 'As colunas e os cartões deles também serão apagados.',
    deleteBoardConfirm: 'Apagar',
    deleteBoardCancel: 'Cancelar',
    boardDeleted: 'Quadro apagado',
    boardsDeleted: (count: number) => `${count} quadros apagados`,
    createBoardA11y: (folderTitle: string) => `Criar um quadro na pasta ${folderTitle}`,
    createFirstBoard: 'Criar o primeiro quadro',
    // Última vaga da pasta na Início quando há quadros de fora (abre a tela da pasta).
    seeAll: 'Ver todos',
    moreBoardsA11y: (title: string, total: number) => `Ver os ${total} quadros da pasta ${title}`,
    // Tela da pasta (todos os quadros).
    folderScreen: {
      newBoard: 'Novo quadro',
      searchLabel: 'Buscar quadro',
      searchPlaceholder: 'Buscar quadro pelo nome',
      empty: 'Nenhum quadro aqui ainda.',
      createBoard: 'Criar quadro',
      noResults: (query: string) => `Nenhum quadro com "${query}".`,
      options: 'Opções da pasta',
      customize: 'Personalizar pasta',
      // Modo "Selecionar" (como a seleção de fotos do iOS): fixar ou apagar os escolhidos.
      select: 'Selecionar',
      selectionTitle: (count: number) =>
        count === 0
          ? 'Selecionar quadros'
          : count === 1
            ? '1 selecionado'
            : `${count} selecionados`,
      selectionHint: 'Toque nos quadros para selecionar.',
      pinLimitHint: (limit: number) => `A Início mostra até ${limit} quadros fixados por pasta.`,
      pinSelectedA11y: 'Fixar os quadros selecionados na Início',
      unpinSelectedA11y: 'Desafixar os quadros selecionados',
      deleteSelectedA11y: 'Apagar os quadros selecionados',
      cancel: 'Cancelar',
      customizeHint: 'Toque duas vezes para personalizar.',
      delete: 'Apagar',
      loading: 'Carregando a pasta',
    },
    newBoard: {
      title: 'Um novo quadro para organizar',
      folderNotice: (folderTitle: string) => `Ele vai ficar na pasta "${folderTitle}".`,
      label: 'Nome do quadro',
      placeholder: 'Viagem de julho',
      submit: 'Criar quadro',
      // Colunas com que todo quadro novo começa (vazias).
      defaultColumns: ['Pendentes', 'Concluídas'],
    },
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
      createColumn: 'Nova Coluna',
      deleteColumn: 'Apagar Coluna',
      moveColumn: 'Movimento de Coluna',
      duplicateColumn: 'Duplicação de Coluna',
      renameColumn: 'Renomeação de Coluna',
      renameBoard: 'Renomeação de Quadro',
      deleteBoard: 'Apagar Quadro',
      deleteBoards: 'Apagar Quadros',
      archiveCards: 'Arquivar Cartões',
      deleteCards: 'Apagar Cartões',
      moveCards: 'Movimento de Cartões',
      duplicateBoard: 'Duplicação de Quadro',
      moveBoard: 'Movimento de Quadro',
    },
    undoAction: (actionName: string) => `Desfazer ${actionName}`,
    redoAction: (actionName: string) => `Refazer ${actionName}`,
    undo: 'Desfazer',
    redo: 'Refazer',
    cancel: 'Cancelar',
    undoError: 'Não deu para desfazer ou refazer agora. Tente de novo, por favor.',
  },
  board: {
    // Modo "Selecionar cartões" (como a seleção de fotos do iOS).
    selection: {
      title: (count: number) =>
        count === 0
          ? 'Selecionar cartões'
          : count === 1
            ? '1 selecionado'
            : `${count} selecionados`,
      hint: 'Toque nos cartões para selecionar.',
      cancel: 'Cancelar',
      cancelA11y: 'Sair da seleção',
      // Ao lado da contagem de cada coluna: marca todos à mostra ou, com algum marcado, desmarca.
      // Em duas linhas, para ocupar pouco espaço ao lado da contagem.
      selectAll: 'Selecionar\ntodos',
      clear: 'Limpar',
      selectAllA11y: (column: string) => `Selecionar todos os cartões de ${column}`,
      clearA11y: (column: string) => `Limpar a seleção de ${column}`,
      // Barra de baixo: Mover, Arquivar e Apagar os selecionados.
      moveA11y: 'Mover os cartões selecionados',
      archiveA11y: 'Arquivar os cartões selecionados',
      deleteA11y: 'Apagar os cartões selecionados',
      deleteOneTitle: (title: string) => `Apagar o cartão "${title}"?`,
      deleteManyTitle: (count: number) => `Apagar ${count} cartões?`,
      deleteMessage: (count: number) =>
        count === 1
          ? 'As etiquetas, o checklist e as fotos dele também vão embora.'
          : 'As etiquetas, os checklists e as fotos deles também vão embora.',
      deleteConfirm: 'Apagar',
      cardsArchived: (count: number) =>
        count === 1 ? 'Cartão arquivado' : `${count} cartões arquivados`,
      cardsDeleted: (count: number) =>
        count === 1 ? 'Cartão apagado' : `${count} cartões apagados`,
      cardsMoved: (count: number, column: string) =>
        count === 1 ? `Cartão movido para ${column}` : `${count} cartões movidos para ${column}`,
    },
    // Tela "Arquivados" (… do quadro), provisória até o desenho no Figma.
    archived: {
      title: 'Arquivados',
      columnTitle: 'Cartões arquivados',
      empty: 'Nenhum cartão arquivado por aqui.',
      loadError: 'Não conseguimos abrir os arquivados agora. Tente de novo em instantes.',
    },
    // Folha "Mover cartões" (barra do modo de seleção).
    moveCardsSheet: {
      title: (count: number) =>
        count === 1 ? 'Mover 1 cartão para:' : `Mover ${count} cartões para:`,
      boardLabel: 'Quadro',
      currentBoard: (title: string) => `${title} (atual)`,
      changeBoard: 'Trocar',
      changeBoardA11y: (title: string) => `Quadro ${title}. Toque para trocar de quadro.`,
      columnLabel: 'Coluna',
      submit: 'Mover',
      loadError: 'Não conseguimos carregar os quadros agora. Tente de novo em instantes.',
    },
    addCard: 'Adicionar cartão',
    addColumn: 'Adicionar coluna',
    newColumn: {
      title: 'Uma nova etapa para seus cartões',
      label: 'Nome da coluna',
      placeholder: 'Em revisão',
      submit: 'Criar coluna',
      cardNotice: (title: string) => `O cartão "${title}" vai para a coluna nova.`,
    },
    addColumnDropHint: 'Solte para criar uma\ncoluna com este cartão',
    addColumnHint: 'Toque para adicionar\numa nova coluna',
    emptyColumn: 'Todo plano começa com uma notinha.',
    // Uma frase por variação do estado vazio da coluna (mesma ordem das ilustrações). Curtas, para
    // caber numa linha na largura da coluna.
    emptyColumnMessages: [
      'Todo plano começa com uma notinha.',
      'Espaço livre para a próxima ideia.',
      'Nada aqui ainda. Bora começar?',
      'Uma coluna novinha em folha!',
      'Silêncio por aqui… por enquanto.',
    ],
    columnOptions: 'Opções da coluna',
    renameColumn: 'Renomear coluna',
    renameColumnHint: 'Toque duas vezes para renomear.',
    columnNameLabel: 'Nome da coluna',
    columnMenu: {
      addCard: 'Adicionar cartão',
      moveForward: 'Mover para frente',
      moveBackward: 'Mover para trás',
      duplicate: 'Duplicar',
      delete: 'Apagar',
    },
    columnCopyTitle: (title: string) => `${title} (cópia)`,
    boardCopyTitle: (title: string) => `${title} (cópia)`,
    boardDuplicated: 'Quadro duplicado',
    boardMoved: (folderTitle: string) => `Quadro movido para "${folderTitle}"`,
    boardOptions: 'Opções do quadro',
    renameBoard: 'Renomear quadro',
    renameBoardHint: 'Toque duas vezes para renomear.',
    boardNameLabel: 'Nome do quadro',
    filter: {
      title: 'Filtrar',
      close: 'Fechar filtros',
      deadline: 'Prazo',
      deadlineOptions: {
        any: 'Todos',
        overdue: 'Atrasados',
        today: 'Hoje',
        upcoming: 'Próximos 7 dias',
        none: 'Sem prazo',
      },
      priority: 'Prioridade',
      labels: 'Etiquetas',
      noLabels: 'Este quadro ainda não tem etiquetas.',
      showCompleted: 'Mostrar concluídos',
      onlyPendingChecklist: 'Checklist pendente',
      clear: 'Limpar',
      apply: (count: number) => (count === 1 ? 'Mostrar 1 cartão' : `Mostrar ${count} cartões`),
      labelA11y: (name: string) => `Etiqueta ${name}`,
      // Linha de filtros do quadro (entre o título e as colunas).
      quick: { today: 'Hoje', overdue: 'Atrasados', high: 'Alta' },
      quickA11y: (label: string) => `Filtrar: ${label}`,
      openFilters: 'Filtros',
      openFiltersA11y: 'Abrir os filtros',
      hideCompleted: 'Sem concluídos',
      pendingChecklist: 'Checklist pendente',
      removeA11y: (label: string) => `Remover o filtro ${label}`,
      clearAllA11y: 'Limpar todos os filtros',
      emptyColumn: 'Nenhum cartão com esses filtros.',
      newCardHidden: 'Cartão criado, mas escondido pelos filtros',
    },
    // O grupo do meio age sobre o quadro: os nomes ficam curtos ("Renomear", não "Renomear quadro").
    boardMenu: {
      search: 'Buscar lembrete',
      selectCards: 'Selecionar',
      newColumn: 'Nova coluna',
      archived: 'Arquivados',
      rename: 'Renomear',
      duplicate: 'Duplicar',
      moveToFolder: 'Mover',
      delete: 'Apagar',
    },
    dropToReorder: 'Solte para reorganizar',
    columnSummary: (title: string, count: number) =>
      `${title}, ${count === 1 ? '1 cartão' : `${count} cartões`}`,
    subtitleFiltered: (folderTitle: string, visible: number, total: number) =>
      `${folderTitle} / ${visible} de ${total === 1 ? '1 cartão' : `${total} cartões`}`,
    subtitle: (folderTitle: string, count: number) =>
      `${folderTitle} / ${count === 1 ? '1 cartão' : `${count} cartões`}`,
    loadError: 'Não conseguimos abrir este quadro agora. Tente de novo em instantes.',
    loading: 'Carregando o quadro',
    cardMoved: 'Cartão movido',
    columnMoved: 'Coluna movida',
    moveUp: 'Mover para cima',
    moveDown: 'Mover para baixo',
    movedTo: (position: number, total: number) =>
      `Cartão movido para a posição ${position} de ${total}`,
    moveToPreviousColumn: 'Mover para a coluna anterior',
    moveToNextColumn: 'Mover para a próxima coluna',
    moveTo: 'Mover para…',
    movedToColumn: (columnTitle: string, position: number, total: number) =>
      `Movido para ${columnTitle}, posição ${position} de ${total}`,
    // Folha "Mover quadro" (… do quadro).
    moveBoardSheet: {
      title: (boardTitle: string) => `Mover "${boardTitle}" para a pasta:`,
      // Enquanto o nome do quadro carrega.
      loadingTitle: 'Mover o quadro para a pasta:',
      folderLabel: 'Pasta',
      currentFolder: (title: string) => `${title} (atual)`,
      pinDropped: (limit: number) =>
        `Essa pasta já tem ${limit} quadros fixados: o quadro chega lá sem fixar.`,
      submit: 'Mover',
      loadError: 'Não conseguimos abrir as pastas agora. Tente de novo em instantes.',
    },
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
    dragHint: 'Segure um cartão ou uma coluna para mudar a ordem.',
    deleteColumnTitle: (title: string) => `Apagar a coluna "${title}"?`,
    deleteColumnMessage: (count: number) =>
      count === 1
        ? 'O cartão dela também vai embora.'
        : `Os ${count} cartões dela também vão embora.`,
    deleteColumnConfirm: 'Apagar',
    deleteColumnCancel: 'Cancelar',
    columnDeleted: 'Coluna apagada',
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
    // Ferramentas de desenvolvimento (só em __DEV__).
    stressHeavy: 'Criar quadro superlotado (10 × 40)',
    stressExtreme: 'Criar quadro superlotado extremo (20 × 100)',
    stressCreating: 'Criando o quadro superlotado…',
    stressCreated: (cards: number, seconds: string) =>
      `Quadro superlotado criado com ${cards} cartões em ${seconds} s, na pasta "Testes de performance".`,
    stressError: 'Não deu para criar o quadro superlotado. Veja o terminal do Metro.',
    largeFolder: (boards: number) => `Criar pasta grande (${boards} quadros)`,
    largeFolderCreated: (boards: number) => `Pasta com ${boards} quadros criada. Veja na Início.`,
    largeFolderError: 'Não deu para criar a pasta grande. Veja o terminal do Metro.',
    title: 'Ajustes',
    componentGallery: 'Galeria de componentes (dev)',
  },
} as const;

export type Strings = typeof ptBR;
