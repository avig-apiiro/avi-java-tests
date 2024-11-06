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

export function TopRepositoriesGeneralTile() {
  return (
    <OverviewTile timeFilterInsensitive title="HBI repositories with critical risks">
      <PlainTopRepositoriesTile dataFetcher={useInject().overview.getTopRepositories} />
    </OverviewTile>
  );
}

export function TopRepositoriesSecretsTile() {
  return (
    <OverviewTile timeFilterInsensitive title="HBI repositories with critical secrets risks">
      <PlainTopRepositoriesTile dataFetcher={useInject().secretsOverview.getTopRepositories} />
    </OverviewTile>
  );
}

export function TopRepositoriesApiTile() {
  return (
    <OverviewTile timeFilterInsensitive title="HBI repositories with critical API security risks">
      <PlainTopRepositoriesTile dataFetcher={useInject().apiSecurityOverview.getTopRepositories} />
    </OverviewTile>
  );
}

export function TopRepositoriesSupplyChainTile() {
  return (
    <OverviewTile timeFilterInsensitive title="HBI repositories with critical/high risks">
      <PlainTopRepositoriesTile
        dataFetcher={useInject().supplyChainOverview.getTopRepositories}
        riskLevels={['Critical', 'High']}
        riskTypeTab="supplyChain"
      />
    </OverviewTile>
  );
}

export function TopRepositoriesOssTile() {
  return (
    <OverviewTile timeFilterInsensitive title="HBI repositories with critical OSS risks">
      <PlainTopRepositoriesTile dataFetcher={useInject().ossOverview.getTopRepositories} />
    </OverviewTile>
  );
}

export function TopRepositoriesSastTile() {
  return (
    <OverviewTile timeFilterInsensitive title="HBI repositories with critical SAST risks">
      <PlainTopRepositoriesTile dataFetcher={useInject().sastOverview.getTopRepositories} />
    </OverviewTile>
  );
}

function PlainTopRepositoriesTile({
  dataFetcher,
  riskLevels = ['Critical'],
  riskTypeTab = 'development',
}: {
  dataFetcher: (args: { filters }) => Promise<TopRepositoryItem[]>;
  riskLevels?: string[];
  riskTypeTab?: string;
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
            to={makeUrl(`/profiles/repositories/${repositoryProfile.key}/risk/${riskTypeTab}`, {
              fl: { RiskLevel: { values: riskLevels } },
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
      <LegendLine>Number of risks</LegendLine>
    </OverviewStateBoundary>
  );
}
