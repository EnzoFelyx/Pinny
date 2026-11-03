import { Button, Divider } from '@expo/ui/swift-ui';

import { GlassMenu } from '@/components/GlassMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.board.boardMenu;
function noop() {}

// "…" do topo do quadro com o menu suspenso nativo do iOS (SwiftUI Menu), em três grupos: o
// conteúdo do quadro, o quadro em si e a exclusão (vermelha, papel destrutivo do sistema).
// Por enquanto só "Renomear quadro" funciona; as outras opções ainda não fazem nada. Os filtros
// ficam na linha abaixo do título ("Filtros"), não no menu.
interface BoardMenuProps {
  // "Renomear quadro": edita o título ali mesmo (o mesmo de tocar no nome).
  onRename: () => void;
}

export function BoardMenu({ onRename }: BoardMenuProps) {
  return (
    <GlassMenu accessibilityLabel={ptBR.board.boardOptions}>
      <Button label={text.search} systemImage="magnifyingglass" onPress={noop} />
      <Button label={text.selectCards} systemImage="checkmark.circle" onPress={noop} />
      <Button label={text.newColumn} systemImage="plus" onPress={noop} />
      <Button label={text.reorderColumns} systemImage="arrow.up.arrow.down" onPress={noop} />
      <Divider />
      <Button label={text.rename} systemImage="pencil" onPress={onRename} />
      <Button label={text.duplicate} systemImage="plus.square.on.square" onPress={noop} />
      <Button label={text.moveToFolder} systemImage="folder" onPress={noop} />
      <Divider />
      <Button label={text.delete} systemImage="trash" role="destructive" onPress={noop} />
    </GlassMenu>
  );
}

// Para o ScreenHeader: textos da edição do título do quadro e o menu com o "Renomear quadro".
export const boardRenameLabels = {
  action: ptBR.board.renameBoard,
  hint: ptBR.board.renameBoardHint,
  input: ptBR.board.boardNameLabel,
};

export function renderBoardMenu(startRename: () => void) {
  return <BoardMenu onRename={startRename} />;
}
