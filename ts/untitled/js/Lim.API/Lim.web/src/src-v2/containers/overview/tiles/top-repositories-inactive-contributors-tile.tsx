import _ from 'lodash';
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
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { TopRepositoryItem } from '@src-v2/types/overview/overview-responses';
import { makeUrl } from '@src-v2/utils/history-utils';

export function TopRepositoriesInactiveContributorsSupplyChainTile() {
  return (
    <OverviewTile timeFilterInsensitive title="Top HBI repos with inactive contributors">
      <PlainTopRepositoriesTile
        dataFetcher={useInject().supplyChainOverview.getTopRepositoriesInactiveContributors}
      />
    </OverviewTile>
  );
}

function PlainTopRepositoriesTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<TopRepositoryItem[]>;
}) {
  const { overview } = useInject();
  const { activeFilters = {} } = useOverviewFilters();
  const filters = _.omit(activeFilters, 'DashboardDateRange');

  const [topRepositories, moduleBasedAppExist] = useSuspense([
    [dataFetcher, { filters }] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
  ]);
  const maxCount = Math.max(...topRepositories.map(repo => repo.count));

  return (
    <OverviewStateBoundary
      isRisksTile
      isDisabled={moduleBasedAppExist}
      isEmpty={!topRepositories.length || !maxCount}>
      <HorizontalBars>
        {topRepositories.map(({ repositoryProfile, count }) => (
          <HorizontalBar
            to={makeUrl(`/profiles/repositories/${repositoryProfile.key}/inventory/contributors`, {
              fl: {
                Behavior: { values: ['IsInactiveDeveloper'] },
                Permission: { values: ['Write'] },
              },
            })}
            key={repositoryProfile.key}
            total={maxCount}
            value={count}
            barStyle={{
              backgroundImage: getRiskGradientColor({
                riskLevel: 'critical',
              }),
            }}>
            <RepositoryBarHeader>
              <VendorIcon name={repositoryProfile.providerGroup.toString()} />
              <ClampText>{repositoryProfile.uniqueName}</ClampText>
              <ActivityIndicator
                active={repositoryProfile.isActive}
                content={activityContent(
                  repositoryProfile.isActive,
                  repositoryProfile.firstActivityAt,
                  repositoryProfile.lastActivityAt
                )}
                size={Size.XSMALL}
              />
              {repositoryProfile.businessImpactLevel && (
                <BusinessImpactPopover profile={repositoryProfile}>
                  <BusinessImpactIndicator
                    businessImpact={BusinessImpact[repositoryProfile.businessImpactLevel]}
                    size={Size.XXSMALL}
                  />
                </BusinessImpactPopover>
              )}
            </RepositoryBarHeader>
          </HorizontalBar>
        ))}
      </HorizontalBars>
      <LegendLine>Number of inactive users with write permission</LegendLine>
    </OverviewStateBoundary>
  );
}
