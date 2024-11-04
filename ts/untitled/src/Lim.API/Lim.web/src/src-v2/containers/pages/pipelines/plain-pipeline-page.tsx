import { useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { PersistentSearchFilters } from '@src-v2/components/persistent-search-state/persistent-search-filters';
import { PersistentSearchStateScroller } from '@src-v2/components/persistent-search-state/persistent-search-state-scroller';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { Filter } from '@src-v2/hooks/use-filters';
import { SearchParams } from '@src-v2/services';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { CICDServer, Pipeline } from '@src-v2/types/pipelines/pipelines-types';

export const PlainPipelinePage = ({
  title,
  searchItemTypeDisplayName,
  filterItemTypeDisplayName,
  cardToRender: CardToRender,
  dataFetcher,
  filterFetcher,
}: {
  title: string;
  dataFetcher: (
    args: Partial<SearchParams>
  ) => Promise<AggregationResult<CICDServer> | AggregationResult<Pipeline>>;
  filterFetcher?: () => Promise<Filter[]>;
  searchItemTypeDisplayName: string;
  filterItemTypeDisplayName: { singular: string; plural: string };
  cardToRender: ({ item }: { item?: Pipeline | CICDServer }) => JSX.Element;
}) => {
  const { pipelines, rbac } = useInject();
  const filterOptions = useSuspense(filterFetcher);
  const [searchCounters, setSearchCounters] = useState({ count: null, total: null });
  const handleSearchStateChanged = useCallback(
    ({ count, total }: { count: number; total: number }) => {
      setSearchCounters({ count, total });
    },
    [setSearchCounters]
  );

  if (!rbac.canEdit(resourceTypes.Global)) {
    return <Redirect to="/" />;
  }

  return (
    <Page title={title}>
      <Gutters>
        <AnalyticsLayer
          analyticsData={{
            [AnalyticsDataField.Context]: `CI/CD ${filterItemTypeDisplayName.plural}`,
          }}>
          <PersistentSearchFilters
            searchCounters={searchCounters}
            itemTypeDisplayName={{
              singular: filterItemTypeDisplayName.singular,
              plural: filterItemTypeDisplayName.plural,
            }}
            filterOptions={filterOptions}
          />
          <AsyncBoundary>
            <PersistentSearchStateScroller
              dataFetcher={dataFetcher}
              sortFetcher={pipelines.getPipelinesSortOptions}
              itemRender={CardToRender}
              onSearchStateChanged={handleSearchStateChanged}
              itemTypeDisplayName={searchItemTypeDisplayName}
            />
          </AsyncBoundary>
        </AnalyticsLayer>
      </Gutters>
    </Page>
  );
};
