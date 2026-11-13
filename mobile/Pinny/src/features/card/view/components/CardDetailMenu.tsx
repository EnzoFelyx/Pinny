import { Button, Divider } from '@expo/ui/swift-ui';

import { IconMenu } from '@/components/IconMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.card.detail;

interface CardDetailMenuProps {
  onMove: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

// "…" da folha do cartão (menu nativo do iOS): Mover para…, Arquivar e, separado e em vermelho,
// Apagar.
export function CardDetailMenu({ onMove, onArchive, onDelete }: CardDetailMenuProps) {
  return (
    <IconMenu accessibilityLabel={text.options}>
      <Button label={text.menu.move} systemImage="arrow.right.square" onPress={onMove} />
      <Button label={text.menu.archive} systemImage="archivebox" onPress={onArchive} />
      <Divider />
      <Button label={text.menu.delete} systemImage="trash" role="destructive" onPress={onDelete} />
    </IconMenu>
  );
}
