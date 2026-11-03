import { Button, Divider } from '@expo/ui/swift-ui';

import { GlassMenu } from '@/components/GlassMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

function noop() {}

interface FolderMenuProps {
  // "Renomear pasta": edita o título ali mesmo (o mesmo de tocar no nome).
  onRename: () => void;
}

// "…" do topo da pasta (menu nativo do iOS). "Excluir pasta" ainda não faz nada: a exclusão
// (com confirmação e desfazer) chega depois.
export function FolderMenu({ onRename }: FolderMenuProps) {
  return (
    <GlassMenu accessibilityLabel={text.options}>
      <Button label={text.rename} systemImage="pencil" onPress={onRename} />
      <Divider />
      <Button label={text.delete} systemImage="trash" role="destructive" onPress={noop} />
    </GlassMenu>
  );
}

// Para o ScreenHeader: textos da edição do título da pasta e o menu com o "Renomear pasta".
export const folderRenameLabels = {
  action: text.rename,
  hint: text.renameHint,
  input: ptBR.folders.folderNameLabel,
};

export function renderFolderMenu(startRename: () => void) {
  return <FolderMenu onRename={startRename} />;
}
