import { DEADLINE_SOON_HOURS, DEFAULT_DUE_HOUR } from '@/constants/limits';

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

// Data que a folha "Data e horário" mostra: o prazo do cartão ou, sem prazo, amanhã às
// DEFAULT_DUE_HOUR (hora cheia, no fuso do aparelho).
export function initialDueDate(dueAt: string | null, now: Date): Date {
  const current = dueAt ? Date.parse(dueAt) : Number.NaN;
  if (!Number.isNaN(current)) return new Date(current);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(DEFAULT_DUE_HOUR, 0, 0, 0);
  return tomorrow;
}
