import _ from 'lodash';
import { useMemo } from 'react';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { HorizontalBar, HorizontalBars, RepositoryBarHeader } from '@src-v2/components/charts';
import { LegendLine } from '@src-v2/components/charts/legends';
import { ClampText } from '@src-v2/components/clamp-text';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { BusinessImpactPopover } from '@src-v2/components/risk/risk-popovers';
import { Size } from '@src-v2/components/types/enums/size';
import { activityContent } from '@src-v2/containers/profiles/consumable-profiles-view';
import { getRiskGradientColor } from '@src-v2/data/risk-data';
import { useInject, useSuspense } from '@src-v2/hooks';
import { TopRiskScoreApplicationItem } from '@src-v2/types/overview/overview-responses';
import { makeUrl } from '@src-v2/utils/history-utils';

export function TopRiskScoreApplications() {
  const { overview } = useInject();

  return (
    <OverviewTile timeFilterInsensitive title="Top Risk scores per Application">
      <PlainTopApplicationTile dataFetcher={overview.getTopRiskScoreApplications} />
    </OverviewTile>
  );
}

function PlainTopApplicationTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<TopRiskScoreApplicationItem[]>;
}) {
  const { overview } = useInject();
  const { activeFilters = {} } = useOverviewFilters();
  const filters = _.omit(activeFilters, 'DashboardDateRange');
  const [topApplications, moduleBasedAppExist] = useSuspense([
    [dataFetcher, { filters }] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
  ]);

  const maxRiskScore = useMemo(
    () => Math.max(...topApplications.map(applicaiton => applicaiton.riskScore)),
    [topApplications]
  );

  return (
    <OverviewStateBoundary isDisabled={moduleBasedAppExist} isEmpty={!topApplications.length}>
      <HorizontalBars>
        {topApplications.map(({ assetCollection: application, riskScore }) => {
          return (
            <HorizontalBar
              to={makeUrl(`/profiles/applications/${application.key}`, {})}
              key={application.key}
              total={maxRiskScore}
              value={riskScore}
              barStyle={{
                backgroundImage: getRiskGradientColor({
                  riskLevel: 'critical',
                }),
              }}>
              <RepositoryBarHeader>
                <ClampText>{application.name}</ClampText>
                <ActivityIndicator
                  active={application.isActive}
                  content={activityContent(
                    application.isActive,
                    application.firstActivityAt,
                    application.lastActivityAt
                  )}
                  size={Size.XSMALL}
                />
                {application && (
                  <BusinessImpactPopover profile={application}>
                    <BusinessImpactIndicator
                      businessImpact={application.businessImpact}
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
