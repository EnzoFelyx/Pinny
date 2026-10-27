// Textos da interface. O nome do app também está no app.json (único outro lugar).
// Na UI usamos "cartão"; no código, "card".
export const ptBR = {
  appName: 'Pinny',
  common: {},
  folders: {},
  templates: {},
  board: {},
  card: {},
  calendar: {},
  voice: {},
  automations: {},
  settings: {},
} as const;

export type Strings = typeof ptBR;
