import { Check, Pin } from 'lucide-react-native';
import { memo } from 'react';
import { type AccessibilityActionEvent, Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';

import type { HomeBoardItem } from '../../viewmodel/useFolderItems';
import { BoardThumbnail } from './BoardThumbnail';

const PIN_ICON_SIZE = 12;
const CHECK_ICON_SIZE = 12;

interface BoardTileProps {
  board: HomeBoardItem;
  noteColor: string;
  onOpen: (boardId: string) => void;
  // Tela da pasta: "Fixar na Início"/"Desafixar" também como ação do leitor de tela (alternativa
  // ao segurar, regra 15).
  onTogglePin?: (boardId: string) => void;
  // Tela da pasta: alfinete ao lado do nome dos fixados (na Início, só o fundo lavanda).
  showsPinIcon?: boolean;
  // Modo de seleção ("Fixar quadros"): círculo no canto e o toque marca/desmarca em vez de abrir.
  // undefined = fora do modo.
  isSelected?: boolean;
}

// Quadro da pasta: miniatura e nome. Fixado na Início, ganha o fundo lavanda (e, na tela da pasta,
// o alfinete). No modo de seleção, o círculo do canto marca os escolhidos, como na seleção de
// fotos do iOS.
export const BoardTile = memo(function BoardTile({
  board,
  noteColor,
  onOpen,
  onTogglePin,
  showsPinIcon = false,
  isSelected,
}: BoardTileProps) {
  const isSelecting = isSelected !== undefined;
  const isHighlighted = isSelecting ? isSelected : board.isPinned;
  const pinAction =
    onTogglePin && board.pinActionLabel
      ? [{ name: 'togglePin', label: board.pinActionLabel }]
      : undefined;
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'togglePin') onTogglePin?.(board.id);
  };

  return (
    <Pressable
      accessibilityRole={isSelecting ? 'checkbox' : 'button'}
      accessibilityState={isSelecting ? { checked: isSelected } : undefined}
      accessibilityLabel={isSelecting ? board.title : board.accessibilityLabel}
      accessibilityActions={isSelecting ? undefined : pinAction}
      onAccessibilityAction={handleAccessibilityAction}
      onPress={() => onOpen(board.id)}
      className={`h-[58px] flex-1 flex-row items-center gap-2 rounded-[12px] p-2.5 active:opacity-70 ${
        isHighlighted ? 'bg-secondary' : 'bg-column-background'
      }`}
    >
      <BoardThumbnail noteColor={noteColor} />
      {/* O nome encolhe antes do alfinete: nome longo corta e o alfinete continua visível. */}
      <View className="flex-1 flex-row items-center gap-1">
        <Text numberOfLines={2} className="shrink text-tag text-text-primary">
          {board.title}
        </Text>
        {showsPinIcon && board.isPinned && !isSelecting ? (
          <Pin size={PIN_ICON_SIZE} color={colors.textSecondary} />
        ) : null}
      </View>
      {isSelecting ? (
        // Círculo de seleção no canto superior direito: vazio ou preenchido com o check.
        <View
          className={`absolute right-1.5 top-1.5 h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
            isSelected ? 'border-primary bg-primary' : 'border-border-strong bg-surface'
          }`}
        >
          {isSelected ? <Check size={CHECK_ICON_SIZE} color={colors.textOnPrimary} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
});
