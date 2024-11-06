import { addMonths, differenceInDays, differenceInMonths, format, parseISO } from 'date-fns';

type OptionalDate = Date | string | number;

export function isValidDate(date: OptionalDate) {
  return (
    (date instanceof Date || typeof date === 'string' || typeof date === 'number') &&
    !isNaN(new Date(date)?.getTime())
  );
}

export function formatDate(
  date: OptionalDate,
  timeframe?: 'quarterly' | 'weekly' | 'daily'
): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  switch (timeframe) {
    case 'quarterly':
      return format(date, 'QQQ yyyy');
    case 'weekly':
      return format(date, 'MMM d');
    case 'daily':
      return format(date, 'MMMM dd, yyyy');
    default:
      return date.toLocaleDateString();
  }
}

export function formatDateRange(fromDate: OptionalDate, toDate: OptionalDate) {
  fromDate = fromDate instanceof Date ? fromDate : new Date(fromDate);
  toDate = toDate instanceof Date ? toDate : new Date(toDate);

  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // @ts-expect-error
    }).formatRange(fromDate, toDate);
  } catch (exception) {
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  }
}

export function sortDates(from: OptionalDate, to: OptionalDate) {
  const dates = [new Date(from), new Date(to)].sort(
    (last, current) => last.getTime() - current.getTime()
  );
  // make slight change to validate dates are not equal
  dates[1].setHours(23, 59, 59, 999);
  return dates;
}

export function isEmptyDate(date: OptionalDate): boolean {
  return new Date(date).getFullYear() <= 1;
}

export const calculateTimeDifference = (date: string): string => {
  const discoveredDate = parseISO(date);
  const today = new Date();

  const totalDays = differenceInDays(today, discoveredDate);

  if (totalDays === 0) {
    return '';
  }
  if (totalDays < 30) {
    return `(${totalDays} day${totalDays !== 1 ? 's' : ''} ago)`;
  }
  if (totalDays >= 30 && totalDays < 365) {
    const months = differenceInMonths(today, discoveredDate);
    const remainingDays = differenceInDays(today, addMonths(discoveredDate, months));
    return `(${months} month${months !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''} ago)`;
  }
  return '(Over a year)';
};
