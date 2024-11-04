import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import {
  SortOption,
  SortOptionsSelect,
} from '@src-v2/components/persistent-search-state/sort-options-select';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Filter, useFilters } from '@src-v2/hooks/use-filters';
import { abbreviate, formatNumber } from '@src-v2/utils/number-utils';

type PersistentSearchFiltersProps = {
  searchCounters: {
    count: number;
    total: number;
  };
  filterOptions: Filter[];
  sortOptions?: SortOption[];
  itemTypeDisplayName: { singular: string; plural: string } | string;
  actions?: ReactNode;
};

export const PersistentSearchFilters = ({
  searchCounters,
  filterOptions,
  sortOptions,
  itemTypeDisplayName,
  actions,
}: PersistentSearchFiltersProps) => {
  const itemDisplayName = useMemo(() => {
    return typeof itemTypeDisplayName === 'string'
      ? {
          singular: itemTypeDisplayName,
          plural: `${itemTypeDisplayName}s`,
        }
      : itemTypeDisplayName;
  }, [itemTypeDisplayName]);

  const { activeFilters } = useFilters();

  return (
    <FluidTableControls>
      <SearchFilterInput
        defaultValue={activeFilters?.searchTerm}
        placeholder={`Search by ${itemDisplayName.singular} name...`}
      />

      {actions && <TableControls.Actions>{actions}</TableControls.Actions>}

      <TableControls.Filters>
        <FiltersControls filterOptions={filterOptions} />
      </TableControls.Filters>
      <TableControls.Counter>
        <ResultsCounter
          count={searchCounters.count}
          total={searchCounters.total}
          itemName={itemDisplayName.plural}
        />
        {Boolean(sortOptions?.length) && <SortOptionsSelect sortOptions={sortOptions} />}
      </TableControls.Counter>
    </FluidTableControls>
  );
};

export const ResultsCounter = ({
  count,
  total,
  itemName = 'results',
}: {
  count: number;
  total: number;
  itemName: string;
}) => {
  return (
    <ResultsCounterContainer>
      {count === total
        ? `${abbreviate(count)} ${itemName}`
        : `${formatNumber(count)} out of ${abbreviate(total)} ${itemName} `}
    </ResultsCounterContainer>
  );
};

const ResultsCounterContainer = styled.span`
  font-size: var(--font-size-s);
`;
