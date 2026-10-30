import { memo, useCallback } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { ColumnFooter, ColumnHeader } from '@/components/Column';
import { colors, duration } from '@/theme';

import type { BoardColumnItem } from '../../viewmodel/boardItems';
import { DropPlaceholder } from './DropPlaceholder';
import { PullToDeleteIndicator } from './PullToDeleteIndicator';
import { SortableCard } from './SortableCard';
import type { BoardDrag } from './useBoardDrag';
import { usePullToDelete } from './usePullToDelete';
import { useSortableColumn } from './useSortableColumn';

// ScrollView do Gesture Handler: quando o arraste começa, ele para de rolar a coluna.
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const COLUMN_RADIUS = 24;
const COLUMN_PADDING = 16;
const SECTION_GAP = 12;

interface SortableColumnViewProps {
  column: BoardColumnItem;
  columnIndex: number;
  columnCount: number;
  isReducedMotion: boolean;
  onMove: (cardId: string, toColumnId: string, toIndex: number) => void;
  onMoveToAdjacentColumn: (cardId: string, step: -1 | 1) => string | null;
  onOpenMoveCard: (cardId: string) => void;
  onAddCard: (columnId: string) => void;
  onOpenMenu: (columnId: string) => void;
  drag: BoardDrag;
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
  columnIndex,
  columnCount,
  isReducedMotion,
  onMove,
  onMoveToAdjacentColumn,
  onOpenMoveCard,
  onAddCard,
  onOpenMenu,
  drag,
  onRequestDelete,
  onLift,
  onTick,
  onDrop,
}: SortableColumnViewProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { column: sortable, scrollHandler } = useSortableColumn({
    columnId: column.id,
    ids: column.cards.map((card) => card.id),
    scrollRef,
    drag,
    onMove,
    onLift,
    onTick,
    onDrop,
  });
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;
  const cardCount = column.cards.length;

  // Coluna vazia: a área do estado vazio tem tamanho fixo. Com o cartão por cima, o estado vazio
  // fica transparente (sem sair do lugar) e a vaga é desenhada dentro dessa área, acima do
  // "Adicionar cartão": a coluna não muda de tamanho. A troca é na UI thread, no mesmo quadro em
  // que a vaga aparece (pelo React, os dois ficariam na tela por um instante).
  const isEmpty = cardCount === 0;
  const isReceiving = useDerivedValue(() => {
    const id = drag.activeId.get();
    return id !== null && sortable.order.get().includes(id);
  });
  const emptyHeight = useSharedValue(0);
  const receivingFooterHeight = useSharedValue(0);
  const measureEmpty = (event: LayoutChangeEvent) => {
    emptyHeight.set(event.nativeEvent.layout.height);
  };
  const measureReceivingFooter = (event: LayoutChangeEvent) => {
    receivingFooterHeight.set(event.nativeEvent.layout.height);
  };
  // Altura da vaga na coluna vazia: o espaço do estado vazio menos o rodapé (0 = altura do cartão).
  const slotHeight = useDerivedValue(() =>
    isEmpty ? Math.max(0, emptyHeight.get() - receivingFooterHeight.get() - SECTION_GAP) : 0,
  );
  const emptyStateStyle = useAnimatedStyle(() => ({ opacity: isReceiving.get() ? 0 : 1 }));
  const receivingFooterStyle = useAnimatedStyle(() => ({ opacity: isReceiving.get() ? 1 : 0 }));

  // Na coluna vazia, a vaga fica por cima da área do estado vazio: a lista não ocupa espaço.
  const listStyle = useAnimatedStyle(() => ({
    height: isEmpty ? 0 : sortable.contentHeight.get(),
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
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onLayout={measureViewport}
        onContentSizeChange={measureContent}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <ColumnHeader title={column.title} cardCount={cardCount} onOpenMenu={openMenu} />

        {/* Sempre montada (altura 0 sem cartões): a vaga também aparece numa coluna vazia. */}
        <Animated.View ref={sortable.listRef} onLayout={measureList} style={listStyle}>
          <DropPlaceholder
            columnId={column.id}
            column={sortable}
            drag={drag}
            reorderDuration={reorderDuration}
            fixedHeight={slotHeight}
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
              isReducedMotion={isReducedMotion}
              onMove={onMove}
              onMoveToAdjacentColumn={onMoveToAdjacentColumn}
              onOpenMoveCard={onOpenMoveCard}
            />
          ))}
        </Animated.View>

        {isEmpty ? (
          <View onLayout={measureEmpty}>
            <Animated.View style={emptyStateStyle}>
              <ColumnFooter isEmpty onAddCard={addCard} />
            </Animated.View>
            {/* Só visual durante o arraste (nessa hora não dá para tocar em nada). */}
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onLayout={measureReceivingFooter}
              style={[styles.receivingFooter, receivingFooterStyle]}
            >
              <ColumnFooter isEmpty={false} onAddCard={addCard} />
            </Animated.View>
          </View>
        ) : (
          <View style={styles.footerAfterList}>
            <ColumnFooter isEmpty={false} onAddCard={addCard} />
          </View>
        )}
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
  footerAfterList: {
    marginTop: SECTION_GAP,
  },
  receivingFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
