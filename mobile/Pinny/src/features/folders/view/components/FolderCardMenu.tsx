import { Button, Divider } from '@expo/ui/swift-ui';

import { IconMenu } from '@/components/IconMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderMenu;

export interface FolderCardActions {
  // Nome, cor e ícone da pasta (por enquanto, a folha de renomear).
  customize: (folderId: string) => void;
  // Folha "Novo quadro" nesta pasta (o mesmo do "+" depois dos quadros).
  createBoard: (folderId: string) => void;
  // Fixa no topo da Início ou desafixa (se já estiver fixada).
  pin: (folderId: string) => void;
  delete: (folderId: string) => void;
}

interface FolderCardMenuProps {
  folderId: string;
  accessibilityLabel: string;
  isPinned: boolean;
  // "Fixar no topo" ou "Desafixar"; null = sem a opção (já há 3 fixadas).
  pinLabel: string | null;
  actions: FolderCardActions;
}

// "⋮" do card da pasta na Início (menu nativo do iOS): Personalizar, Novo quadro, Fixar no topo
// e Apagar (vermelho, papel destrutivo do sistema, separado das outras).
export function FolderCardMenu({
  folderId,
  accessibilityLabel,
  isPinned,
  pinLabel,
  actions,
}: FolderCardMenuProps) {
  return (
    <IconMenu accessibilityLabel={accessibilityLabel} isVertical>
      <Button
        label={text.customize}
        systemImage="paintpalette"
        onPress={() => actions.customize(folderId)}
      />
      <Button
        label={text.newBoard}
        systemImage="plus.rectangle.on.rectangle"
        onPress={() => actions.createBoard(folderId)}
      />
      {pinLabel ? (
        <Button
          label={pinLabel}
          systemImage={isPinned ? 'pin.slash' : 'pin'}
          onPress={() => actions.pin(folderId)}
        />
      ) : null}
      <Divider />
      <Button
        label={text.delete}
        systemImage="trash"
        role="destructive"
        onPress={() => actions.delete(folderId)}
      />
    </IconMenu>
  );
}
