const RUSSIAN_MONTHS = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
] as const;

export function formatIsoDateToMonthYear(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return value;
  }

  const [, year, month] = match;
  const monthIndex = Number(month) - 1;

  if (monthIndex < 0 || monthIndex >= RUSSIAN_MONTHS.length) {
    return value;
  }

  return `${RUSSIAN_MONTHS[monthIndex]} ${year}`;
}
