import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { VerticalIndicatorRow } from '@src-v2/components/lists/vertical-indicator-row';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { Heading, ListItem, Paragraph, UnorderedList } from '@src-v2/components/typography';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { getRiskColor, riskOrder } from '@src-v2/data/risk-data';
import { useInject, useSuspense } from '@src-v2/hooks';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { humanize } from '@src-v2/utils/string-utils';
import { entries } from '@src-v2/utils/ts-utils';

export function OpenRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Open risks">
      <PlainOpenRisksTile dataFetcher={useInject().overview.getOpenRisks} />
    </OverviewTile>
  );
}

export function SecretsOpenRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Open secret risks">
      <PlainOpenRisksTile dataFetcher={useInject().secretsOverview.getOpenRisks} to="secrets" />
    </OverviewTile>
  );
}

export function ApiOpenRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Open API risks">
      <PlainOpenRisksTile dataFetcher={useInject().apiSecurityOverview.getOpenRisks} to="api" />
    </OverviewTile>
  );
}

export function SupplyChainOpenRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Open supply chain risks">
      <PlainOpenRisksTile
        dataFetcher={useInject().supplyChainOverview.getOpenRisks}
        to="supplyChain"
      />
    </OverviewTile>
  );
}

export function OssOpenRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Open OSS risks">
      <PlainOpenRisksTile dataFetcher={useInject().ossOverview.getOpenRisks} to="oss" />
    </OverviewTile>
  );
}

export function SastOpenRisksTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Open SAST risks">
      <PlainOpenRisksTile dataFetcher={useInject().sastOverview.getOpenRisks} to="sast" />
    </OverviewTile>
  );
}

function PlainOpenRisksTile({
  dataFetcher,
  to,
}: {
  dataFetcher: (args: { filters }) => Promise<Record<keyof typeof RiskLevel, number>>;
  to?: string;
}) {
  const trackAnalytics = useTrackAnalytics();
  const { activeFilters = {} } = useOverviewFilters();
  const makeOverviewUrl = useMakeOverviewUrl();

  const openRisksRecord = useSuspense(dataFetcher, {
    filters: _.omit(activeFilters, 'DashboardDateRange'),
  });

  const { isEmptyTile, openRisksData } = useMemo(() => {
    const dataEntries = entries(openRisksRecord);
    const allRisksCount = _.sumBy(dataEntries, ([, count]) => count);
    if (allRisksCount === 0) {
      return { isEmptyTile: true, openRisksData: [] };
    }

    return {
      isEmptyTile: false,
      openRisksData: _.orderBy(
        dataEntries.map(([severity, count]) => ({
          severity,
          count,
        })),
        ({ severity }) => riskOrder.indexOf(_.camelCase(severity)),
        'desc'
      ),
    };
  }, [openRisksRecord]);

  const handleRowClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Tile click',
    });
  }, [trackAnalytics]);

  return (
    <OverviewStateBoundary isRisksTile isEmpty={isEmptyTile}>
      <UnorderedList>
        {openRisksData.map((risk, index) => (
          <ListItem key={index}>
            <VerticalIndicatorRow
              to={makeOverviewUrl({
                baseUrl: to ? `/risks/${to}` : undefined,
                query: {
                  RiskLevel: [risk.severity],
                },
              })}
              color={getRiskColor({ riskLevel: risk.severity?.toLowerCase() })}
              onClick={handleRowClick}>
              <Heading>{risk.count.toLocaleString()}</Heading>
              <Paragraph>{humanize(risk.severity)} risks</Paragraph>
            </VerticalIndicatorRow>
          </ListItem>
        ))}
      </UnorderedList>
    </OverviewStateBoundary>
  );
}
