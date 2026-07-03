export function formatIsoDateToMonthYear(
  value?: string | null,
  locale = 'ru',
): string | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return value;
  }

  const [, year, month] = match;
  const monthIndex = Number(month) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return value;
  }

  const date = new Date(Number(year), monthIndex, 1);
  const monthName = date.toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU', {
    month: 'long',
  });

  return `${monthName} ${year}`;
}
