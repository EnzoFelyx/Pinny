// Textos da interface. O nome do app também está no app.json (único outro lugar).
// Na UI usamos "cartão"; no código, "card".
export const ptBR = {
  appName: 'Pinny',
  common: {
    undo: 'Desfazer',
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
  board: {
    addCard: 'Adicionar cartão',
    emptyColumn: 'Todo plano começa com uma notinha.',
    columnOptions: 'Opções da coluna',
    columnSummary: (title: string, count: number) =>
      `${title}, ${count === 1 ? '1 cartão' : `${count} cartões`}`,
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
