import { Archive, FolderInput, Trash2 } from 'lucide-react-native';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLUMN_GAP, useBoardColumnLayout } from '@/hooks/useBoardColumnLayout';
import { GlassSearchField } from '@/components/GlassSearchField';
import { GlassTextButton } from '@/components/GlassTextButton';
import { GlassToolbar } from '@/components/GlassToolbar';
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
import { ColumnDragOverlay } from './components/ColumnDragOverlay';
import { ColumnSlot } from './components/ColumnSlot';
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
  // As colunas deslizam para abrir a vaga no mesmo ritmo dos cartões.
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;
  const { columnWidth, snapInterval } = useBoardColumnLayout();
  const { selection, search, searchResultText } = vm;
  // Leitor de tela: a busca anuncia quantos cartões encontrou (o subtítulo some enquanto busca).
  useEffect(() => {
    if (searchResultText) AccessibilityInfo.announceForAccessibility(searchResultText);
  }, [searchResultText]);
  const { cardActions, columnActions } = useBoardActions({
    ...vm,
    toggleCardSelection: selection.toggle,
  });
  const {
    drag,
    activeCardId,
    columnDrag,
    draggedColumnId,
    markColumnOrderCommitted,
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
    onDropOnNewColumn: vm.createColumnWithCard,
    onMoveColumn: columnActions.moveTo,
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
  // Busca com um único resultado: o quadro rola até a coluna dele (de novo a cada cartão novo).
  const matchColumnId = vm.searchMatch?.columnId;
  const matchCardId = vm.searchMatch?.cardId;
  useEffect(() => {
    if (matchColumnId && matchCardId) focusColumn(matchColumnId);
  }, [matchColumnId, matchCardId, focusColumn]);

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
  const { batch } = vm;
  useDestructiveConfirm(batch.deleteRequest, {
    onConfirm: batch.confirmDelete,
    onCancel: batch.cancelDelete,
  });
  useDestructiveConfirm(vm.deleteBoardRequest, {
    onConfirm: vm.confirmDeleteBoard,
    onCancel: vm.cancelDeleteBoard,
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      {/* Selecionando: o título vira a contagem (sem renomear) e o "…" vira "Cancelar". Buscando:
          o campo de vidro toma o lugar do título, do subtítulo e do "…", e o voltar fecha a busca. */}
      <ScreenHeader
        title={selection.isSelecting ? selection.title : vm.title}
        subtitle={selection.isSelecting ? selection.hint : vm.subtitle}
        isLoading={showSkeleton}
        errorText={vm.errorText}
        // Buscando, o voltar só fecha a busca (o quadro continua aberto).
        onBack={search.isSearching ? search.cancel : vm.goBack}
        backAccessibilityLabel={search.isSearching ? text.search.close : undefined}
        onRename={selection.isSelecting || search.isSearching ? undefined : vm.renameBoard}
        renameLabels={boardRenameLabels}
        titleReplacement={
          search.isSearching ? (
            <GlassSearchField
              value={search.query}
              onChangeText={search.setQuery}
              placeholder={text.search.placeholder}
              accessibilityLabel={text.search.inputA11y}
            />
          ) : null
        }
        renderMenu={(startRename) =>
          search.isSearching ? null : selection.isSelecting ? (
            <GlassTextButton
              label={text.selection.cancel}
              accessibilityLabel={text.selection.cancelA11y}
              onPress={selection.cancel}
            />
          ) : (
            <BoardMenu
              onSearch={search.start}
              onSelectCards={selection.start}
              onRename={startRename}
              onCreateColumn={vm.createColumn}
              onOpenArchived={vm.openArchived}
              onDuplicate={vm.duplicateBoard}
              onMoveToFolder={vm.moveBoardToFolder}
              onDelete={vm.requestDeleteBoard}
            />
          )
        }
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
            <>
              {mountedColumns.map((column, index) => (
                <Animated.View
                  key={column.id}
                  entering={FadeIn.duration(duration.normal)}
                  style={columnStyle}
                >
                  <ColumnSlot
                    columnId={column.id}
                    index={index}
                    pitch={snapInterval}
                    reorderDuration={reorderDuration}
                    isReducedMotion={isReducedMotion}
                    columnDrag={columnDrag}
                    style={styles.columnSlot}
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
                      columnDrag={columnDrag}
                      selectedIds={selection.selectedIds}
                    />
                  </ColumnSlot>
                </Animated.View>
              ))}
              {/* Selecionando, a coluna "Adicionar coluna" sai: uma tarefa de cada vez. */}
              {isFullyMounted && !selection.isSelecting ? (
                <AddColumnButton style={columnStyle} drag={drag} onPress={vm.createColumn} />
              ) : null}
            </>
          )}
        </AnimatedScrollView>
        {vm.filter.isApplying ? <FilterSkeletonOverlay columnStyle={columnStyle} /> : null}
      </View>

      {/* Na seleção, a legenda sai e as colunas descem até embaixo: os botões flutuam por cima. */}
      {selection.isSelecting ? null : (
        <Text className="px-6 pt-3 text-caption text-text-secondary">{ptBR.board.dragHint}</Text>
      )}

      {selection.isSelecting ? (
        // Como no Mail: Mover à esquerda, Arquivar no meio e Apagar (vermelho) à direita, em
        // círculos de vidro, apagados até marcar um cartão.
        <GlassToolbar
          actions={[
            {
              key: 'move',
              icon: FolderInput,
              tone: 'accent',
              accessibilityLabel: text.selection.moveA11y,
              onPress: batch.openMove,
              disabled: !batch.canAct,
            },
            {
              key: 'archive',
              icon: Archive,
              tone: 'info',
              accessibilityLabel: text.selection.archiveA11y,
              onPress: batch.archive,
              disabled: !batch.canAct,
            },
            {
              key: 'delete',
              icon: Trash2,
              tone: 'destructive',
              accessibilityLabel: text.selection.deleteA11y,
              onPress: batch.requestDelete,
              disabled: !batch.canAct,
            },
          ]}
        />
      ) : null}

      <BoardFilterModal filter={vm.filter} />

      {/* Por último: o cartão segurado fica por cima do título, das colunas e dos cabeçalhos. */}
      <DragOverlay
        drag={drag}
        originRef={originRef}
        card={draggedCard}
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
  columnSlot: { flex: 1 },
  columnsRow: {
    alignItems: 'stretch',
    gap: COLUMN_GAP,
    paddingHorizontal: SCREEN_GUTTER,
  },
});
