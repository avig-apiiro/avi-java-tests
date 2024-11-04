import { observer } from 'mobx-react';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { TableControls } from '@src-v2/components/table/table-addons';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading } from '@src-v2/components/typography';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableCounter } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useOpenDataModelReferencePane } from '@src-v2/containers/entity-pane/use-open-data-model-reference-pane';
import { useInject } from '@src-v2/hooks';
import { InventoryQueryResultsTable } from '@src-v2/models/apiiroql-query/inventory-query-results-table';
import { inventoryQueryGlobalResultsLimit } from '@src-v2/services';
import { ApiiroQlQueryResultRow } from '@src-v2/types/apiiro-query-languange/apiiro-ql-query-result-row';
import { downloadFile } from '@src-v2/utils/dom-utils';

type InventoryQueryResultsPaneProps = {
  inventoryQueryResultsTable: InventoryQueryResultsTable;
  queryTitle: string;
};
export const InventoryQueryResultsPane = observer(
  ({ inventoryQueryResultsTable, queryTitle }: InventoryQueryResultsPaneProps) => {
    const handleOpenPane = useOpenDataModelReferencePane();

    const {
      resultsDataModel,
      additionalResultsMayExist,
      searchTerm,
      setSearchTerm,
      lastExecutedQueryDefinition,
    } = inventoryQueryResultsTable;

    const { inventoryQuery } = useInject();

    const trackAnalytics = useTrackAnalytics();

    const [showResultCountWarning, setShowResultCountWarning] = useState<boolean>();
    useEffect(
      () => setShowResultCountWarning(additionalResultsMayExist),
      [additionalResultsMayExist, lastExecutedQueryDefinition]
    );

    const handleSearchChange = useCallback(
      ({ target }) => {
        setSearchTerm(target?.value);
      },
      [setSearchTerm]
    );

    const handleExportData = useCallback(async () => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Export results',
      });

      const csvContent = await inventoryQuery.getInventoryQueryResultsAsCsv(
        lastExecutedQueryDefinition
      );
      downloadFile(`${queryTitle}.csv`, csvContent, 'application/json');
    }, [inventoryQuery, lastExecutedQueryDefinition, queryTitle]);

    return (
      <>
        {resultsDataModel.searchState.error && (
          <ResultsTableContainer>
            <ApiiroQlResultError error={resultsDataModel.searchState.error} />
          </ResultsTableContainer>
        )}
        {resultsDataModel.searchState.loading && <ResultsTableLoadingIndicator />}
        {!resultsDataModel.searchState.loading && !resultsDataModel.searchState.error && (
          <ResultsTableContainer>
            {showResultCountWarning && (
              <ApiiroQlResultCountLimitWarning onDismiss={() => setShowResultCountWarning(false)} />
            )}
            <ButtonsRow>
              <SearchInput
                placeholder="Search"
                defaultValue={searchTerm}
                onChange={handleSearchChange}
              />
              <FlexSpacer />
              <Button startIcon="Export" variant={Variant.PRIMARY} onClick={handleExportData}>
                Export
              </Button>
              <TableControls.Counter>
                <TableCounter dataModel={resultsDataModel} />
              </TableControls.Counter>
            </ButtonsRow>
            <DataTable dataModel={resultsDataModel}>
              {(item: ApiiroQlQueryResultRow) => (
                <DataTable.Row
                  data={item}
                  key={item.key}
                  onClick={() => handleOpenPane(item.primaryObject)}
                />
              )}
            </DataTable>
            {resultsDataModel.searchState.items.length > 0 && (
              <TablePagination searchState={resultsDataModel.searchState} />
            )}
          </ResultsTableContainer>
        )}
      </>
    );
  }
);

const ApiiroQlResultError = styled(({ error, ...props }) => {
  return (
    <div {...props}>
      <SvgIcon name="Warning" />
      {error?.response?.data?.message || error.toString()}
    </div>
  );
})`
  display: flex;
  background: var(--color-red-15);
  border: solid 1px var(--color-red-55);
  color: var(--color-blue-gray-70);
  border-radius: 3rem;
  gap: 4rem;
  font-size: var(--font-size-m);
  padding: 4.5rem;

  ${BaseIcon} {
    color: var(--color-red-55);
  }
`;

const ResultsTableContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  flex-grow: 1;
  margin: 5rem 0;
  gap: 5rem;
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 2rem;

  width: 100%;

  ${TableControls.Filters} {
    flex-grow: 0;
  }
`;

const FlexSpacer = styled.div`
  flex-grow: 1;
`;

const ResultsTableLoadingIndicator = styled(({ ...props }) => {
  return (
    <div {...props}>
      <LogoSpinner />
      <Heading>Gathering data...</Heading>
    </div>
  );
})`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-height: 60rem;

  padding-top: 12rem;
  gap: 4rem;

  ${LogoSpinner} {
    width: 12rem;
  }

  ${Heading} {
    font-weight: 600;
    font-size: var(--font-size-m);
    line-height: 6rem;
    color: var(--default-text-color);
  }
`;

const ApiiroQlResultCountLimitWarning = styled(
  ({ onDismiss, ...props }: { onDismiss: () => void }) => (
    <div {...props}>
      <SvgIcon name="Warning" />
      For performance reasons, returned results were limited to{' '}
      {inventoryQueryGlobalResultsLimit.toLocaleString()} rows.
      <FlexSpacer />
      <IconButton name="CloseLarge" onClick={onDismiss} />
    </div>
  )
)`
  display: flex;
  background: var(--color-yellow-15);
  border: solid 1px var(--color-yellow-55);
  color: var(--color-blue-gray-70);
  border-radius: 3rem;
  gap: 4rem;
  font-size: var(--font-size-m);
  padding: 4.5rem;

  ${BaseIcon}[data-name='Warning'] {
    color: var(--color-orange-55);
  }
`;
