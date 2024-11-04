import { useCallback, useEffect } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableCounter, TableSearch } from '@src-v2/containers/data-table/table-controls';
import { useOpenDataModelReferencePane } from '@src-v2/containers/entity-pane/use-open-data-model-reference-pane';
import { PRLogsTableColumns } from '@src-v2/containers/pr-logs/pr-logs-table-columns';
import { useInject, useQueryParams, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { PrScanDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { PullRequestScanResponse } from '@src-v2/types/pull-request/pull-request-response';

export const PRLogsTable = () => {
  const { application, pullRequestScan } = useInject();
  const { queryParams, updateQueryParams } = useQueryParams();
  const openPane = useOpenDataModelReferencePane();

  const filterOptions = useSuspense(pullRequestScan.getFilterOptions);

  const dataModel = useDataTable(pullRequestScan.searchPullRequests, {
    columns: PRLogsTableColumns,
  });

  const stopPRScans = useCallback(() => {}, []);

  useEffect(() => {
    if (queryParams?.scanKey) {
      openPane({ scanKey: queryParams?.scanKey } as PrScanDataModelReference, {
        onClose: () => {
          updateQueryParams({
            scanKey: null,
            pane: null,
          });
        },
      });
    }
  }, [queryParams?.scanKey]);

  return (
    <>
      <FluidTableControls>
        <TableSearch namespace={dataModel.namespace} placeholder="Search pull requests..." />
        {application.isFeatureEnabled(FeatureFlag.KillSwitch) && (
          <TableControls.Actions>
            <Button disabled variant={Variant.PRIMARY} size={Size.LARGE} onClick={stopPRScans}>
              Stop PR scans
            </Button>
          </TableControls.Actions>
        )}

        <TableControls.Filters>
          <AsyncBoundary>
            <FiltersControls namespace={dataModel.namespace} filterOptions={filterOptions} />
          </AsyncBoundary>
        </TableControls.Filters>

        <TableControls.Counter>
          <TableCounter dataModel={dataModel} itemName="Pull requests" />
        </TableControls.Counter>
      </FluidTableControls>
      <DataTable dataModel={dataModel}>
        {item => <PrTableItem key={item.key} scan={item} />}
      </DataTable>
    </>
  );
};

const PrTableItem = ({ scan }: { scan: PullRequestScanResponse }) => {
  const { updateQueryParams } = useQueryParams();
  const handleClick = useCallback(() => {
    updateQueryParams({ scanKey: scan.key, pane: 'profile' });
  }, [scan.key]);

  return <DataTable.Row key={scan.key} data={scan} onClick={handleClick} />;
};
