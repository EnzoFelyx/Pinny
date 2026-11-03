import { Button, Divider } from '@expo/ui/swift-ui';

import { GlassMenu } from '@/components/GlassMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;
const cardText = ptBR.folders.folderMenu;

function noop() {}

interface FolderMenuProps {
  // Nome, cor e ícone (por enquanto, a folha de renomear), como no "⋮" da Início.
  onCustomize: () => void;
  // Folha "Novo quadro" nesta pasta (o mesmo do "Novo quadro" no fim da grade).
  onCreateBoard: () => void;
  onPin: () => void;
}

// "…" do topo da pasta (menu nativo do iOS), com as mesmas opções do "⋮" da Início. Renomear é
// tocar no nome. "Fixar no topo" e "Excluir pasta" ainda não fazem nada: a exclusão (com
// confirmação e desfazer) chega depois.
export function FolderMenu({ onCustomize, onCreateBoard, onPin }: FolderMenuProps) {
  return (
    <GlassMenu accessibilityLabel={text.options}>
      <Button label={cardText.customize} systemImage="paintpalette" onPress={onCustomize} />
      <Button
        label={cardText.newBoard}
        systemImage="plus.rectangle.on.rectangle"
        onPress={onCreateBoard}
      />
      <Button label={cardText.pin} systemImage="pin" onPress={onPin} />
      <Divider />
      <Button label={text.delete} systemImage="trash" role="destructive" onPress={noop} />
    </GlassMenu>
  );
}

// Para o ScreenHeader: tocar no título da pasta abre "Personalizar" (leitor de tela).
export const folderTitleLabels = {
  action: text.customize,
  hint: text.customizeHint,
  input: ptBR.folders.folderNameLabel,
};
