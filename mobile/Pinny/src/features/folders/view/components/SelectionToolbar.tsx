import { Pin, PinOff, Trash2 } from 'lucide-react-native';

import { GlassToolbar } from '@/components/GlassToolbar';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

interface SelectionToolbarProps {
  // null = sem fixar/desafixar para a seleção atual (ex.: passaria de 3 fixados).
  pin: { accessibilityLabel: string; isUnpin: boolean } | null;
  canDelete: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}

// Botões de vidro flutuando embaixo da tela da pasta no modo "Selecionar": fixar (ou desafixar,
// alfinete riscado) à esquerda e apagar (lixeira vermelha) à direita. Cada um só aparece quando
// a ação vale para a seleção.
export function SelectionToolbar({ pin, canDelete, onTogglePin, onDelete }: SelectionToolbarProps) {
  return (
    <GlassToolbar
      actions={[
        pin
          ? {
              key: 'pin',
              icon: pin.isUnpin ? PinOff : Pin,
              tone: 'accent',
              accessibilityLabel: pin.accessibilityLabel,
              onPress: onTogglePin,
            }
          : null,
        canDelete
          ? {
              key: 'delete',
              icon: Trash2,
              tone: 'destructive',
              accessibilityLabel: text.deleteSelectedA11y,
              onPress: onDelete,
            }
          : null,
      ]}
    />
  );
}
