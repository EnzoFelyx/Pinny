import { CalendarClock, CalendarPlus, Pencil } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { labelInkColor, labelToneClass } from '@/components/Chip';
import { deadlineStyle } from '@/components/DeadlineChip';
import type { DeadlineStatus } from '@/features/card/model/card.types';
import { colors } from '@/theme';

const ICON_SIZE = 22;
const EDIT_ICON_SIZE = 18;

export interface DueDateBlockValue {
  // "Hoje, 18 mai · 10:00", pronto do ViewModel.
  text: string;
  accessibilityLabel: string;
  // Fundo pelo estado do prazo (o mesmo tom do chip): o texto escrito do estado fica no chip.
  status: DeadlineStatus;
}

interface DueDateBlockProps {
  value: DueDateBlockValue | null;
  addLabel: string;
  editHint: string;
  onPress: () => void;
}

// Bloco do prazo no detalhe do cartão (Figma "Cartão · Proposta para a Marina"): calendário,
// data e horário e o lápis, no tom do estado do prazo. Sem prazo, vira "Adicionar data e horário".
// Tocar abre a folha "Data e horário".
export function DueDateBlock({ value, addLabel, editHint, onPress }: DueDateBlockProps) {
  if (!value) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-[18px] bg-column-background px-4 py-4 active:opacity-60"
      >
        <CalendarPlus size={ICON_SIZE} color={colors.textSecondary} />
        <Text className="flex-1 text-card-title text-text-secondary">{addLabel}</Text>
      </Pressable>
    );
  }

  const { tone } = deadlineStyle[value.status];
  const ink = labelInkColor[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value.accessibilityLabel}
      accessibilityHint={editHint}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-[18px] px-4 py-4 active:opacity-60 ${labelToneClass[tone]}`}
    >
      <CalendarClock size={ICON_SIZE} color={ink} />
      <Text className="flex-1 text-card-title text-text-primary">{value.text}</Text>
      <Pencil size={EDIT_ICON_SIZE} color={ink} />
    </Pressable>
  );
}
