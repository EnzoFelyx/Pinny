import { ptBR } from '@/i18n/pt-BR';
import { formatClockTime, formatDayWithDate } from '@/utils/date';

const text = ptBR.card.detail;

export interface DueDateParts {
  // "Hoje, 18 mai", "Amanhã, 19 mai" ou "Sex, 22 mai".
  day: string;
  // "10:00".
  time: string;
}

// Partes do prazo do cartão, como no bloco do Figma.
export function dueDateParts(due: Date, now: Date): DueDateParts {
  return { day: formatDayWithDate(due, now, text.relativeDays), time: formatClockTime(due) };
}

// "Hoje, 18 mai · 10:00".
export function formatDueDate(due: Date, now: Date): string {
  const { day, time } = dueDateParts(due, now);
  return text.dueValue(day, time);
}
