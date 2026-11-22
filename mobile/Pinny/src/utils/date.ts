const LOCALE = 'pt-BR';

// "segunda, 18 de maio" (sem o "-feira", como no Figma).
export function formatWeekdayAndDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' })
    .format(date)
    .replace('-feira', '');
  const dayAndMonth = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(
    date,
  );
  return `${weekday}, ${dayAndMonth}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// "10h" ou "10h30".
export function formatHour(date: Date): string {
  const minutes = date.getMinutes();
  return minutes === 0
    ? `${date.getHours()}h`
    : `${date.getHours()}h${String(minutes).padStart(2, '0')}`;
}

// "17 mai" (mês curto, sem o "de" e sem ponto, como no Figma).
export function formatShortDate(date: Date): string {
  const month = new Intl.DateTimeFormat(LOCALE, { month: 'short' }).format(date).replace('.', '');
  return `${date.getDate()} ${month}`;
}

// "10:00" (como no bloco de prazo do Figma).
export function formatClockTime(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(date);
}

export interface RelativeDayLabels {
  yesterday: string;
  today: string;
  tomorrow: string;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type RelativeDay = keyof RelativeDayLabels;

// Ontem, hoje ou amanhã em relação a now; null nos outros dias.
export function relativeDayOf(date: Date, now: Date): RelativeDay | null {
  if (isSameDay(date, now)) return 'today';
  if (isSameDay(date, addDays(now, 1))) return 'tomorrow';
  if (isSameDay(date, addDays(now, -1))) return 'yesterday';
  return null;
}

// "17 mai"; de outro ano, "17 mai 2025".
export function formatShortDateWithYear(date: Date, now: Date): string {
  const year = date.getFullYear() === now.getFullYear() ? '' : ` ${date.getFullYear()}`;
  return `${formatShortDate(date)}${year}`;
}

// "Hoje, 18 mai", "Amanhã, 19 mai" ou "Sex, 22 mai"; de outro ano, "Sex, 22 mai 2027".
export function formatDayWithDate(date: Date, now: Date, labels: RelativeDayLabels): string {
  const relative = relativeDayOf(date, now);
  const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' })
    .format(date)
    .replace('.', '');
  const day = relative ? labels[relative] : weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${day}, ${formatShortDateWithYear(date, now)}`;
}

// Prazo do cartão: no dia de hoje mostra o horário; nos outros dias, só a data (com o ano se for
// outro).
export function formatDueDate(due: Date, now: Date, todayLabel: (time: string) => string): string {
  return isSameDay(due, now) ? todayLabel(formatHour(due)) : formatShortDateWithYear(due, now);
}
