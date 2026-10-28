import type { LabelColor } from '@/features/card/model/card.types';
import { ptBR } from '@/i18n/pt-BR';

import { Chip } from './Chip';

interface LabelProps {
  name: string;
  color: LabelColor;
}

export function Label({ name, color }: LabelProps) {
  return <Chip label={name} tone={color} accessibilityLabel={ptBR.card.labelA11y(name)} />;
}
