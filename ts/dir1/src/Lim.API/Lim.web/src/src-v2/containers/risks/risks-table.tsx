import { IObjectDidChange } from 'mobx';
import { observer } from 'mobx-react';
import { ReactNode, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  AnalyticsLayer,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import {
  SelectedCount,
  TableConditionalActions,
  TableCounter,
  TableSearch,
} from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useRiskTypeToPane } from '@src-v2/containers/entity-pane/use-risk-type-to-pane';
import {
  RiskLevelBulkChange,
  RiskStatusBulkChange,
  TakeBulkActions,
} from '@src-v2/containers/risks/risks-bulk-actions';
import {
  RisksContext,
  TableRiskType,
  useRisksContext,
} from '@src-v2/containers/risks/risks-context';
import { RisksFilterControls } from '@src-v2/containers/risks/risks-filter-controls';
import { GroupingMenu } from '@src-v2/containers/risks/risks-grouping';
import { useInject, useLoading, useQueryParams } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { DataTable as DataTableModel } from '@src-v2/models/data-table';
import { FiltersOptionsParams } from '@src-v2/services';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { modify } from '@src-v2/utils/mobx-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

interface RisksTableProps<TRisk extends RiskTriggerSummaryResponse> {
  dataModel: DataTableModel<TRisk, 0>;
  actions?: ReactNode;
  hideExport?: boolean;
  filterOptionsFetcherParams?: FiltersOptionsParams;
}

export const RisksTable = observer(
  <TRisk extends RiskTriggerSummaryResponse>({
    dataModel,
    filterOptionsFetcherParams,
    actions = null,
    hideExport = false,
  }: RisksTableProps<TRisk>) => {
    const { pathname } = useLocation();
    const { activeFilters } = useFilters(dataModel.namespace);
    const { risksService, title, tableRiskType } = useRisksContext();

    const [handleExport, exportLoading] = useLoading(
      async () => await risksService.exportRisks(activeFilters),
      [activeFilters]
    );

    const [handleBulkExport, bulkExportLoading] = useLoading(
      async () => await risksService.bulkExportRisks(dataModel.selection),
      [dataModel.selection.length]
    );

    const isRisksPath = pathname.split('/').includes('risks');

    return (
      <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: title ?? 'All Risks' }}>
        <FluidTableControls>
          <TableSearch namespace={dataModel.namespace} placeholder="Search risks..." />
          <TableControls.Actions>
            {/* show groupBy menu only in all risks and solutions pages*/}
            {(isRisksPath || tableRiskType === TableRiskType.Secrets) && <GroupingMenu />}
            {actions}
            {!hideExport && tableRiskType !== TableRiskType.ArtifactDependencyFindings && (
              <Button
                startIcon="Export"
                variant={Variant.PRIMARY}
                loading={exportLoading}
                disabled={dataModel.selection.length > 0}
                onClick={handleExport}
                size={Size.LARGE}>
                Export
              </Button>
            )}
          </TableControls.Actions>

          <TableControls.Filters>
            <AsyncBoundary>
              <RisksFilterControls
                params={filterOptionsFetcherParams}
                namespace={dataModel.namespace}
              />
            </AsyncBoundary>
          </TableControls.Filters>

          <TableControls.Counter>
            <TableCounter dataModel={dataModel} itemName="risks" />
          </TableControls.Counter>
        </FluidTableControls>

        <TableConditionalActions shouldDisplay={dataModel.selection.length > 0}>
          <SelectedCount>{formatNumber(dataModel.selection.length)} Selected</SelectedCount>
          <Button
            startIcon="Export"
            variant={Variant.SECONDARY}
            loading={bulkExportLoading}
            onClick={handleBulkExport}>
            Export
          </Button>
          <AnalyticsLayer
            analyticsData={{
              [AnalyticsDataField.NumberOfRisks]: dataModel.selection?.length?.toString(),
            }}>
            <RiskStatusBulkChange dataModel={dataModel} />
            <RiskLevelBulkChange dataModel={dataModel} />
            <TakeBulkActions dataModel={dataModel} />
          </AnalyticsLayer>
        </TableConditionalActions>

        <RiskDataTable dataModel={dataModel} expandable>
          {item => (
            <AnalyticsLayer
              key={item.key}
              analyticsData={{
                [AnalyticsDataField.RiskLevel]: item.riskLevel,
                [AnalyticsDataField.RuleName]: item.ruleName,
                [AnalyticsDataField.RiskCategory]: item.riskCategory,
              }}>
              <RiskTableRow item={item} />
            </AnalyticsLayer>
          )}
        </RiskDataTable>

        <RiskPaneListener dataModel={dataModel} />

        {!dataModel.ignorePagination && dataModel.searchState.items.length > 0 && (
          <TablePagination searchState={dataModel.searchState} itemName="risks" />
        )}
      </AnalyticsLayer>
    );
  }
);

function RiskTableRow({ item }: { item: StubAny }) {
  const { queryParams, updateQueryParams } = useQueryParams();
  const trackAnalytics = useTrackAnalytics();

  return (
    <DataTable.Row
      key={item.key}
      data={item}
      data-selected={dataAttr(queryParams.trigger === item.key)}
      onClick={() => {
        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'Open Risk Pane',
        });
        updateQueryParams({ trigger: item.key });
      }}
    />
  );
}

export const RiskPaneListener = observer(
  ({ dataModel }: { dataModel: DataTableModel<RiskTriggerSummaryResponse, StubAny> }): null => {
    useOpenRiskPane({ dataModel });
    return null;
  }
);

export const RiskDataTable = styled(DataTable)`
  ${Table.Body} ${Table.Row} {
    height: 14rem;
  }

  ${Table.Cell}:last-child {
    padding-right: 2rem;
  }
` as typeof DataTable;

export const useOpenRiskPane = ({
  dataModel,
}: {
  dataModel: DataTableModel<RiskTriggerSummaryResponse, any>;
}) => {
  const { risks, toaster, asyncCache } = useInject();
  const { pushPane } = usePaneState();
  const getRiskPane = useRiskTypeToPane();
  const { queryParams, updateQueryParams } = useQueryParams();
  const { risksService } = useRisksContext();

  const riskObserver = useCallback(
    (change: IObjectDidChange<RiskTriggerSummaryResponse>) => {
      const updatedItem = dataModel.searchState.items?.find(item => item.key === change.object.key);
      if (updatedItem) {
        modify(
          updatedItem,
          change.name,
          change.type === 'add' || change.type === 'update' ? change.newValue : null
        );
      }
    },
    [dataModel]
  );

  useEffect(() => {
    if (queryParams.trigger && dataModel.searchState.items?.length) {
      void tryOpenPane();
    } else if (!queryParams.trigger && dataModel.expanded) {
      dataModel.setExpandedItem(null);
    }

    async function tryOpenPane() {
      try {
        const trigger = await asyncCache.suspend(risks.getTrigger, { key: queryParams.trigger });
        dataModel.setExpandedItem(trigger);

        const Pane = getRiskPane(trigger.elementType);
        pushPane(
          <RisksContext risksService={risksService}>
            <Pane
              triggerKey={trigger.key}
              riskObserver={riskObserver}
              onClose={() => updateQueryParams({ trigger: null, pane: null })}
            />
          </RisksContext>
        );
      } catch (error) {
        if (error.response?.status === 404) {
          toaster.success("Congrats! This risk doesn't exist anymore.");
          return;
        }

        throw error;
      }
    }
  }, [queryParams.trigger, dataModel.searchState?.items.length]);
};
