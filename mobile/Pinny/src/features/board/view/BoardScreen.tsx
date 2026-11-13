import { useLayoutEffect } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLUMN_GAP, useBoardColumnLayout } from '@/hooks/useBoardColumnLayout';
import { useHaptics } from '@/hooks/useHaptics';
import { useMinimumDuration } from '@/hooks/useMinimumDuration';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScreenReaderEnabled } from '@/hooks/useScreenReaderEnabled';
import { ptBR } from '@/i18n/pt-BR';
import { colors, duration, skeleton } from '@/theme';

import { findCardItems } from '../viewmodel/boardItems';
import { useBoardViewModel } from '../viewmodel/useBoardViewModel';
import { BoardColumnList } from './components/BoardColumnList';
import { BoardFilterModal } from './components/BoardFilterModal';
import { BoardScreenHeader } from './components/BoardScreenHeader';
import { BoardSelectionToolbar } from './components/BoardSelectionToolbar';
import { BoardSkeleton } from './components/BoardSkeleton';
import { BoardToolbar } from './components/BoardToolbar';
import { ColumnDragOverlay } from './components/ColumnDragOverlay';
import { DragOverlay } from './components/DragOverlay';
import { FilterSkeletonOverlay } from './components/FilterSkeletonOverlay';
import { useSelectionValues } from './components/useSelectionValues';
import { useBoardActions } from './components/useBoardActions';
import { useBoardConfirms } from './components/useBoardConfirms';
import { useBoardDrag } from './components/useBoardDrag';
import { useBoardFocus } from './components/useBoardFocus';
import { useStagedColumns } from './components/useStagedColumns';

// ScrollView do Gesture Handler, animado: a rolagem do quadro é lida e comandada na UI thread.
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const SCREEN_GUTTER = 24;

interface BoardScreenProps {
  boardId: string;
}

// Tela do quadro: colunas lado a lado, com encaixe por coluna. Segurar um cartão e arrastar muda
// a ordem ou a coluna dele.
export function BoardScreen({ boardId }: BoardScreenProps) {
  const vm = useBoardViewModel(boardId);
  // Skeleton enquanto carrega, por no mínimo skeleton.minDurationMs (sem piscar).
  const showSkeleton = useMinimumDuration(vm.isLoading, skeleton.minDurationMs);
  const { mountedCount, isFullyMounted } = useStagedColumns(showSkeleton, vm.columns.length);
  const mountedColumns = vm.columns.slice(0, mountedCount);
  const haptics = useHaptics();
  const isReducedMotion = useReducedMotion();
  const { columnWidth, snapInterval } = useBoardColumnLayout();
  const { selection } = vm;
  // Seleção na UI thread para os cartões; com o leitor de tela ligado, eles também recebem os
  // marcados pelo React (caixa de seleção).
  const selectionValues = useSelectionValues(selection.selectedIds, vm.isBatchDragging);
  const isScreenReaderOn = useScreenReaderEnabled();
  const { cardActions, columnActions, dropOnNewColumn, startBatchDrag, endBatchDrag } =
    useBoardActions({
      ...vm,
      toggleCardSelection: selection.toggle,
    });
  const {
    drag,
    activeCardId,
    columnDrag,
    draggedColumnId,
    markColumnOrderCommitted,
    batchStack,
    boardScrollHandler,
    originRef,
    boardScrollRef,
  } = useBoardDrag({
    columnIds: vm.columns.map((column) => column.id),
    pitch: snapInterval,
    gap: COLUMN_GAP,
    gutter: SCREEN_GUTTER,
    onMove: cardActions.move,
    onDrop: haptics.drop,
    onDropOnNewColumn: dropOnNewColumn,
    onMoveColumn: columnActions.moveTo,
    batchOptions: {
      selectedIds: vm.selectedInOrder,
      onBegin: startBatchDrag,
      onEnd: endBatchDrag,
      onGathered: haptics.tick,
    },
    isReducedMotion,
  });
  // Coluna solta numa vaga nova: avisa quando a nova ordem é desenhada (antes da pintura); a cópia
  // some quando também terminar de assentar.
  const columnOrderKey = vm.columns.map((column) => column.id).join();
  useLayoutEffect(() => {
    markColumnOrderCommitted();
  }, [columnOrderKey, markColumnOrderCommitted]);
  // Coluna segurada pelo cabeçalho, desenhada na camada de arraste.
  const draggedColumn = draggedColumnId
    ? (vm.columns.find((column) => column.id === draggedColumnId) ?? null)
    : null;
  // Camada de arraste: o cartão segurado e os outros da pilha do arraste em lote.
  const [draggedCard = null] = activeCardId ? findCardItems(vm.columns, [activeCardId]) : [];
  const dragStack = batchStack ? { cards: findCardItems(vm.columns, batchStack.ids) } : null;

  // Larguras da janela e do conteúdo do quadro, para a rolagem automática lateral.
  const measureBoard = (event: LayoutChangeEvent) => {
    drag.boardViewportWidth.set(event.nativeEvent.layout.width);
  };
  const measureBoardContent = (width: number) => {
    drag.boardContentWidth.set(width);
  };
  // Largura vem da tela em tempo de execução: caso permitido de style (REGRAS.md, regra 5).
  const columnStyle = { width: columnWidth };

  useBoardFocus({
    focusRequest: vm.focusRequest,
    searchMatch: vm.searchMatch,
    searchResultText: vm.searchResultText,
    focusColumn: drag.focusColumn,
  });
  useBoardConfirms(vm);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <BoardScreenHeader vm={vm} isLoading={showSkeleton} />

      <BoardToolbar isLoading={showSkeleton} filter={vm.filter} />

      <View className="flex-1">
        <AnimatedScrollView
          ref={boardScrollRef}
          onScroll={boardScrollHandler}
          scrollEventThrottle={16}
          onLayout={measureBoard}
          onContentSizeChange={measureBoardContent}
          horizontal
          // Buscando: rolar o quadro esconde o teclado, para ver os cartões que sobraram.
          keyboardDismissMode="on-drag"
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          style={styles.board}
          contentContainerStyle={styles.columnsRow}
        >
          {showSkeleton ? (
            // Transição cruzada: o skeleton sai com fade enquanto as colunas entram com fade.
            <Animated.View exiting={FadeOut.duration(duration.normal)}>
              <BoardSkeleton columnStyle={columnStyle} />
            </Animated.View>
          ) : (
            <BoardColumnList
              columns={mountedColumns}
              columnCount={vm.columns.length}
              isFullyMounted={isFullyMounted}
              columnStyle={columnStyle}
              pitch={snapInterval}
              isReducedMotion={isReducedMotion}
              drag={drag}
              columnDrag={columnDrag}
              cardActions={cardActions}
              columnActions={columnActions}
              haptics={haptics}
              isSelecting={selection.isSelecting}
              isBatchDragging={vm.isBatchDragging}
              selectedColumnIds={vm.selectedColumnIds}
              selection={selectionValues}
              accessibilitySelectedIds={isScreenReaderOn ? selection.selectedIds : null}
              onCreateColumn={vm.createColumn}
            />
          )}
        </AnimatedScrollView>
        {vm.filter.isApplying ? <FilterSkeletonOverlay columnStyle={columnStyle} /> : null}
      </View>

      {/* Na seleção, a legenda sai e as colunas descem até embaixo: os botões flutuam por cima. */}
      {selection.isSelecting ? null : (
        <Text className="px-6 pt-3 text-caption text-text-secondary">{ptBR.board.dragHint}</Text>
      )}

      {selection.isSelecting ? <BoardSelectionToolbar batch={vm.batch} /> : null}

      <BoardFilterModal filter={vm.filter} />

      {/* Por último: o cartão segurado fica por cima do título, das colunas e dos cabeçalhos. */}
      <DragOverlay
        drag={drag}
        originRef={originRef}
        card={draggedCard}
        isCardSelected={activeCardId !== null && selection.selectedIds?.has(activeCardId) === true}
        stack={dragStack}
        isReducedMotion={isReducedMotion}
      />
      <ColumnDragOverlay
        columnDrag={columnDrag}
        column={draggedColumn}
        isReducedMotion={isReducedMotion}
      />
    </SafeAreaView>
  );
}

// SafeAreaView e ScrollView do Gesture Handler não aceitam className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  board: { flex: 1 },
  columnsRow: {
    alignItems: 'stretch',
    gap: COLUMN_GAP,
    paddingHorizontal: SCREEN_GUTTER,
  },
});
