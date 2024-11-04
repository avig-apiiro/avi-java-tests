import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { OperatorData } from '@src-v2/components/filters/inline-control/components/filter-select';
import {
  ActiveFiltersData,
  Filter,
  Operator,
  UseFiltersReturnValue,
} from '@src-v2/hooks/use-filters';

interface MoreFiltersProps {
  filters: Filter[];
  activeFilters: ActiveFiltersData;
}

export const useMoreFilters = ({ filters, activeFilters }: MoreFiltersProps) => {
  const customFilterOptions = [
    ...filters.filter(filter => !filter.isAdditional),
    ...filters.filter(
      filter => filter.isAdditional && Object.keys(activeFilters).includes(filter.key)
    ),
  ];

  const customCurrentMoreFilters =
    filters?.filter(
      filter => filter.isAdditional && !Object.keys(activeFilters).includes(filter.key)
    ) ?? [];

  const [currentMoreFilters, setCurrentMoreFilters] = useState(customCurrentMoreFilters);
  const [currentFilterOptions, setCurrentFilterOptions] = useState(customFilterOptions);

  const hasDefaultMoreFilters = filters.some(filter => filter.isAdditional);

  const handleAddFilter = useCallback(
    (filter: Filter, defaultOpen = true) => {
      setCurrentMoreFilters(moreFilters => moreFilters.filter(hidden => hidden.key !== filter.key));
      setCurrentFilterOptions(filterOptions => [
        ...filterOptions.map(current => ({
          ...current,
          defaultOpen: false,
        })),
        { ...filter, defaultOpen },
      ]);
    },
    [setCurrentMoreFilters, setCurrentFilterOptions]
  );

  const handleRemoveFilter = useCallback(
    (filter: Filter) => {
      setCurrentMoreFilters(moreFilters => [
        ...moreFilters,
        filters.find(option => option.key === filter.key),
      ]);
      setCurrentFilterOptions(filterOptions =>
        filterOptions.filter(({ key }) => filter.key !== key)
      );
    },
    [setCurrentMoreFilters, setCurrentFilterOptions]
  );

  useEffect(() => {
    const activeKeys = Object.keys(activeFilters ?? {});
    const moreFiltersByKey = _.keyBy(currentMoreFilters, 'key');
    const shouldAddedFilters = activeKeys.map(key => moreFiltersByKey[key]).filter(Boolean);
    shouldAddedFilters.forEach(filter => handleAddFilter(filter, false));
  }, [activeFilters, currentMoreFilters, handleAddFilter]);

  return {
    currentFilterOptions,
    currentMoreFilters,
    handleAddFilter,
    handleRemoveFilter,
    hasDefaultMoreFilters,
  };
};

export const useFilterOperatorsData = (
  filter: Filter,
  activeValues: ActiveFiltersData,
  onChange: UseFiltersReturnValue['updateFilterOperator']
): OperatorData | undefined => {
  const handleChange = useCallback(
    (operator: Operator) => {
      onChange(filter.key, operator);
    },
    [filter, onChange]
  );

  const operator = activeValues[filter.key]?.operator;

  return filter.supportedOperators?.length >= 2
    ? {
        supportedOperators: filter.supportedOperators,
        activeOperator: operator ? (_.upperFirst(operator) as Operator) : 'Or',
        onChange: handleChange,
      }
    : undefined;
};
