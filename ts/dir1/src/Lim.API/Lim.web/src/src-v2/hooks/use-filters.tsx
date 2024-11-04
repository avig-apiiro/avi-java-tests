import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DefaultActiveFiltersDataContext,
  useDefaultActiveFiltersData,
} from '@src-v2/components/filters/default-active-filters-data-context';
import { useGroupProperties } from '@src-v2/hooks/react-helpers/use-group-properties';
import { useQueryParams } from '@src-v2/hooks/use-navigation';
import { StubAny } from '@src-v2/types/stub-any';
import { toArray } from '@src-v2/utils/collection-utils';
import { entries } from '@src-v2/utils/ts-utils';

export interface SortOptions {
  name: string;
  sortDirection: string;
}

interface ActiveSort {
  content: string;
  sortBy: string;
  sortDirection: string;
}

export type Operator = 'And' | 'Or';

export interface FilterOperation {
  key: string;
  value: string | string[];
  checked?: boolean;
  multiple?: boolean;
  operator?: Operator;
  title?: string;
  group?: string;
}

export type ActiveFilterData = { values?: string[]; operator?: Operator };

// 'operator' here is for `In-Category` operator that is being used in
// the old `filters-menu.jsx` in contrast to filter's operator in the type above.
type SingleValueFilterKey = 'searchTerm' | 'group' | 'operator';

export type ActiveFiltersData = Record<SingleValueFilterKey, string> &
  Record<Exclude<string, SingleValueFilterKey>, ActiveFilterData>;

export type UsePlainFiltersReturnValue = {
  initialized: boolean;
  activeFilters: ActiveFiltersData;
  updateFilters: (operations: FilterOperation | FilterOperation[]) => void;
  updateFilterOperator: (key: string, operator: Operator) => void;
  removeFilters: (keys: string | string[]) => void;
  resetFilters: (resetOperations: FilterOperation | FilterOperation[]) => void;
} & Omit<DefaultActiveFiltersDataContext, 'defaultActiveFiltersData'>;

export interface UseFiltersReturnValue extends UsePlainFiltersReturnValue {
  activeSort: ActiveSort;
  updateSort: (sortOptions: SortOptions) => void;
}

export interface FilterOption {
  key: string;
  group?: string;
  title: string;
  value: string;
  groupOrder?: number;
  sentiment?: string;
  description?: string;
  provider?: string;
}

export interface HierarchyFilterOption extends FilterOption {
  hierarchy: { key: string; name: string }[];
}

export interface Filter {
  key: string;
  type: string;
  title: string;
  isGrouped: boolean;
  options: FilterOption[];
  defaultValue?: any;
  defaultValues?: string[];
  isAdditional: boolean;
  defaultOpen?: boolean;
  supportedOperators?: Operator[];
}

export interface FilterSearchData {
  activeOptions: Filter[];
  allOptions: Filter[];
  handleFiltersSearch: (event: StubAny) => any;
  resetFiltersSearch: () => any;
}

/**
 * Provide active filters and utility methods for manging filters in any given mechanism
 */
const usePlainFilters = (
  activeFilters: ActiveFiltersData,
  updateActiveFilters: (
    filters: ActiveFiltersData | ((filters: ActiveFiltersData) => ActiveFiltersData)
  ) => void
): UsePlainFiltersReturnValue => {
  const { defaultActiveFiltersData, initDefaultFilterValues, clearDefaultFilterValues } =
    useDefaultActiveFiltersData();

  /**
   * Update active filters according to given operations
   */
  const updateFilters = (operations: FilterOperation | FilterOperation[]): void => {
    const updatedFilters = toArray(operations).reduce(applyOperation, {
      ...defaultActiveFiltersData,
      ...activeFilters,
    });
    updateActiveFilters(hasValues(updatedFilters) ? updatedFilters : {});
  };

  const updateFilterOperator = (key: string, operator: Operator) => {
    updateActiveFilters(filters => ({
      ...(defaultActiveFiltersData ?? {}),
      ...filters,
      [key]: { ...(filters[key] ?? { values: [] }), operator },
    }));
  };

  /**
   * Disable active filters by key or leave empty to disable all
   */
  const removeFilters = (keys: string | string[]): void => {
    if (keys?.length) {
      const updatedFilters = toArray(keys).reduce(
        (result, key) => Object.assign(result, { [key]: defaultActiveFiltersData?.[key] ?? null }),
        { ...activeFilters }
      );
      updateActiveFilters(() =>
        hasValues(updatedFilters) ? updatedFilters : { searchTerm: undefined }
      );
    } else {
      updateActiveFilters(
        () =>
          ({
            ...defaultActiveFiltersData,
            searchTerm: undefined,
          }) as ActiveFiltersData
      );
    }
  };

  /**
   * Reset active filters to the be equal to reset operations
   */
  const resetFilters = (resetOperations: FilterOperation | FilterOperation[]): void => {
    removeFilters(null);
    updateFilters(resetOperations);
  };

  const initDefaultFilterValuesCallback = useCallback((initialValues: ActiveFiltersData) => {
    initDefaultFilterValues(initialValues);
    updateActiveFilters(activeFilters => ({ ...initialValues, ...activeFilters }));
  }, []);

  return {
    initialized: Boolean(defaultActiveFiltersData),
    activeFilters,
    initDefaultFilterValues: initDefaultFilterValuesCallback,
    clearDefaultFilterValues,
    updateFilters: useCallback(updateFilters, [
      activeFilters,
      defaultActiveFiltersData,
      updateActiveFilters,
    ]),
    updateFilterOperator: useCallback(updateFilterOperator, [
      activeFilters,
      defaultActiveFiltersData,
      updateActiveFilters,
    ]),
    removeFilters: useCallback(removeFilters, [
      activeFilters,
      defaultActiveFiltersData,
      updateActiveFilters,
    ]),
    resetFilters: useCallback(resetFilters, [
      activeFilters,
      defaultActiveFiltersData,
      updateActiveFilters,
    ]),
  };
};

/**
 * Provide active filters as query params and utility methods for manging filters in a given namespace
 */
export const useFilters = (namespace: string = 'fl'): UseFiltersReturnValue => {
  const { queryParams, updateQueryParams } = useQueryParams();
  const [activeSort = {}, filters = {}] = useGroupProperties(
    queryParams[namespace] ?? defaultValue,
    ['sortBy', 'sortDirection']
  );

  const activeQueryFilters = useTransformLegacyFiltersData(filters);

  const updateSort = useCallback(
    (sortOptions: SortOptions) => {
      updateQueryParams({
        [namespace]: {
          ...activeQueryFilters,
          sortBy: sortOptions.name,
          sortDirection: sortOptions.sortDirection,
        },
      });
    },
    [updateQueryParams, namespace, queryParams, activeQueryFilters]
  );

  const plainFiltersResult = usePlainFilters(
    activeQueryFilters,
    useCallback(
      updateFilters => {
        const updatedFiltersValue =
          typeof updateFilters === 'function'
            ? updateFilters(activeQueryFilters)
            : updateFilters ?? {};

        updateQueryParams({
          [namespace]: { ...updatedFiltersValue, ...activeSort },
          page: null,
        });
      },
      [updateQueryParams, namespace, activeSort, activeQueryFilters]
    )
  );

  return {
    ...plainFiltersResult,
    activeSort,
    updateSort,
  };
};

/**
 * Provide active filters stored in local storage
 * @param initialValue
 */
export const useLocalFilters = (
  initialValue: ActiveFiltersData = null
): UsePlainFiltersReturnValue =>
  usePlainFilters(...useState(initialValue ?? (defaultValue as ActiveFiltersData)));

export const useFilterSearch = (baseOptions: Filter[]): FilterSearchData => {
  const [activeOptions, setActiveOptions] = useState(baseOptions);

  useEffect(() => setActiveOptions(baseOptions), [baseOptions]);

  return {
    activeOptions,
    allOptions: baseOptions,
    handleFiltersSearch: useCallback(event => {
      const searchTerm = event.target.value.toLowerCase();
      setActiveOptions(
        searchTerm
          ? baseOptions
              .map(({ options, ...group }) =>
                Object.assign(group, {
                  options: options.filter(option =>
                    option.title.toLowerCase().includes(searchTerm)
                  ),
                })
              )
              .filter(group => group.options.length)
          : baseOptions
      );
    }, []),
    resetFiltersSearch: useCallback(() => setActiveOptions(baseOptions), [baseOptions]),
  };
};

/**
 * Apply operation on given filters
 * @param {ActiveFilters|null} currentFilters
 * @param {FilterOperation} operation
 */
const applyOperation = (
  currentFilters: ActiveFiltersData | null,
  { key, value, checked = true, multiple = false, operator }: FilterOperation
): ActiveFiltersData | null => {
  let updatedFilterValue: string[];

  if (isSingleValueFilterKey(key) && typeof value === 'string') {
    currentFilters[key] = checked ? value : null;
    return currentFilters;
  }

  if (multiple) {
    const currentGroup = currentFilters?.[key]?.values ?? [];
    const stringValue = String(value);
    updatedFilterValue = checked
      ? currentGroup.concat(stringValue).filter(dedupe)
      : currentGroup.filter(item => item !== stringValue);
  } else {
    updatedFilterValue = checked ? toArray(value) : null;
  }

  currentFilters[key] = updatedFilterValue?.length
    ? {
        values: updatedFilterValue,
        operator: operator ?? currentFilters[key]?.operator,
      }
    : null;

  return currentFilters;
};

/**
 * Validate at least one value isn't null
 * @param object filters object
 */
export const hasValues = (object: StubAny): boolean => {
  return Object.values(object).some(value => value !== null);
};

/**
 * Deduplicate array's value, can be used directly with Array.prototype.filter
 * @param item
 * @param index
 * @param list
 */
const dedupe = (item: string, index: number, list: string[]): boolean => {
  return list.indexOf(item) === index;
};

const defaultValue = Object.freeze({});

export function isHierarchyFilterOption(filterOption: any): filterOption is HierarchyFilterOption {
  return filterOption.hasOwnProperty('hierarchy') && Boolean(filterOption.hierarchy?.length);
}

function isSingleValueFilterKey(key: string): key is SingleValueFilterKey {
  return ['searchTerm', 'group', 'operator'].includes(key);
}

function useTransformLegacyFiltersData(filters: Record<string, string[] | ActiveFilterData>) {
  return useMemo(
    () =>
      entries(filters).reduce((query, [filterKey, filterValue]) => {
        let filterData: ActiveFilterData;
        if (_.isArray(filterValue)) {
          const addValue = _.remove(filterValue, value => value === 'And');
          filterData = {
            values: filterValue,
            operator: addValue.length ? 'And' : undefined,
          };
        } else {
          filterData = filterValue;
        }

        return {
          ...query,
          [filterKey]: filterData,
        };
      }, {}) as ActiveFiltersData,
    [filters]
  );
}
