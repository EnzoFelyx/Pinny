import { Pressable, Text } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.board.selection;

// A área de toque chega a 44pt por fora (o texto é pequeno), sem mudar o layout.
const TOUCH_SLOP = { top: 12, bottom: 12, left: 8, right: 8 };

interface ColumnSelectionToggleProps {
  columnTitle: string;
  // Algum cartão da coluna está marcado: o botão vira "Limpar".
  hasSelected: boolean;
  onSelectAll: () => void;
  onClear: () => void;
}

// Ao lado da contagem da coluna, no modo de seleção: "Selecionar todos" marca os cartões à mostra;
// com algum já marcado, vira "Limpar" e desmarca só os desta coluna.
export function ColumnSelectionToggle({
  columnTitle,
  hasSelected,
  onSelectAll,
  onClear,
}: ColumnSelectionToggleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasSelected ? text.clearA11y(columnTitle) : text.selectAllA11y(columnTitle)
      }
      onPress={hasSelected ? onClear : onSelectAll}
      hitSlop={TOUCH_SLOP}
      className="active:opacity-60"
    >
      <Text className="text-center text-tag text-on-secondary">
        {hasSelected ? text.clear : text.selectAll}
      </Text>
    </Pressable>
  );
}
