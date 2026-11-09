import { useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLUMN_GAP, useBoardColumnLayout } from '@/hooks/useBoardColumnLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { useHaptics } from '@/hooks/useHaptics';
import { useMinimumDuration } from '@/hooks/useMinimumDuration';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ptBR } from '@/i18n/pt-BR';
import { colors, duration, skeleton } from '@/theme';

import { useBoardViewModel } from '../viewmodel/useBoardViewModel';
import { AddColumnButton } from './components/AddColumnButton';
import { BoardFilterModal } from './components/BoardFilterModal';
import { BoardMenu, boardRenameLabels } from './components/BoardMenu';
import { BoardSkeleton } from './components/BoardSkeleton';
import { BoardToolbar } from './components/BoardToolbar';
import { DragOverlay } from './components/DragOverlay';
import { FilterSkeletonOverlay } from './components/FilterSkeletonOverlay';
import { SortableColumnView } from './components/SortableColumn';
import { useBoardActions } from './components/useBoardActions';
import { useBoardDrag } from './components/useBoardDrag';

// ScrollView do Gesture Handler, animado: a rolagem do quadro é lida e comandada na UI thread.
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const SCREEN_GUTTER = 24;
// Colunas que aparecem na tela ao abrir (a terceira só aparece pela borda). As outras entram uma
// por quadro de animação, fora da vista.
const FIRST_PAINT_COLUMNS = 2;
// Montagem progressiva concluída: daí em diante, toda coluna nova (inclusive no meio do quadro,
// como a duplicada) entra direto, sem cortar a lista.
const ALL_COLUMNS = Number.POSITIVE_INFINITY;
const text = ptBR.board;

interface BoardScreenProps {
  boardId: string;
}

// Tela do quadro: colunas lado a lado, com encaixe por coluna. Segurar um cartão e arrastar muda
// a ordem ou a coluna dele.
export function BoardScreen({ boardId }: BoardScreenProps) {
  const vm = useBoardViewModel(boardId);
  // Skeleton enquanto carrega, por no mínimo skeleton.minDurationMs (sem piscar).
  const showSkeleton = useMinimumDuration(vm.isLoading, skeleton.minDurationMs);
  // Ao sair do skeleton, monta primeiro só as colunas que aparecem na tela e depois uma coluna
  // por quadro: montar tudo de uma vez travava a transição (num quadro cheio, por segundos).
  const [mountedCount, setMountedCount] = useState(FIRST_PAINT_COLUMNS);
  const columnTotal = vm.columns.length;
  useEffect(() => {
    if (showSkeleton || mountedCount === ALL_COLUMNS) return;
    const frame = requestAnimationFrame(() =>
      setMountedCount((count) => (count + 1 >= columnTotal ? ALL_COLUMNS : count + 1)),
    );
    return () => cancelAnimationFrame(frame);
  }, [showSkeleton, mountedCount, columnTotal]);
  const isFullyMounted = mountedCount === ALL_COLUMNS;
  const mountedColumns = vm.columns.slice(0, mountedCount);
  const haptics = useHaptics();
  const isReducedMotion = useReducedMotion();
  const { columnWidth, snapInterval } = useBoardColumnLayout();
  const { cardActions, columnActions } = useBoardActions(vm);
  const { drag, activeCardId, boardScrollHandler, originRef, boardScrollRef } = useBoardDrag({
    columnIds: vm.columns.map((column) => column.id),
    pitch: snapInterval,
    gap: COLUMN_GAP,
    gutter: SCREEN_GUTTER,
    onMove: cardActions.move,
    onDrop: haptics.drop,
    onDropOnNewColumn: vm.createColumnWithCard,
  });
  // Conteúdo do cartão segurado, desenhado na camada de arraste.
  const draggedCard = activeCardId
    ? (vm.columns
        .find((column) => column.cards.some((card) => card.id === activeCardId))
        ?.cards.find((card) => card.id === activeCardId) ?? null)
    : null;

  // Larguras da janela e do conteúdo do quadro, para a rolagem automática lateral.
  const measureBoard = (event: LayoutChangeEvent) => {
    drag.boardViewportWidth.set(event.nativeEvent.layout.width);
  };
  const measureBoardContent = (width: number) => {
    drag.boardContentWidth.set(width);
  };
  // Largura vem da tela em tempo de execução: caso permitido de style (REGRAS.md, regra 5).
  const columnStyle = { width: columnWidth };

  // Coluna nova (ou devolvida pelo "Desfazer"): o quadro rola até ela, como ao soltar um cartão.
  const { focusRequest } = vm;
  const { focusColumn } = drag;
  useEffect(() => {
    if (focusRequest) focusColumn(focusRequest.columnId);
  }, [focusRequest, focusColumn]);

  // Confirmação nativa do iOS ao puxar e segurar uma coluna.
  const { columnToDelete } = vm;
  const columnDeleteRequest = useMemo(
    () =>
      columnToDelete
        ? {
            title: text.deleteColumnTitle(columnToDelete.title),
            message: columnToDelete.message,
            confirmLabel: text.deleteColumnConfirm,
            cancelLabel: text.deleteColumnCancel,
          }
        : null,
    [columnToDelete],
  );
  useDestructiveConfirm(columnDeleteRequest, {
    onConfirm: vm.confirmDeleteColumn,
    onCancel: vm.closeDeleteColumn,
  });
  useDestructiveConfirm(vm.deleteBoardRequest, {
    onConfirm: vm.confirmDeleteBoard,
    onCancel: vm.cancelDeleteBoard,
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader
        title={vm.title}
        subtitle={vm.subtitle}
        isLoading={showSkeleton}
        errorText={vm.errorText}
        onBack={vm.goBack}
        onRename={vm.renameBoard}
        renameLabels={boardRenameLabels}
        renderMenu={(startRename) => (
          <BoardMenu
            onRename={startRename}
            onCreateColumn={vm.createColumn}
            onDuplicate={vm.duplicateBoard}
            onMoveToFolder={vm.moveBoardToFolder}
            onDelete={vm.requestDeleteBoard}
          />
        )}
      />

      <BoardToolbar isLoading={showSkeleton} filter={vm.filter} />

      <View className="flex-1">
        <AnimatedScrollView
          ref={boardScrollRef}
          onScroll={boardScrollHandler}
          scrollEventThrottle={16}
          onLayout={measureBoard}
          onContentSizeChange={measureBoardContent}
          horizontal
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
            <>
              {mountedColumns.map((column, index) => (
                <Animated.View
                  key={column.id}
                  entering={FadeIn.duration(duration.normal)}
                  style={columnStyle}
                >
                  <SortableColumnView
                    column={column}
                    columnIndex={index}
                    columnCount={vm.columns.length}
                    isReducedMotion={isReducedMotion}
                    drag={drag}
                    cardActions={cardActions}
                    columnActions={columnActions}
                    haptics={haptics}
                  />
                </Animated.View>
              ))}
              {isFullyMounted ? (
                <AddColumnButton style={columnStyle} drag={drag} onPress={vm.createColumn} />
              ) : null}
            </>
          )}
        </AnimatedScrollView>
        {vm.filter.isApplying ? <FilterSkeletonOverlay columnStyle={columnStyle} /> : null}
      </View>

      <Text className="px-6 pt-3 text-caption text-text-secondary">{ptBR.board.dragHint}</Text>

      <BoardFilterModal filter={vm.filter} />

      {/* Por último: o cartão segurado fica por cima do título, das colunas e dos cabeçalhos. */}
      <DragOverlay
        drag={drag}
        originRef={originRef}
        card={draggedCard}
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
