import { memo, useCallback } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated';

import { ColumnFooter, ColumnHeader } from '@/components/Column';
import { colors, duration } from '@/theme';

import type { BoardColumnItem } from '../../viewmodel/boardItems';
import { DropPlaceholder } from './DropPlaceholder';
import { PullToDeleteIndicator } from './PullToDeleteIndicator';
import { SortableCard } from './SortableCard';
import type { DragOverlay } from './useDragOverlay';
import { usePullToDelete } from './usePullToDelete';
import { useSortableColumn } from './useSortableColumn';

// ScrollView do Gesture Handler: quando o arraste começa, ele para de rolar a coluna.
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const COLUMN_RADIUS = 24;
const COLUMN_PADDING = 16;
const SECTION_GAP = 12;

interface SortableColumnViewProps {
  column: BoardColumnItem;
  isReducedMotion: boolean;
  onMove: (columnId: string, cardId: string, toIndex: number) => void;
  onAddCard: (columnId: string) => void;
  onOpenMenu: (columnId: string) => void;
  overlay: DragOverlay;
  onRequestDelete: (columnId: string) => void;
  onLift: () => void;
  onTick: () => void;
  onDrop: () => void;
}

// Coluna do quadro inteira rolável (como no kanban antigo): o cabeçalho fica preso no topo e o
// fundo cresce junto com os cartões até ocupar a altura da tela. Os cartões ficam em posição
// absoluta, para o arraste animar só o necessário.
export const SortableColumnView = memo(function SortableColumnView({
  column,
  isReducedMotion,
  onMove,
  onAddCard,
  onOpenMenu,
  overlay,
  onRequestDelete,
  onLift,
  onTick,
  onDrop,
}: SortableColumnViewProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const sortable = useSortableColumn({
    columnId: column.id,
    ids: column.cards.map((card) => card.id),
    scrollRef,
    onMove,
    onLift,
    onTick,
    onDrop,
  });
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;
  const cardCount = column.cards.length;

  const listStyle = useAnimatedStyle(() => ({ height: sortable.contentHeight.get() }));

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

  const requestDelete = useCallback(() => {
    onLift();
    onRequestDelete(column.id);
  }, [onLift, onRequestDelete, column.id]);
  const pullToDelete = usePullToDelete({
    scrollY: sortable.scrollY,
    isUserScrolling: sortable.isUserScrolling,
    onArmed: onTick,
    onComplete: requestDelete,
  });

  const addCard = useCallback(() => onAddCard(column.id), [onAddCard, column.id]);
  const openMenu = useCallback(() => onOpenMenu(column.id), [onOpenMenu, column.id]);

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
        onScroll={sortable.scrollHandler}
        scrollEventThrottle={16}
        onLayout={measureViewport}
        onContentSizeChange={measureContent}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <ColumnHeader title={column.title} cardCount={cardCount} onOpenMenu={openMenu} />

        {cardCount > 0 ? (
          <Animated.View ref={sortable.listRef} onLayout={measureList} style={listStyle}>
            <DropPlaceholder column={sortable} reorderDuration={reorderDuration} />
            {column.cards.map((card, index) => (
              <SortableCard
                key={card.id}
                card={card}
                columnId={column.id}
                index={index}
                total={cardCount}
                column={sortable}
                overlay={overlay}
                isReducedMotion={isReducedMotion}
                onMove={onMove}
              />
            ))}
          </Animated.View>
        ) : null}

        <View style={cardCount > 0 ? styles.footerAfterList : undefined}>
          <ColumnFooter cardCount={cardCount} onAddCard={addCard} />
        </View>
      </AnimatedScrollView>
    </View>
  );
});

// ScrollView animado de biblioteca, sem className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  // Arredonda a "janela" da coluna: o cabeçalho fixo e os cartões rolando ficam dentro dela.
  // Altura pelo conteúdo, limitada à da tela: a coluna cresce conforme chegam cartões.
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    borderRadius: COLUMN_RADIUS,
  },
  content: {
    backgroundColor: colors.columnBackground,
    borderRadius: COLUMN_RADIUS,
    paddingHorizontal: COLUMN_PADDING,
    paddingBottom: COLUMN_PADDING,
  },
  footerAfterList: {
    marginTop: SECTION_GAP,
  },
});
