import { Button, Divider } from '@expo/ui/swift-ui';

import { GlassMenu } from '@/components/GlassMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.board.boardMenu;

// "…" do topo do quadro com o menu suspenso nativo do iOS (SwiftUI Menu), em três grupos: o
// conteúdo do quadro, o quadro em si e a exclusão (vermelha, papel destrutivo do sistema).
// Os filtros ficam na linha abaixo do título ("Filtros"), não no menu.
interface BoardMenuProps {
  // "Buscar lembrete": o campo de busca toma o lugar do título (o "…" vira "X").
  onSearch: () => void;
  // "Selecionar": liga o modo de seleção (o "…" vira "Cancelar").
  onSelectCards: () => void;
  // "Renomear quadro": edita o título ali mesmo (o mesmo de tocar no nome).
  onRename: () => void;
  // "Nova coluna": a mesma folha da coluna "Adicionar coluna" no fim do quadro.
  onCreateColumn: () => void;
  // "Arquivados": tela com os cartões arquivados do quadro.
  onOpenArchived: () => void;
  // "Duplicar quadro": cópia logo depois, na mesma pasta (com desfazer).
  onDuplicate: () => void;
  // "Mover quadro": folha nativa com as pastas.
  onMoveToFolder: () => void;
  // "Excluir quadro": alerta de confirmação; ao confirmar, volta e apaga (com desfazer).
  onDelete: () => void;
}

export function BoardMenu({
  onSearch,
  onSelectCards,
  onRename,
  onCreateColumn,
  onOpenArchived,
  onDuplicate,
  onMoveToFolder,
  onDelete,
}: BoardMenuProps) {
  return (
    <GlassMenu accessibilityLabel={ptBR.board.boardOptions}>
      <Button label={text.search} systemImage="magnifyingglass" onPress={onSearch} />
      <Button label={text.selectCards} systemImage="checkmark.circle" onPress={onSelectCards} />
      <Button label={text.newColumn} systemImage="plus" onPress={onCreateColumn} />
      <Button label={text.archived} systemImage="archivebox" onPress={onOpenArchived} />
      <Divider />
      <Button label={text.rename} systemImage="pencil" onPress={onRename} />
      <Button label={text.duplicate} systemImage="plus.square.on.square" onPress={onDuplicate} />
      <Button label={text.moveToFolder} systemImage="folder" onPress={onMoveToFolder} />
      <Divider />
      <Button label={text.delete} systemImage="trash" role="destructive" onPress={onDelete} />
    </GlassMenu>
  );
}

// Para o ScreenHeader: textos da edição do título do quadro.
export const boardRenameLabels = {
  action: ptBR.board.renameBoard,
  hint: ptBR.board.renameBoardHint,
  input: ptBR.board.boardNameLabel,
};
