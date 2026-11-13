import { Button, Divider } from '@expo/ui/swift-ui';

import { GlassMenu } from '@/components/GlassMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;
const cardText = ptBR.folders.folderMenu;

interface FolderMenuProps {
  // Nome, cor e ícone (por enquanto, a folha de renomear), como no "⋮" da Início.
  onCustomize: () => void;
  // Folha "Novo quadro" nesta pasta (o mesmo do "Novo quadro" no fim da grade).
  onCreateBoard: () => void;
  // Modo "Selecionar": escolher quadros para fixar na Início ou excluir.
  onSelect: () => void;
  // "Apagar": alerta de confirmação; ao confirmar, volta para a Início e apaga (com desfazer).
  onDelete: () => void;
}

// "…" do topo da pasta (menu nativo do iOS). Renomear é tocar no nome; fixar a pasta na Início
// fica só no "⋮" da Início.
export function FolderMenu({ onCustomize, onCreateBoard, onSelect, onDelete }: FolderMenuProps) {
  return (
    <GlassMenu accessibilityLabel={text.options}>
      <Button label={text.select} systemImage="checkmark.circle" onPress={onSelect} />
      <Button label={cardText.customize} systemImage="paintpalette" onPress={onCustomize} />
      <Button
        label={cardText.newBoard}
        systemImage="plus.rectangle.on.rectangle"
        onPress={onCreateBoard}
      />
      <Divider />
      <Button label={text.delete} systemImage="trash" role="destructive" onPress={onDelete} />
    </GlassMenu>
  );
}

// Para o ScreenHeader: tocar no título da pasta abre "Personalizar" (leitor de tela).
export const folderTitleLabels = {
  action: text.customize,
  hint: text.customizeHint,
  input: ptBR.folders.folderNameLabel,
};
