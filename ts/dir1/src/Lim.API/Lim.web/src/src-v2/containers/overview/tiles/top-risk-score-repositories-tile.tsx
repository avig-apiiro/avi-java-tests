import _ from 'lodash';
import { useMemo } from 'react';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { HorizontalBar, HorizontalBars, RepositoryBarHeader } from '@src-v2/components/charts';
import { LegendLine } from '@src-v2/components/charts/legends';
import { ClampText } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { BusinessImpactPopover } from '@src-v2/components/risk/risk-popovers';
import { Size } from '@src-v2/components/types/enums/size';
import { activityContent } from '@src-v2/containers/profiles/consumable-profiles-view';
import { getRiskGradientColor } from '@src-v2/data/risk-data';
import { useInject, useSuspense } from '@src-v2/hooks';
import { TopRiskScoreRepositoryItem } from '@src-v2/types/overview/overview-responses';
import { makeUrl } from '@src-v2/utils/history-utils';

export function TopRiskScoreRepositories() {
  const { overview } = useInject();

  return (
    <OverviewTile timeFilterInsensitive title="Top Risk scores per Repository">
      <PlainTopRepositoriesTile dataFetcher={overview.getTopRiskScoreRepositories} />
    </OverviewTile>
  );
}

function PlainTopRepositoriesTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<TopRiskScoreRepositoryItem[]>;
}) {
  const { overview } = useInject();
  const { activeFilters = {} } = useOverviewFilters();
  const filters = _.omit(activeFilters, 'DashboardDateRange');
  const [topRepositories, moduleBasedAppExist] = useSuspense([
    [dataFetcher, { filters }] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
  ]);
  const maxRiskScore = useMemo(
    () => Math.max(...topRepositories.map(repository => repository.riskScore)),
    []
  );
  return (
    <OverviewStateBoundary isDisabled={moduleBasedAppExist} isEmpty={!topRepositories.length}>
      <HorizontalBars>
        {topRepositories.map(({ repositoryProfile, riskScore }) => {
          return (
            <HorizontalBar
              to={makeUrl(`/profiles/repositories/${repositoryProfile.key}`, {})}
              key={repositoryProfile.key}
              total={maxRiskScore}
              value={riskScore}
              barStyle={{
                backgroundImage: getRiskGradientColor({
                  riskLevel: 'critical',
                }),
              }}>
              <RepositoryBarHeader>
                <VendorIcon name={repositoryProfile.provider.toString()} />
                <ClampText>{repositoryProfile.name}</ClampText>
                <ActivityIndicator
                  active={repositoryProfile.isActive}
                  content={activityContent(
                    repositoryProfile.isActive,
                    repositoryProfile.firstActivityAt,
                    repositoryProfile.lastActivityAt
                  )}
                  size={Size.XSMALL}
                />
                {repositoryProfile && (
                  <BusinessImpactPopover profile={repositoryProfile}>
                    <BusinessImpactIndicator
                      businessImpact={repositoryProfile.businessImpact}
                      size={Size.XXSMALL}
                    />
                  </BusinessImpactPopover>
                )}
              </RepositoryBarHeader>
            </HorizontalBar>
          );
        })}
      </HorizontalBars>
      <LegendLine>Risk Score</LegendLine>
    </OverviewStateBoundary>
  );
}
