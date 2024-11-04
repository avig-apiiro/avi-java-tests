import { useEffect } from 'react';
import { getDefaultFilterValueData } from '@src-v2/components/filters/filter-utils';
import { PlainFiltersControls } from '@src-v2/components/filters/inline-control/containers/plain-filter-controls';
import { Filter, useFilters } from '@src-v2/hooks/use-filters';

interface FiltersControlsProps {
  filterOptions: Filter[];
  namespace?: string;
}

export const FiltersControls = ({ filterOptions, namespace = 'fl' }: FiltersControlsProps) => {
  const filters = useFilters(namespace);

  useEffect(() => {
    filters.initDefaultFilterValues(getDefaultFilterValueData(filterOptions));

    return filters.clearDefaultFilterValues;
  }, [filters.initDefaultFilterValues, filterOptions]);

  return <PlainFiltersControls filters={filterOptions} filtersData={filters} />;
};
