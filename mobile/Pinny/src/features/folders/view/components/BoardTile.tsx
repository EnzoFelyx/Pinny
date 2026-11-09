import { Check, Columns3, Pin } from 'lucide-react-native';
import { memo } from 'react';
import { type AccessibilityActionEvent, Pressable, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors, CONTEXT_MENU_HOLD_MS } from '@/theme';

import type { HomeBoardItem } from '../../viewmodel/useFolderItems';

const BOARD_ICON_SIZE = 20;
const PIN_ICON_SIZE = 12;
const CHECK_ICON_SIZE = 12;

// O menu de contexto nativo cuida do toque longo; aqui ele só impede o toque de abrir o quadro.
function ignoreLongPress() {}

// Opções do quadro ao segurar (tela da pasta).
export interface BoardMenuActions {
  // "Fixar na Início"/"Desafixar" (sem board.pinActionLabel, a opção não aparece).
  onTogglePin: (boardId: string) => void;
  onDelete: (boardId: string) => void;
}

interface BoardTileProps {
  board: HomeBoardItem;
  // Cor escura da pasta, usada no ícone do quadro.
  noteColor: string;
  onOpen: (boardId: string) => void;
  // Dentro do menu de contexto nativo (segurar): soltar depois de CONTEXT_MENU_HOLD_MS só abre o
  // menu, sem abrir o quadro. As mesmas opções viram ações do leitor de tela (regra 15).
  menu?: BoardMenuActions;
  // Tela da pasta: alfinete ao lado do nome dos fixados (na Início, só o fundo lavanda).
  showsPinIcon?: boolean;
  // Modo de seleção ("Fixar quadros"): círculo no canto e o toque marca/desmarca em vez de abrir.
  // undefined = fora do modo.
  isSelected?: boolean;
}

// Quadro da pasta: ícone de colunas e nome. Fixado na Início, ganha o fundo lavanda (e, na tela da
// pasta, o alfinete), também no modo de seleção, para dar para escolher os fixados e desafixar.
// Selecionando, o círculo do canto e a borda roxa marcam os escolhidos, como nas fotos do iOS.
export const BoardTile = memo(function BoardTile({
  board,
  noteColor,
  onOpen,
  menu,
  showsPinIcon = false,
  isSelected,
}: BoardTileProps) {
  const isSelecting = isSelected !== undefined;
  // Selecionando, a borda roxa marca os escolhidos (todos têm a borda, para o tamanho não mudar).
  const selectionBorder = isSelecting
    ? `border-[1.5px] ${isSelected ? 'border-primary' : 'border-transparent'}`
    : '';
  const menuActions =
    menu && !isSelecting
      ? [
          ...(board.pinActionLabel ? [{ name: 'togglePin', label: board.pinActionLabel }] : []),
          { name: 'delete', label: ptBR.folders.deleteBoard },
        ]
      : undefined;
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'togglePin') menu?.onTogglePin(board.id);
    if (event.nativeEvent.actionName === 'delete') menu?.onDelete(board.id);
  };

  return (
    <Pressable
      accessibilityRole={isSelecting ? 'checkbox' : 'button'}
      accessibilityState={isSelecting ? { checked: isSelected } : undefined}
      accessibilityLabel={
        isSelecting ? board.selectionAccessibilityLabel : board.accessibilityLabel
      }
      accessibilityActions={menuActions}
      onAccessibilityAction={handleAccessibilityAction}
      onPress={() => onOpen(board.id)}
      // Com onLongPress, o Pressable não chama o onPress ao soltar depois do toque longo.
      onLongPress={menu ? ignoreLongPress : undefined}
      delayLongPress={CONTEXT_MENU_HOLD_MS}
      className={`h-[64px] flex-1 flex-row items-center gap-2 rounded-[12px] p-2.5 active:opacity-70 ${
        board.isPinned ? 'bg-secondary' : 'bg-column-background'
      } ${selectionBorder}`}
    >
      <Columns3 size={BOARD_ICON_SIZE} color={noteColor} />
      {/* O nome encolhe antes do alfinete: nome longo corta e o alfinete continua visível. */}
      <View className="flex-1 flex-row items-center gap-1">
        <Text numberOfLines={2} className="shrink text-label text-text-primary">
          {board.title}
        </Text>
        {showsPinIcon && board.isPinned ? (
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
