import type { View } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';

// Valor de overColumnId quando o dedo está sobre a coluna "Adicionar coluna" (depois da última):
// soltar ali abre a folha "Nova coluna" com o cartão.
export const ADD_COLUMN_SLOT = '__add-column__';

// De onde um cartão da pilha sai voando: posição e largura na camada de arraste.
export interface StackOrigin {
  x: number;
  y: number;
  width: number;
}

// Arraste em lote (useBatchDrag): os outros marcados empilhados embaixo do cartão segurado.
export interface BatchDrag {
  // Cartão segurado com a pilha (fica até o próximo arraste): ele assenta sem quique.
  heldId: SharedValue<string | null>;
  // Os outros marcados (sem o segurado): saem das colunas enquanto a pilha existe.
  liftedIds: SharedValue<readonly string[]>;
  // Os que aparecem na pilha (no máximo 4 embaixo do segurado), na ordem do quadro.
  stackIds: SharedValue<readonly string[]>;
  // Total do lote, contando o segurado (0 = sem lote). É o número da bolinha.
  stackCount: SharedValue<number>;
  gatherFrom: SharedValue<Record<string, StackOrigin>>;
  // 0 = cada cartão no lugar de origem; 1 = todos na pilha.
  gather: SharedValue<number>;
  // Opacidade da pilha (some ao soltar numa vaga nova).
  stackOpacity: SharedValue<number>;
  // Muda ao cancelar: cada coluna volta à ordem de antes (com os levantados).
  restoreToken: SharedValue<number>;
  begin: (heldId: string) => boolean;
  reportOrigin: (id: string, origin: StackOrigin) => void;
  // Soltou numa vaga nova (o JS grava) ou no mesmo lugar (nada muda, os cartões voltam).
  commit: () => void;
  cancel: () => void;
}

// Estado do arraste no nível do quadro, compartilhado pela camada (DragOverlay), pelas colunas e
// pelos cartões. Tudo em shared values e worklets: roda na UI thread.
export interface BoardDrag {
  activeId: SharedValue<string | null>;
  fromColumnId: SharedValue<string | null>;
  // Coluna sob o dedo: é nela que a vaga aparece.
  overColumnId: SharedValue<string | null>;
  // Altura medida de todos os cartões do quadro (os ids não se repetem entre colunas).
  heights: SharedValue<Record<string, number>>;
  // Grava a altura medida de um cartão (em lote, uma vez por quadro de animação).
  reportHeight: (id: string, height: number) => void;
  // Cópia do cartão na camada: posição inicial (x, startY) mais o deslocamento do dedo.
  x: SharedValue<number>;
  startY: SharedValue<number>;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  width: SharedValue<number>;
  lift: SharedValue<number>;
  // Cartão cujo fantasma já está desenhado: os cartões com esse id nas colunas ficam invisíveis.
  visibleId: SharedValue<string | null>;
  // Posição da camada de arraste na tela (origem das medidas), gravada ao segurar.
  originPageX: SharedValue<number>;
  originPageY: SharedValue<number>;
  // Topo das listas das colunas na camada, com a rolagem da coluna em zero (é igual em todas).
  listOriginY: SharedValue<number>;
  // Vaga na coluna sob o dedo, escrita por ela.
  slotIndex: SharedValue<number>;
  // Cartão solto em outra coluna, esperando aparecer lá para assumir do fantasma.
  landingId: SharedValue<string | null>;
  landingColumnId: SharedValue<string | null>;
  boardViewportWidth: SharedValue<number>;
  boardContentWidth: SharedValue<number>;
  begin: (
    id: string,
    columnId: string,
    listRef: AnimatedRef<View>,
    offset: number,
    columnScrollY: number,
    absoluteX: number,
  ) => void;
  move: (translationX: number, translationY: number, absoluteX: number) => void;
  // Distância horizontal entre o fantasma e a lista de origem (para o cartão assumir dali).
  horizontalOffset: () => number;
  // Soltou na própria coluna: o arraste acaba e o cartão assenta na vaga (settle).
  release: () => void;
  // Soltou na coluna "Adicionar coluna": o cartão volta para a vaga dele e a folha "Nova coluna"
  // abre com ele (o quadro não rola de volta).
  releaseToNewColumn: () => void;
  // Soltou em outra coluna: o fantasma espera o cartão aparecer lá (takeOver).
  dropInOtherColumn: () => void;
  takeOver: (columnScrollY: number) => { top: number; left: number };
  // Quique ao assentar, desenhado pelo fantasma (por cima de tudo) na posição da vaga dentro da
  // lista: a coluna mede a lista a cada quadro (trackSettle), então ele acompanha as rolagens.
  settleId: SharedValue<string | null>;
  settleColumnId: SharedValue<string | null>;
  settleTop: SharedValue<number>;
  settleLeft: SharedValue<number>;
  settleLift: SharedValue<number>;
  settleListX: SharedValue<number>;
  settleListY: SharedValue<number>;
  settle: (
    id: string,
    columnId: string,
    listRef: AnimatedRef<View>,
    from: { top: number; left: number },
    target: number,
    isReducedMotion: boolean,
  ) => void;
  trackSettle: (listRef: AnimatedRef<View>) => void;
  // Rolar a coluna no meio do quique passa o quique para o cartão da lista (handOff); ele pega a
  // posição de settleTop/settleLeft/settleLift e avisa com finishHandoff.
  handoffId: SharedValue<string | null>;
  handOff: () => void;
  finishHandoff: () => void;
  // Encerra na hora o quique do cartão (a vaga dele mudou ou sumiu no meio, ex.: troca de filtro).
  cancelSettle: (id: string) => void;
  markVisible: (id: string) => void;
  // Rola o quadro até a coluna (ex.: recém-criada), assim que ela estiver na tela.
  focusColumn: (columnId: string) => void;
  // Arraste em lote (pilha). Worklets leem só os shared values que usam (desestruture).
  batch: BatchDrag;
}
