import _ from 'lodash';
import { useMemo } from 'react';
import { HorizontalBar, HorizontalBars, RepositoryBarHeader } from '@src-v2/components/charts';
import { LegendLine } from '@src-v2/components/charts/legends';
import { ClampText } from '@src-v2/components/clamp-text';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { getRiskGradientColor } from '@src-v2/data/risk-data';
import { useInject, useSuspense } from '@src-v2/hooks';
import { TopRiskScoreTeamItem } from '@src-v2/types/overview/overview-responses';
import { makeUrl } from '@src-v2/utils/history-utils';

export function TopRiskScoreOrgTeams() {
  const { overview } = useInject();

  return (
    <OverviewTile timeFilterInsensitive title="Top Risk scores per Team">
      <PlainTopTeamTile dataFetcher={overview.getTopRiskScoreTeams} />
    </OverviewTile>
  );
}

function PlainTopTeamTile({
  dataFetcher,
}: {
  dataFetcher: (args: { filters }) => Promise<TopRiskScoreTeamItem[]>;
}) {
  const { overview } = useInject();
  const { activeFilters = {} } = useOverviewFilters();
  const filters = _.omit(activeFilters, 'DashboardDateRange');
  const [topTeams, moduleBasedAppExist] = useSuspense([
    [dataFetcher, { filters }] as const,
    [overview.moduleBasedAppExist, { filters }] as const,
  ]);
  const maxRiskScore = useMemo(() => Math.max(...topTeams.map(team => team.riskScore)), [topTeams]);

  return (
    <OverviewStateBoundary isDisabled={moduleBasedAppExist} isEmpty={!topTeams.length}>
      <HorizontalBars>
        {topTeams.map(({ teamProfile: team, riskScore }) => {
          return (
            <HorizontalBar
              to={makeUrl(`/profiles/teams/${team.key}`, {})}
              key={team.key}
              total={maxRiskScore}
              value={riskScore}
              barStyle={{
                backgroundImage: getRiskGradientColor({
                  riskLevel: 'critical',
                }),
              }}>
              <RepositoryBarHeader>
                <ClampText>{team.name}</ClampText>
              </RepositoryBarHeader>
            </HorizontalBar>
          );
        })}
      </HorizontalBars>
      <LegendLine>Risk Score</LegendLine>
    </OverviewStateBoundary>
  );
}
