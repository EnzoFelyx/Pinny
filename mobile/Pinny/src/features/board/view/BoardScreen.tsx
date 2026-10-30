import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLUMN_GAP, useBoardColumnLayout } from '@/hooks/useBoardColumnLayout';
import { useHaptics } from '@/hooks/useHaptics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useBoardViewModel } from '../viewmodel/useBoardViewModel';
import { BoardHeader } from './components/BoardHeader';
import { BoardToolbar } from './components/BoardToolbar';
import { DragOverlay } from './components/DragOverlay';
import { SortableColumnView } from './components/SortableColumn';
import { useDragOverlay } from './components/useDragOverlay';

const SCREEN_GUTTER = 24;
const text = ptBR.board;

interface BoardScreenProps {
  boardId: string;
}

// Tela do quadro: colunas lado a lado, com encaixe por coluna. Segurar um cartão muda a ordem.
export function BoardScreen({ boardId }: BoardScreenProps) {
  const vm = useBoardViewModel(boardId);
  const haptics = useHaptics();
  const isReducedMotion = useReducedMotion();
  const overlay = useDragOverlay();
  // Conteúdo do cartão segurado, desenhado na camada de arraste.
  const draggedCard =
    vm.columns.flatMap((column) => column.cards).find((card) => card.id === overlay.activeCardId) ??
    null;
  const { columnWidth, snapInterval } = useBoardColumnLayout();
  // Largura vem da tela em tempo de execução: caso permitido de style (REGRAS.md, regra 5).
  const columnStyle = { width: columnWidth };

  // Confirmação nativa do iOS ao puxar e segurar uma coluna (por enquanto só fecha).
  const { columnToDelete, closeDeleteColumn } = vm;
  useEffect(() => {
    if (!columnToDelete) return;
    Alert.alert(
      text.deleteColumnTitle(columnToDelete.title),
      text.deleteColumnMessage,
      [
        { text: text.deleteColumnCancel, style: 'cancel', onPress: closeDeleteColumn },
        { text: text.deleteColumnConfirm, style: 'destructive', onPress: closeDeleteColumn },
      ],
      { cancelable: true, onDismiss: closeDeleteColumn },
    );
  }, [columnToDelete, closeDeleteColumn]);

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        style={styles.board}
        contentContainerStyle={styles.columnsRow}
      >
        {vm.columns.map((column) => (
          <View key={column.id} style={columnStyle}>
            <SortableColumnView
              column={column}
              isReducedMotion={isReducedMotion}
              onMove={vm.moveCard}
              onAddCard={vm.addCard}
              onOpenMenu={vm.openColumnMenu}
              onRequestDelete={vm.requestDeleteColumn}
              overlay={overlay}
              onLift={haptics.lift}
              onTick={haptics.tick}
              onDrop={haptics.drop}
            />
          </View>
        ))}
      </ScrollView>

      <Text className="px-6 pt-3 text-caption text-text-secondary">{ptBR.board.dragHint}</Text>

      {/* Por último: o cartão segurado fica por cima do título, das colunas e dos cabeçalhos. */}
      <DragOverlay
        overlay={overlay}
        originRef={overlay.originRef}
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
