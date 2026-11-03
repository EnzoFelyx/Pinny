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
  // Modo de seleção para escolher os quadros que aparecem na Início.
  onPinBoards: () => void;
}

// "…" do topo da pasta (menu nativo do iOS). Renomear é tocar no nome; fixar a pasta na Início
// fica só no "⋮" da Início. "Excluir pasta" ainda não faz nada: a exclusão (com confirmação e
// desfazer) chega depois.
export function FolderMenu({ onCustomize, onCreateBoard, onPinBoards }: FolderMenuProps) {
  return (
    <GlassMenu accessibilityLabel={text.options}>
      <Button label={cardText.customize} systemImage="paintpalette" onPress={onCustomize} />
      <Button
        label={cardText.newBoard}
        systemImage="plus.rectangle.on.rectangle"
        onPress={onCreateBoard}
      />
      <Button label={text.pinBoards} systemImage="pin.circle" onPress={onPinBoards} />
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
