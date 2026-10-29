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
