import _ from 'lodash';
import { useCallback } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { RisksOverviewList } from '@src-v2/components/overview/risks-overview-list';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { useInject, useSuspense } from '@src-v2/hooks';
import { OverviewTopRisksItem } from '@src-v2/types/overview/overview-responses';

export function GeneralTopRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top risks">
      <PlainTopRisksTiles dataFetcher={useInject().overview.getTopRisks} />
    </OverviewTile>
  );
}

export function RiskyIssuesTopRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top design risks">
      <PlainTopRisksTiles dataFetcher={useInject().overview.getTopRiskyTicketsRisks} />
    </OverviewTile>
  );
}

export function OssTopRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top OSS security risks">
      <PlainTopRisksTiles dataFetcher={useInject().ossOverview.getTopRisks} to="oss" />
    </OverviewTile>
  );
}

export function ApiTopRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top API security risks">
      <PlainTopRisksTiles dataFetcher={useInject().apiSecurityOverview.getTopRisks} to="api" />
    </OverviewTile>
  );
}

export function SupplyChainTopRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top supply chain risks">
      <PlainTopRisksTiles
        dataFetcher={useInject().supplyChainOverview.getTopRisks}
        to="supplyChain"
      />
    </OverviewTile>
  );
}

export function SecretsTopRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top secrets risks">
      <PlainTopRisksTiles dataFetcher={useInject().secretsOverview.getTopRisks} to="secrets" />
    </OverviewTile>
  );
}

export function SastTopRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top SAST risks">
      <PlainTopRisksTiles dataFetcher={useInject().sastOverview.getTopRisks} to="sast" />
    </OverviewTile>
  );
}

function PlainTopRisksTiles({
  dataFetcher,
  to,
}: {
  dataFetcher: (args: { filters }) => Promise<OverviewTopRisksItem[]>;
  to?: string;
}) {
  const trackAnalytics = useTrackAnalytics();
  const { activeFilters } = useOverviewFilters();
  const data = useSuspense(dataFetcher, { filters: _.omit(activeFilters, 'DashboardDateRange') });

  const isEmpty = !data.length || data.every(item => !item.count);

  const handleRowClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Tile click',
    });
  }, [trackAnalytics]);

  return (
    <OverviewStateBoundary isRisksTile isEmpty={isEmpty}>
      <RisksOverviewList data={data} to={to} onClick={handleRowClick} />
    </OverviewStateBoundary>
  );
}
