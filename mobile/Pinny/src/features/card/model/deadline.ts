import { DEADLINE_SOON_HOURS } from '@/constants/limits';

import type { Card } from './card.schema';
import type { DeadlineStatus } from './card.types';

const MS_PER_HOUR = 60 * 60 * 1000;

// Estado do prazo do cartão (seção 5.3 do CLAUDE.md). null = cartão sem prazo e não concluído.
export function getDeadlineStatus(
  card: Pick<Card, 'dueAt' | 'completedAt'>,
  now: Date,
): DeadlineStatus | null {
  if (card.completedAt) return 'done';
  if (!card.dueAt) return null;

  const dueTime = Date.parse(card.dueAt);
  if (Number.isNaN(dueTime)) return null;

  const remaining = dueTime - now.getTime();
  if (remaining < 0) return 'overdue';
  return remaining <= DEADLINE_SOON_HOURS * MS_PER_HOUR ? 'soon' : 'normal';
}
