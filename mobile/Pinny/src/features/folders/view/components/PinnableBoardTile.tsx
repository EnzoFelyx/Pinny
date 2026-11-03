import { Button, ContextMenu, Host, RNHostView } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

import type { HomeBoardItem } from '../../viewmodel/useFolderItems';
import { BoardTile } from './BoardTile';

interface PinnableBoardTileProps {
  board: HomeBoardItem;
  noteColor: string;
  onOpen: (boardId: string) => void;
  onTogglePin: (boardId: string) => void;
}

// Tela da pasta: segurar o quadro abre o menu de contexto nativo do iOS com "Fixar na Início" ou
// "Desafixar". O toque simples continua abrindo o quadro. Sem a opção (já há 3 fixados), é só o
// bloco do quadro.
export function PinnableBoardTile({
  board,
  noteColor,
  onOpen,
  onTogglePin,
}: PinnableBoardTileProps) {
  const tile = (
    <BoardTile
      board={board}
      noteColor={noteColor}
      onOpen={onOpen}
      onTogglePin={onTogglePin}
      showsPinIcon
    />
  );
  if (!board.pinActionLabel) return tile;

  return (
    <Host style={styles.host}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button
            label={board.pinActionLabel}
            systemImage={board.isPinned ? 'pin.slash' : 'pin'}
            onPress={() => onTogglePin(board.id)}
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <RNHostView>{tile}</RNHostView>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

// Host do SwiftUI não aceita className (REGRAS.md, regra 5). Mesma altura do bloco do quadro.
const styles = StyleSheet.create({
  host: { flex: 1, height: 58 },
});
