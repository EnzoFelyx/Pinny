// Textos da interface. O nome do app também está no app.json (único outro lugar).
// Na UI usamos "cartão"; no código, "card".
export const ptBR = {
  appName: 'Pinny',
  common: {
    undo: 'Desfazer',
  },
  folders: {},
  templates: {},
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
  calendar: {},
  voice: {},
  automations: {},
  settings: {},
} as const;

export type Strings = typeof ptBR;
