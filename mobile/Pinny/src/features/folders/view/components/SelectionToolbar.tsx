import { Pin, PinOff, Trash2 } from 'lucide-react-native';

import { GlassToolbar } from '@/components/GlassToolbar';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

interface SelectionToolbarProps {
  // null = sem fixar/desafixar para a seleção atual (passaria de 3 fixados). isEnabled = false:
  // nada marcado, o alfinete aparece apagado.
  pin: { accessibilityLabel: string; isUnpin: boolean; isEnabled: boolean } | null;
  canDelete: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}

// Botões de vidro flutuando embaixo da tela da pasta no modo "Selecionar": fixar (ou desafixar,
// alfinete riscado) à esquerda e apagar (lixeira vermelha) à direita. Sem seleção, continuam
// visíveis e apagados, como no quadro e nos apps da Apple.
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
              disabled: !pin.isEnabled,
            }
          : null,
        {
          key: 'delete',
          icon: Trash2,
          tone: 'destructive',
          accessibilityLabel: text.deleteSelectedA11y,
          onPress: onDelete,
          disabled: !canDelete,
        },
      ]}
    />
  );
}
