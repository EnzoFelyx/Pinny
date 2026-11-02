// Ações que a tela do quadro repassa às colunas e aos cartões (vindas do ViewModel), agrupadas
// para as props não se repetirem em cada nível.

export interface CardActions {
  // Intenção final do arraste ou das ações de acessibilidade.
  move: (cardId: string, toColumnId: string, toIndex: number) => void;
  // Leva o cartão ao topo da coluna vizinha e devolve o texto para o leitor de tela.
  moveToAdjacentColumn: (cardId: string, step: -1 | 1) => string | null;
  openMoveCard: (cardId: string) => void;
}

export interface ColumnActions {
  addCard: (columnId: string) => void;
  move: (columnId: string, step: -1 | 1) => void;
  duplicate: (columnId: string) => void;
  rename: (columnId: string, title: string) => void;
  requestDelete: (columnId: string) => void;
}

// Feedback tátil do arraste.
export interface DragHaptics {
  lift: () => void;
  tick: () => void;
  drop: () => void;
}
