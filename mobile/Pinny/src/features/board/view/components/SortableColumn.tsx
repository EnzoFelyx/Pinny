import { memo, useCallback, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated';

import { ColumnHeader } from '@/components/Column';
import { colors, duration } from '@/theme';

import type { BoardColumnItem } from '../../viewmodel/boardItems';
import { ColumnFooterArea, useEmptyColumnArea } from './ColumnFooterArea';
import { ColumnMenu } from './ColumnMenu';
import { DropPlaceholder } from './DropPlaceholder';
import { PullToDeleteIndicator } from './PullToDeleteIndicator';
import { SortableCard } from './SortableCard';
import type { CardActions, ColumnActions, DragHaptics } from './boardActions';
import type { BoardDrag } from './useBoardDrag';
import { usePullToDelete } from './usePullToDelete';
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
}: SortableColumnViewProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { column: sortable, scrollHandler } = useSortableColumn({
    columnId: column.id,
    ids: column.cards.map((card) => card.id),
    scrollRef,
    drag,
    onMove: cardActions.move,
    onLift: haptics.lift,
    onTick: haptics.tick,
    onDrop: haptics.drop,
  });
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;
  const cardCount = column.cards.length;

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
  });

  const addCardHere = useCallback(() => addCard(column.id), [addCard, column.id]);
  const renameHere = useCallback((title: string) => rename(column.id, title), [rename, column.id]);
  // Enquanto o título é editado, a coluna não rola (nem o "puxar para excluir") e os cartões não
  // arrastam: um gesto sem querer não tira o foco do campo.
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* Atrás da coluna: aparece no espaço que o iOS revela ao puxar para baixo. */}
      <PullToDeleteIndicator
        pull={pullToDelete.pull}
        progress={pullToDelete.progress}
        visibility={pullToDelete.visibility}
      />
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
        <ColumnHeader
          title={column.title}
          cardCount={cardCount}
          onRename={renameHere}
          onEditingChange={setIsEditingTitle}
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

        {/* Sempre montada (altura 0 sem cartões): a vaga também aparece numa coluna vazia. */}
        <Animated.View ref={sortable.listRef} onLayout={measureList} style={listStyle}>
          <DropPlaceholder
            columnId={column.id}
            column={sortable}
            drag={drag}
            reorderDuration={reorderDuration}
            fixedHeight={emptyArea.slotHeight}
          />
          {column.cards.map((card, index) => (
            <SortableCard
              key={card.id}
              card={card}
              columnId={column.id}
              columnIndex={columnIndex}
              columnCount={columnCount}
              index={index}
              total={cardCount}
              column={sortable}
              drag={drag}
              isDragEnabled={!isEditingTitle}
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
          onAddCard={addCardHere}
        />
      </AnimatedScrollView>
    </View>
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
