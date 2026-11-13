import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { duration } from '@/theme';

import type { BoardColumnItem } from '../../viewmodel/boardItems';
import { AddColumnButton } from './AddColumnButton';
import type { CardActions, ColumnActions, DragHaptics } from './boardActions';
import { ColumnSlot } from './ColumnSlot';
import { SortableColumnView } from './SortableColumn';
import type { BoardDrag } from './useBoardDrag';
import type { ColumnDrag } from './useColumnDrag';
import type { SelectionValues } from './useSelectionValues';

interface BoardColumnListProps {
  // Só as já montadas (a montagem é escalonada); columnCount é o total do quadro.
  columns: readonly BoardColumnItem[];
  columnCount: number;
  isFullyMounted: boolean;
  columnStyle: ViewStyle;
  pitch: number;
  isReducedMotion: boolean;
  drag: BoardDrag;
  columnDrag: ColumnDrag;
  cardActions: CardActions;
  columnActions: ColumnActions;
  haptics: DragHaptics;
  isSelecting: boolean;
  isBatchDragging: boolean;
  selectedColumnIds: ReadonlySet<string> | null;
  selection: SelectionValues;
  accessibilitySelectedIds: ReadonlySet<string> | null;
  onCreateColumn: () => void;
}

// As colunas do quadro lado a lado (cada uma no seu lugar do arraste de coluna) e, no fim, a
// coluna "Adicionar coluna".
export function BoardColumnList({
  columns,
  columnCount,
  isFullyMounted,
  columnStyle,
  pitch,
  isReducedMotion,
  drag,
  columnDrag,
  cardActions,
  columnActions,
  haptics,
  isSelecting,
  isBatchDragging,
  selectedColumnIds,
  selection,
  accessibilitySelectedIds,
  onCreateColumn,
}: BoardColumnListProps) {
  // As colunas deslizam para abrir a vaga no mesmo ritmo dos cartões.
  const reorderDuration = isReducedMotion ? duration.fast : duration.normal;
  return (
    <>
      {columns.map((column, index) => (
        <Animated.View
          key={column.id}
          entering={FadeIn.duration(duration.normal)}
          style={columnStyle}
        >
          <ColumnSlot
            columnId={column.id}
            index={index}
            pitch={pitch}
            reorderDuration={reorderDuration}
            isReducedMotion={isReducedMotion}
            columnDrag={columnDrag}
            style={styles.columnSlot}
          >
            <SortableColumnView
              column={column}
              columnIndex={index}
              columnCount={columnCount}
              isReducedMotion={isReducedMotion}
              drag={drag}
              cardActions={cardActions}
              columnActions={columnActions}
              haptics={haptics}
              columnDrag={columnDrag}
              isSelecting={isSelecting}
              hasSelected={selectedColumnIds?.has(column.id) ?? false}
              selection={selection}
              accessibilitySelectedIds={accessibilitySelectedIds}
            />
          </ColumnSlot>
        </Animated.View>
      ))}
      {/* Selecionando, a coluna "Adicionar coluna" sai: uma tarefa de cada vez. */}
      {/* Durante a pilha do arraste em lote, ela volta: soltar ali cria a coluna com todos. */}
      {isFullyMounted && (!isSelecting || isBatchDragging) ? (
        <AddColumnButton
          style={columnStyle}
          drag={drag}
          isBatch={isBatchDragging}
          onPress={onCreateColumn}
        />
      ) : null}
    </>
  );
}

// Estilo do lugar animado da coluna (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  columnSlot: { flex: 1 },
});
