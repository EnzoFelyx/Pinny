import { Check, Clock3, type LucideIcon } from 'lucide-react-native';

import type { DeadlineStatus, LabelColor } from '@/features/card/model/card.types';

import { Chip, type ChipEmphasis } from './Chip';

export interface CardDeadline {
  // Texto pronto do ViewModel, sempre com o estado escrito (ex.: "17 mai · Atrasado").
  text: string;
  status: DeadlineStatus;
}

// Prazo visual (CLAUDE.md, seção 5.3): cor e ícone pelo estado, sempre com o texto escrito, para
// não depender só da cor. Nada de vermelho agressivo: o atrasado usa o pêssego.
export const deadlineStyle: Record<
  DeadlineStatus,
  { tone: LabelColor; icon: LucideIcon; emphasis: ChipEmphasis }
> = {
  normal: { tone: 'babyBlue', icon: Clock3, emphasis: 'default' },
  soon: { tone: 'butter', icon: Clock3, emphasis: 'default' },
  overdue: { tone: 'peach', icon: Clock3, emphasis: 'alert' },
  done: { tone: 'mint', icon: Check, emphasis: 'default' },
};

interface DeadlineChipProps {
  deadline: CardDeadline;
}

// Chip do prazo do cartão (no quadro e no detalhe).
export function DeadlineChip({ deadline }: DeadlineChipProps) {
  return <Chip label={deadline.text} {...deadlineStyle[deadline.status]} />;
}
