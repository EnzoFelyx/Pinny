import { Button, Divider } from '@expo/ui/swift-ui';

import { GlassMenu } from '@/components/GlassMenu';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.card.detail;

interface CardDetailMenuProps {
  onMove: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

// "…" do topo da tela do cartão (vidro, como o do quadro; menu nativo do iOS): Mover para…, Arquivar e, separado e em vermelho,
// Apagar.
export function CardDetailMenu({ onMove, onArchive, onDelete }: CardDetailMenuProps) {
  return (
    <GlassMenu accessibilityLabel={text.options}>
      <Button label={text.menu.move} systemImage="arrow.right.square" onPress={onMove} />
      <Button label={text.menu.archive} systemImage="archivebox" onPress={onArchive} />
      <Divider />
      <Button label={text.menu.delete} systemImage="trash" role="destructive" onPress={onDelete} />
    </GlassMenu>
  );
}
