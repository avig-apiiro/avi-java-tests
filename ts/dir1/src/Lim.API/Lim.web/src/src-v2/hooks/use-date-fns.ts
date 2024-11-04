import {
  format as formatDate,
  formatDistance,
  formatDistanceStrict,
  formatRelative,
} from 'date-fns';

// TODO for better performance we shouldn't convert to Date object inside our components,
//  this should be done within the stores

/**
 * @see https://date-fns.org/v2.26.0/docs/format
 */
export function useFormatDate(date: Date | number | string, format?: string): string {
  return formatDate(date instanceof Date ? date : new Date(date), format);
}

/**
 * @see https://date-fns.org/v2.26.0/docs/formatDistance
 * @see https://date-fns.org/v2.26.0/docs/formatDistanceStrict
 */
export function useDistanceDate(
  date: Date | number | string,
  baseDate?: Date | number | string,
  options?: {
    addSuffix?: boolean;
    unit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
    roundingMethod?: 'floor' | 'ceil' | 'round';
    includeSeconds?: boolean;
    strict?: boolean;
  }
): string {
  return (options?.strict ? formatDistanceStrict : formatDistance)(
    new Date(date),
    baseDate ? new Date(baseDate) : Date.now(),
    options
  );
}

/**
 * @see https://date-fns.org/v2.26.0/docs/formatRelative
 */
export function useRelativeDate(
  date: Date | number | string,
  baseDate?: Date | number | string
): string {
  return formatRelative(new Date(date), baseDate ? new Date(baseDate) : Date.now());
}
