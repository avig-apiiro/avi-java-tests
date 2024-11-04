import { parseISO } from 'date-fns';
import { OptionalDate } from '@src-v2/components/time';
import { SORT } from '@src-v2/containers/data-table/table-header-controls';

export function defaultSorter(firstValue: any, secondValue: any, sortDirection: string): number {
  if (firstValue < secondValue) {
    return sortDirection === SORT.ASC ? -1 : 1;
  }
  if (firstValue > secondValue) {
    return sortDirection === SORT.ASC ? 1 : -1;
  }
  return 0;
}

export function alphabeticalSorter(firstValue: string, secondValue: string): number {
  const firstLower = firstValue?.toString().toLowerCase();
  const secondLower = secondValue?.toString().toLowerCase();

  if (firstLower < secondLower) {
    return -1;
  }
  if (firstLower > secondLower) {
    return 1;
  }
  return 0;
}

export function dateSorter(a: OptionalDate, b: OptionalDate) {
  const dateA = parseISO(a?.toString());
  const dateB = parseISO(b?.toString());
  return dateA.getTime() - dateB.getTime();
}
