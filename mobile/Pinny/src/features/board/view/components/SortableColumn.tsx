import { memo, useCallback, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet } from 'react-native';
import { GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated';

import { ColumnHeader } from '@/components/Column';
import { colors, duration } from '@/theme';

import type { BoardColumnItem } from '../../viewmodel/boardItems';
import { ColumnFooterArea, useEmptyColumnArea } from './ColumnFooterArea';
import { ColumnMenu } from './ColumnMenu';
import { ColumnSelectionToggle } from './ColumnSelectionToggle';
import { DropPlaceholder } from './DropPlaceholder';
import { PullToDeleteIndicator } from './PullToDeleteIndicator';
import { SortableCard } from './SortableCard';
import type { CardActions, ColumnActions, DragHaptics } from './boardActions';
import type { BoardDrag } from './useBoardDrag';
import type { ColumnDrag } from './useColumnDrag';
import { usePullToDelete } from './usePullToDelete';
import type { SelectionValues } from './useSelectionValues';
import { useColumnLift } from './useColumnLift';
import { useIdentityWarning } from '@/hooks/useIdentityWarning';
import { useSortableColumn } from './useSortableColumn';

// ScrollView do Gesture Handler: quando o arraste começa, ele para de rolar a coluna.
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const COLUMN_RADIUS = 24;
const COLUMN_PADDING = 16;

interface SortableColumnViewProps {
  column: BoardColumnItem;
  columnIndex: number;
  columnCount: number;
  isReducedMotion: boolean;
  drag: BoardDrag;
  cardActions: CardActions;
  columnActions: ColumnActions;
  haptics: DragHaptics;
  // Arraste da coluna pelo cabeçalho (reordenar colunas).
  columnDrag: ColumnDrag;
  // Modo de seleção. Os marcados ficam na UI thread (selection), para marcar um cartão não
  // redesenhar a coluna nem os cartões; a coluna só sabe se está no modo e se tem marcado.
  isSelecting: boolean;
  hasSelected: boolean;
  selection: SelectionValues;
  // Só com o leitor de tela ligado: os marcados, para cada cartão se anunciar como caixa de
  // seleção (null = fora do modo ou leitor de tela desligado).
  accessibilitySelectedIds: ReadonlySet<string> | null;
}

// Coluna do quadro inteira rolável (como no kanban antigo): o cabeçalho fica preso no topo e o
// fundo cresce junto com os cartões até ocupar a altura da tela. Os cartões ficam em posição
// absoluta, para o arraste animar só o necessário.
export const SortableColumnView = memo(function SortableColumnView({
  column,
  columnIndex,
  columnCount,
  isReducedMotion,
  drag,
  cardActions,
  columnActions,
  haptics,
  columnDrag,
  isSelecting,
  hasSelected,
  selection,
  accessibilitySelectedIds,
}: SortableColumnViewProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // Identidade fixa esperada: se um destes mudar, todos os cartões da coluna redesenham.
  useIdentityWarning(drag, 'drag');
  useIdentityWarning(columnDrag, 'columnDrag');
  const {
    column: sortable,
    scrollHandler,
    listRef,
  } = useSortableColumn({
    columnId: column.id,
    ids: column.visibleCards.map((card) => card.id),
    scrollRef,
    drag,
    onMove: cardActions.move,
    onLift: haptics.lift,
    onTick: haptics.tick,
    onDrop: haptics.drop,
  });
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;
  // Contagem, vagas e posições contam só os cartões que o filtro deixa à mostra.
  const cardCount = column.visibleCards.length;
  const visibleIndex = new Map(column.visibleCards.map((card, index) => [card.id, index]));

  const isEmpty = cardCount === 0;
  const emptyArea = useEmptyColumnArea({ isEmpty, drag, order: sortable.order });

  // Na coluna vazia, a vaga fica por cima da área do estado vazio: a lista não ocupa espaço.
  // Lê só a altura (o objeto da coluna inteiro mudaria a cada quadro do arraste).
  const { contentHeight } = sortable;
  const listStyle = useAnimatedStyle(() => ({
    height: isEmpty ? 0 : contentHeight.get(),
  }));

  const measureViewport = (event: LayoutChangeEvent) => {
    sortable.viewportHeight.set(event.nativeEvent.layout.height);
  };
  // Distância do topo da coluna até a lista (altura do cabeçalho fixo).
  const measureList = (event: LayoutChangeEvent) => {
    sortable.listTop.set(event.nativeEvent.layout.y);
  };
  const measureContent = (_width: number, height: number) => {
    sortable.scrollContentHeight.set(height);
  };

  const { lift, tick } = haptics;
  const { addCard, rename, requestDelete } = columnActions;
  const confirmPullToDelete = useCallback(() => {
    lift();
    requestDelete(column.id);
  }, [lift, requestDelete, column.id]);
  const pullToDelete = usePullToDelete({
    scrollY: sortable.scrollY,
    isUserScrolling: sortable.isUserScrolling,
    onArmed: tick,
    onComplete: confirmPullToDelete,
    isEnabled: !isSelecting,
  });

  const addCardHere = useCallback(() => addCard(column.id), [addCard, column.id]);
  const { selectAllCards, clearSelection } = columnActions;
  const selectAllHere = useCallback(() => selectAllCards(column.id), [selectAllCards, column.id]);
  const clearSelectionHere = useCallback(
    () => clearSelection(column.id),
    [clearSelection, column.id],
  );
  const renameHere = useCallback((title: string) => rename(column.id, title), [rename, column.id]);
  // Enquanto o título é editado, a coluna não rola (nem o "puxar para excluir") e os cartões não
  // arrastam: um gesto sem querer não tira o foco do campo.
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  // Segurar o cabeçalho levanta a coluna: a cópia segue o dedo por cima de tudo e esta fica
  // invisível no lugar (trocar de lugar vem depois).
  const {
    gesture: liftGesture,
    frameRef,
    hiddenStyle: liftHiddenStyle,
  } = useColumnLift({
    columnId: column.id,
    isEnabled: !isEditingTitle && !isSelecting,
    columnDrag,
    onLift: lift,
  });

  return (
    <Animated.View style={[styles.wrapper, liftHiddenStyle]}>
      {/* Atrás da coluna: aparece no espaço que o iOS revela ao puxar para baixo. */}
      <PullToDeleteIndicator
        pull={pullToDelete.pull}
        progress={pullToDelete.progress}
        visibility={pullToDelete.visibility}
      />
      {/* Parte visível da coluna (altura do conteúdo, até a da tela): de onde a cópia começa. */}
      <Animated.View ref={frameRef} collapsable={false} style={styles.frame}>
        <AnimatedScrollView
          ref={scrollRef}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          scrollEnabled={!isEditingTitle}
          onLayout={measureViewport}
          onContentSizeChange={measureContent}
          stickyHeaderIndices={[0]}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <GestureDetector gesture={liftGesture}>
            <Animated.View collapsable={false}>
              <ColumnHeader
                title={column.title}
                cardCount={cardCount}
                // Selecionando, o nome não edita: uma tarefa de cada vez.
                onRename={isSelecting ? undefined : renameHere}
                onEditingChange={setIsEditingTitle}
                // Selecionando, o "…" some: excluir ou duplicar a coluna bagunçaria a seleção.
                isMenuHidden={isSelecting}
                accessory={
                  // Coluna sem cartões à mostra: nada para selecionar (com algum marcado, o
                  // "Limpar" continua).
                  isSelecting && (cardCount > 0 || hasSelected) ? (
                    <ColumnSelectionToggle
                      columnTitle={column.title}
                      hasSelected={hasSelected}
                      onSelectAll={selectAllHere}
                      onClear={clearSelectionHere}
                    />
                  ) : undefined
                }
                menu={
                  <ColumnMenu
                    columnId={column.id}
                    canMoveBackward={columnIndex > 0}
                    canMoveForward={columnIndex < columnCount - 1}
                    onAddCard={addCard}
                    onMove={columnActions.move}
                    onDuplicate={columnActions.duplicate}
                    onDelete={requestDelete}
                  />
                }
              />
            </Animated.View>
          </GestureDetector>

          {/* Sempre montada (altura 0 sem cartões): a vaga também aparece numa coluna vazia. */}
          <Animated.View
            ref={listRef}
            // Medida pelo arraste e pelo quique a cada quadro: não pode ser achatada.
            collapsable={false}
            onLayout={measureList}
            style={listStyle}
          >
            <DropPlaceholder
              columnId={column.id}
              column={sortable}
              drag={drag}
              reorderDuration={reorderDuration}
              fixedHeight={emptyArea.slotHeight}
            />
            {/* Todos montados: o escondido pelo filtro só some (display none), sem desmontar. */}
            {column.cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                columnId={column.id}
                columnIndex={columnIndex}
                columnCount={columnCount}
                index={visibleIndex.get(card.id) ?? -1}
                isHidden={!visibleIndex.has(card.id)}
                total={cardCount}
                column={sortable}
                drag={drag}
                isDragEnabled={!isEditingTitle}
                selection={selection}
                accessibilitySelected={
                  accessibilitySelectedIds ? accessibilitySelectedIds.has(card.id) : undefined
                }
                isReducedMotion={isReducedMotion}
                actions={cardActions}
              />
            ))}
          </Animated.View>

          <ColumnFooterArea
            isEmpty={isEmpty}
            area={emptyArea}
            emptyMessage={column.emptyMessage}
            emptyVariant={column.emptyVariant}
            // Selecionando, sem "Adicionar cartão": uma tarefa de cada vez.
            onAddCard={isSelecting ? undefined : addCardHere}
          />
        </AnimatedScrollView>
      </Animated.View>
    </Animated.View>
  );
});

// ScrollView animado de biblioteca, sem className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  // Quem corta a coluna é este contêiner, que vai do topo da coluna até o fim da área do quadro:
  // ao puxar para baixo, a coluna inteira desce (fundo, cartões e cantos de baixo), em vez de ser
  // cortada na borda de baixo da área de rolagem.
  wrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: COLUMN_RADIUS,
  },
  frame: {
    flexShrink: 1,
  },
  // Altura pelo conteúdo, limitada à da tela: a coluna cresce conforme chegam cartões. Sem corte
  // próprio (ver wrapper).
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    overflow: 'visible',
  },
  content: {
    backgroundColor: colors.columnBackground,
    borderRadius: COLUMN_RADIUS,
    paddingHorizontal: COLUMN_PADDING,
    paddingBottom: COLUMN_PADDING,
  },
});
