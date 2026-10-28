import { Flag } from 'lucide-react-native';

import type { LabelColor, Priority } from '@/features/card/model/card.types';
import { ptBR } from '@/i18n/pt-BR';

import { Chip, type ChipEmphasis } from './Chip';

interface PriorityChipProps {
  priority: Priority;
}

// Prioridade nunca depende só da cor: sempre tem a bandeira e o texto.
const priorityStyle: Record<Priority, { tone: LabelColor; emphasis: ChipEmphasis }> = {
  low: { tone: 'mint', emphasis: 'default' },
  medium: { tone: 'butter', emphasis: 'default' },
  high: { tone: 'peach', emphasis: 'alert' },
};

export function PriorityChip({ priority }: PriorityChipProps) {
  const { tone, emphasis } = priorityStyle[priority];

  return (
    <Chip
      label={ptBR.card.priority[priority]}
      tone={tone}
      emphasis={emphasis}
      icon={Flag}
      accessibilityLabel={ptBR.card.priorityA11y[priority]}
    />
  );
}
