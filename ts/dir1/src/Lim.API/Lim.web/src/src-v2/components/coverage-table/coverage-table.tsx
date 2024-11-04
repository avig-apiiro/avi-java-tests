import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { ExplainIconsPopover } from '@src-v2/components/coverage-table/coverage-tooltips';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { BaseIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import {
  SelectedCount,
  TableConditionalActions,
  TableCounter,
  TableSearch,
} from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useInject, useLoading, useSuspense } from '@src-v2/hooks';
import { formatNumber } from '@src-v2/utils/number-utils';

export const CoverageTable = observer(({ dataModel, handleExport, loading, ...props }) => {
  const { coverage } = useInject();
  const filterGroups = useSuspense(coverage.getFilterOptions);

  const [handleBulkExport, exportLoading] = useLoading(async () => {
    const repositoryKeys = dataModel.selection.map(selected => selected.key);
    await coverage.exportCoverageSelection(repositoryKeys);
  }, [dataModel.selection]);

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Coverage Table' }}>
      <FluidTableControls>
        <TableSearch placeholder="Search by repository name" />
        <ExportInfoContainer>
          <Button
            startIcon="Export"
            variant={Variant.PRIMARY}
            loading={loading}
            onClick={handleExport}>
            Export
          </Button>
          <ExplainIconsPopover />
        </ExportInfoContainer>
        <TableControls.Filters>
          <FiltersControls filterOptions={filterGroups} />
        </TableControls.Filters>
        <TableControls.Counter>
          <TableCounter dataModel={dataModel} itemName="repositories" />
        </TableControls.Counter>
      </FluidTableControls>

      <TableConditionalActions shouldDisplay={dataModel.selection.length > 0}>
        <SelectedCount>{formatNumber(dataModel.selection.length)} Selected </SelectedCount>
        <Button
          startIcon="Export"
          variant={Variant.PRIMARY}
          loading={exportLoading}
          onClick={handleBulkExport}>
          Export
        </Button>
      </TableConditionalActions>
      <DataTableContainer {...props} dataModel={dataModel}>
        {item => <DataTable.Row key={item.key} data={item} />}
      </DataTableContainer>

      {dataModel.searchState.items.length > 0 && (
        <TablePagination searchState={dataModel.searchState} />
      )}
    </AnalyticsLayer>
  );
});

const DataTableContainer = styled(DataTable)`
  ${Table.Header} > ${BaseIcon} {
    margin: 0 auto;
  }
`;

const ExportInfoContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
`;
