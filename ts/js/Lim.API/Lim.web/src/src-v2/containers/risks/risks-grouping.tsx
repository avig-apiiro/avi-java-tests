import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Dropdown } from '@src-v2/components/dropdown';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { TableGrouping } from '@src-v2/components/table/table-grouping';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Strong } from '@src-v2/components/typography';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksFilterControls } from '@src-v2/containers/risks/risks-filter-controls';
import { RiskDataTable, useOpenRiskPane } from '@src-v2/containers/risks/risks-table';
import { SecretsExclusionMenu } from '@src-v2/containers/risks/secrets/secrets-exclusion/secrets-exclusion-menu';
import { useInject, useLoading, useQueryParams, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { makeUrl } from '@src-v2/utils/history-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

export const RisksGrouping = observer(
  ({
    dataGroupingModel,
    hideExport = false,
  }: {
    dataGroupingModel: StubAny;
    hideExport?: boolean;
  }) => {
    const { risksService } = useRisksContext();
    const { activeFilters } = useFilters();

    const [handleExport, exportLoading] = useLoading(
      async () => await risksService.exportRisks(activeFilters),
      [activeFilters]
    );

    return (
      <>
        <FluidTableControls>
          <TableSearch placeholder="Search..." />
          <TableControls.Actions>
            <GroupingMenu />
            {!hideExport && (
              <Button
                startIcon="Export"
                variant={Variant.PRIMARY}
                loading={exportLoading}
                onClick={handleExport}>
                Export
              </Button>
            )}
          </TableControls.Actions>

          <TableControls.Filters>
            <RisksFilterControls />
          </TableControls.Filters>
          <TableControls.Counter>
            <GroupsCount>
              {formatNumber(dataGroupingModel.searchState.count)} out of{' '}
              {formatNumber(dataGroupingModel.searchState.total)} groups
            </GroupsCount>
          </TableControls.Counter>
        </FluidTableControls>

        <TableGrouping dataGroupingModel={dataGroupingModel} />

        {dataGroupingModel.searchState.items.length > 0 && (
          <TablePagination searchState={dataGroupingModel.searchState} />
        )}
      </>
    );
  }
);

export const GroupingCollapsibleBody = styled(
  observer(
    ({ dataGroupingModel, item, ...props }: { dataGroupingModel: StubAny; item: StubAny }) => {
      const history = useHistory();
      const { risksService, tableColumns, tableRiskType: riskType } = useRisksContext();
      const { activeFilters } = useFilters();
      const { searchTerm, ...filters } = activeFilters;
      const { queryParams, updateQueryParams } = useQueryParams();

      const dataModel = useDataTable(risksService.searchRisks, {
        columns: tableColumns,
        ignorePagination: true,
        limit: 8,
        searchParams: {
          path: `risk/${riskType}`,
          filters: createCustomFilters(item, filters),
          ...(dataGroupingModel?.searchParams ?? {}),
        },
      });

      useOpenRiskPane({ dataModel });

      const handleShowAllRisksClick = useCallback(() => {
        const customFilters = createCustomFilters(item, queryParams.fl);
        history.push(
          makeUrl(history.location.pathname, {
            fl: customFilters,
            group: undefined,
          })
        );
      }, [item, riskType, queryParams, history]);

      return (
        <>
          <RiskDataTable {...props} dataModel={dataModel} expandable>
            {item => (
              <DataTable.Row
                key={item.key}
                data={item}
                data-selected={dataAttr(queryParams.trigger === item.key)}
                onClick={() => {
                  updateQueryParams({ trigger: item.key });
                }}
              />
            )}
          </RiskDataTable>
          <ShowAllRisksContainer>
            <ShowAllLabel onClick={handleShowAllRisksClick}>
              Show all risks ({formatNumber(item.totalRisks)})
            </ShowAllLabel>
          </ShowAllRisksContainer>
        </>
      );
    }
  )
)`
  --table-border-radius: 0;
  border-radius: 0;

  ${Table.Head} {
    box-shadow: 0 10rem 2rem -10rem rgba(0, 0, 0, 0.35) inset;
  }

  ${Table.Cell}, ${Table.Header} {
    border-left: none;
    border-right: none;
  }
`;

const ShowAllRisksContainer = styled.div`
  height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4rem;
  background-color: var(--color-blue-gray-20);
`;

const ShowAllLabel = styled.span`
  font-size: var(--font-size-s);
  font-weight: 400;
  color: var(--color-blue-gray-60);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--color-blue-gray-70);
  }
`;

const GroupsCount = styled.span`
  color: var(--color-blue-gray-60);
`;

export const GroupingMenu = styled(() => {
  const history = useHistory();
  const { risks, application } = useInject();
  const { queryParams = {} } = useQueryParams();
  const { pathname } = useLocation();
  const { tableRiskType } = useRisksContext();

  const groupingMenuOptions = useSuspense(risks.getGroupingMenuOptions, {
    riskType: tableRiskType,
  });

  const handleGroupingClick = useCallback(
    (groupType: string) => {
      const url = makeUrl(pathname, {
        group: groupType,
        // @ts-ignore
        fl: { ...(queryParams.fl ?? {}) },
      });
      history.push(url);
    },
    [history, pathname, queryParams, makeUrl]
  );

  const handleNoneClick = useCallback(() => {
    history.push(makeUrl(pathname, { ...queryParams, group: undefined }));
  }, [history, queryParams, makeUrl]);

  const active = Boolean(queryParams.group);

  return (
    <SelectMenu
      active={active}
      appendTo="parent"
      maxHeight="100%"
      variant={Variant.FILTER}
      placeholder={
        <SelectMenu.Label>
          Group by{queryParams.group && ':'}{' '}
          <Strong>
            {String(
              groupingMenuOptions.find(group => group.key === String(queryParams.group))?.label ??
                ''
            )}
          </Strong>
        </SelectMenu.Label>
      }>
      {groupingMenuOptions
        .filter(
          group =>
            String(queryParams.group) !== group.key &&
            (application.isFeatureEnabled(FeatureFlag.GroupedByCwe) || group.key !== 'CWE') &&
            (application.isFeatureEnabled(FeatureFlag.GroupByArtifact) || group.key !== 'Artifact')
        )
        .map(group => (
          <Dropdown.Item key={group.key} onClick={() => handleGroupingClick(group.key)}>
            {group.label}
          </Dropdown.Item>
        ))}

      {active && <Dropdown.Item onClick={handleNoneClick}>None</Dropdown.Item>}
    </SelectMenu>
  );
})`
  ${Strong} {
    font-weight: 600;
  }
`;

export const SecretsMenu = () => {
  const { pathname } = useLocation();

  const showSecretsMenu = pathname.includes('secrets');

  if (!showSecretsMenu) {
    return null;
  }

  return <SecretsExclusionMenu />;
};

// we have an issue with App/Repo filters with grouping. this is the workaround (no other way for now)
const createCustomFilters = (item: StubAny, queryParamsFilters: any = {}) => {
  const filters = { ...queryParamsFilters };
  if (item.filterKey === 'RepositoryKeys') {
    filters.AssetCollectionKeys = { values: null };
  }

  return { ...filters, [item.filterKey]: { values: [item.groupValue] } };
};
