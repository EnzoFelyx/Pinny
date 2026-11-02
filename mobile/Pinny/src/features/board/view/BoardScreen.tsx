import { useEffect, useMemo } from 'react';
import { Alert, type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLUMN_GAP, useBoardColumnLayout } from '@/hooks/useBoardColumnLayout';
import { useHaptics } from '@/hooks/useHaptics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useBoardViewModel } from '../viewmodel/useBoardViewModel';
import { AddColumnButton } from './components/AddColumnButton';
import type { CardActions, ColumnActions } from './components/boardActions';
import { BoardHeader } from './components/BoardHeader';
import { BoardToolbar } from './components/BoardToolbar';
import { DragOverlay } from './components/DragOverlay';
import { SortableColumnView } from './components/SortableColumn';
import { useBoardDrag } from './components/useBoardDrag';

// ScrollView do Gesture Handler, animado: a rolagem do quadro é lida e comandada na UI thread.
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const SCREEN_GUTTER = 24;
const text = ptBR.board;

interface BoardScreenProps {
  boardId: string;
}

// Tela do quadro: colunas lado a lado, com encaixe por coluna. Segurar um cartão e arrastar muda
// a ordem ou a coluna dele.
export function BoardScreen({ boardId }: BoardScreenProps) {
  const vm = useBoardViewModel(boardId);
  const haptics = useHaptics();
  const isReducedMotion = useReducedMotion();
  const { columnWidth, snapInterval } = useBoardColumnLayout();
  const { drag, boardScrollHandler, originRef, boardScrollRef } = useBoardDrag({
    columnIds: vm.columns.map((column) => column.id),
    pitch: snapInterval,
    gap: COLUMN_GAP,
    gutter: SCREEN_GUTTER,
    onMove: vm.moveCard,
    onDrop: haptics.drop,
    onDropOnNewColumn: vm.createColumnWithCard,
  });
  // Conteúdo do cartão segurado, desenhado na camada de arraste.
  const draggedCard =
    vm.columns.flatMap((column) => column.cards).find((card) => card.id === drag.activeCardId) ??
    null;
  // Ações repassadas às colunas e aos cartões (objetos estáveis: as colunas são memo).
  const cardActions = useMemo<CardActions>(
    () => ({
      move: vm.moveCard,
      moveToAdjacentColumn: vm.moveCardToAdjacentColumn,
      openMoveCard: vm.openMoveCard,
    }),
    [vm.moveCard, vm.moveCardToAdjacentColumn, vm.openMoveCard],
  );
  const columnActions = useMemo<ColumnActions>(
    () => ({
      addCard: vm.addCard,
      move: vm.moveColumn,
      duplicate: vm.duplicateColumn,
      rename: vm.renameColumn,
      requestDelete: vm.requestDeleteColumn,
    }),
    [vm.addCard, vm.moveColumn, vm.duplicateColumn, vm.renameColumn, vm.requestDeleteColumn],
  );

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
  const { columnToDelete, closeDeleteColumn, confirmDeleteColumn } = vm;
  useEffect(() => {
    if (!columnToDelete) return;
    Alert.alert(
      text.deleteColumnTitle(columnToDelete.title),
      columnToDelete.message,
      [
        { text: text.deleteColumnCancel, style: 'cancel', onPress: closeDeleteColumn },
        { text: text.deleteColumnConfirm, style: 'destructive', onPress: confirmDeleteColumn },
      ],
      { cancelable: true, onDismiss: closeDeleteColumn },
    );
  }, [columnToDelete, closeDeleteColumn, confirmDeleteColumn]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <BoardHeader
        title={vm.title}
        subtitle={vm.subtitle}
        errorText={vm.errorText}
        onBack={vm.goBack}
        onOpenMenu={vm.openBoardMenu}
      />

      <BoardToolbar />

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
        {vm.columns.map((column, index) => (
          <View key={column.id} style={columnStyle}>
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
          </View>
        ))}
        <AddColumnButton style={columnStyle} drag={drag} onPress={vm.createColumn} />
      </AnimatedScrollView>

      <Text className="px-6 pt-3 text-caption text-text-secondary">{ptBR.board.dragHint}</Text>

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
