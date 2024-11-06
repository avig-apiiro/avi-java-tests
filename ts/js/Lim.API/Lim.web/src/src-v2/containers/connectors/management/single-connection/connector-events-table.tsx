import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { eventsTableColumns } from '@src-v2/containers/connectors/management/single-connection/events-table-columns';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableCounter, TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useFilters } from '@src-v2/hooks/use-filters';

export const ConnectorEventsTable = observer(() => {
  const params = useParams<{ key: string }>();
  const { connectors, session } = useInject();
  const {
    activeFilters: { searchTerm, ...filters },
  } = useFilters();

  const filterOptions = useSuspense(connectors.getProviderEventsFilterOptions, {
    providerGroup: params.key,
  });

  const dataModel = useDataTable(connectors.searchProviderEvents, {
    key: `${session?.data?.environmentId}-provider-events`,
    columns: eventsTableColumns,
    searchParams: { filters, providerGroup: params.key },
  });

  return (
    <>
      <CustomFluidTableControls>
        <TableSearch placeholder="Search by event message or details..." />
        <TableControls.Filters>
          <FiltersControls filterOptions={filterOptions} />
        </TableControls.Filters>
        <TableControls.Counter>
          <TableCounter dataModel={dataModel} itemName="events" />
        </TableControls.Counter>
      </CustomFluidTableControls>
      <DataTable dataModel={dataModel}>
        {item => <DataTable.Row key={item.key} data={item} />}
      </DataTable>
      {dataModel.searchState.items.length > 0 && (
        <TablePagination searchState={dataModel.searchState} />
      )}
    </>
  );
});

const CustomFluidTableControls = styled(FluidTableControls)`
  margin-top: 0;

  ${SearchInput} {
    width: 80rem;
    height: 8rem;
  }
`;
