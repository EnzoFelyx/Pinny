import { Button, ContextMenu, Divider, Host, RNHostView } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

import type { HomeBoardItem } from '../../viewmodel/useFolderItems';
import { type BoardMenuActions, BoardTile } from './BoardTile';

interface BoardMenuTileProps {
  board: HomeBoardItem;
  noteColor: string;
  onOpen: (boardId: string) => void;
  menu: BoardMenuActions;
}

// Tela da pasta: segurar o quadro abre o menu de contexto nativo do iOS com "Fixar na Início" ou
// "Desafixar" (some com 3 fixados) e "Excluir quadro" (vermelho, separado). O toque simples
// continua abrindo o quadro.
export function BoardMenuTile({ board, noteColor, onOpen, menu }: BoardMenuTileProps) {
  const pinLabel = board.pinActionLabel;

  return (
    <Host style={styles.host}>
      <ContextMenu>
        <ContextMenu.Items>
          {pinLabel ? (
            <Button
              label={pinLabel}
              systemImage={board.isPinned ? 'pin.slash' : 'pin'}
              onPress={() => menu.onTogglePin(board.id)}
            />
          ) : null}
          {pinLabel ? <Divider /> : null}
          <Button
            label={ptBR.folders.deleteBoard}
            systemImage="trash"
            role="destructive"
            onPress={() => menu.onDelete(board.id)}
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <RNHostView>
            <BoardTile
              board={board}
              noteColor={noteColor}
              onOpen={onOpen}
              menu={menu}
              showsPinIcon
            />
          </RNHostView>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

// Host do SwiftUI não aceita className (REGRAS.md, regra 5). Mesma altura do bloco do quadro.
const styles = StyleSheet.create({
  host: { flex: 1, height: 64 },
});
