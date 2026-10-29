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

// Prazo do cartão: no dia de hoje mostra o horário; nos outros dias, só a data.
export function formatDueDate(due: Date, now: Date, todayLabel: (time: string) => string): string {
  return isSameDay(due, now) ? todayLabel(formatHour(due)) : formatShortDate(due);
}
