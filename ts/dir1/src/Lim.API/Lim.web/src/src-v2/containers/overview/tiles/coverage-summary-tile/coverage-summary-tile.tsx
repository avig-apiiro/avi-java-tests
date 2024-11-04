import _ from 'lodash';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { HorizontalBar, HorizontalBars, RepositoryBarHeader } from '@src-v2/components/charts';
import { LegendLine } from '@src-v2/components/charts/legends';
import { VendorIcon } from '@src-v2/components/icons';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Size } from '@src-v2/components/types/enums/size';
import { SubHeading4 } from '@src-v2/components/typography';
import {
  CoverageProviderPopover,
  CoverageSummaryPopover,
} from '@src-v2/containers/overview/tiles/coverage-summary-tile/coverage-summary-popover';
import { getCoverageOverviewFilters } from '@src-v2/containers/overview/tiles/utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { SearchParams } from '@src-v2/services';
import { CoverageSummary } from '@src-v2/types/overview/overview-responses';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { makeUrl } from '@src-v2/utils/history-utils';

interface PlainTopRepositoriesTileProps {
  dataFetcher: (args: {
    filters: SearchParams['filters'];
  }) => Promise<{ coverageData: CoverageSummary; totalCoverages: number }>;
}

export function CoverageSummaryTile() {
  const { overview } = useInject();

  return (
    <OverviewTile timeFilterInsensitive title="Security tools coverage">
      <PlainCoverageTile dataFetcher={overview.getCoverageSummary} />
    </OverviewTile>
  );
}

function PlainCoverageTile({ dataFetcher }: PlainTopRepositoriesTileProps) {
  const { activeFilters: dashboardFilters } = useOverviewFilters();
  const { coverageData, totalCoverages } = useSuspense(dataFetcher, { filters: dashboardFilters });

  return (
    <OverviewStateBoundary isDisabled={false} isEmpty={Object.keys(coverageData).length === 0}>
      <CoverageHorizontalBars>
        {Object.keys(coverageData).map(coverageGroup => {
          const coverageGroupDisplayName = getCoverageGroupDisplayName(coverageGroup);
          const coverageGroupData = coverageData[coverageGroup];
          const coverageGroupPercentage = coverageGroupData.total.percentage;
          const groupProviders = Object.keys(_.omit(coverageGroupData, 'total'));

          return (
            <CoverageBarContainer key={coverageGroup}>
              <CoverageBar
                data-has-coverage={dataAttr(Object.keys(coverageGroupData).length > 0)}
                showNumericValue={false}
                key={coverageGroup}
                total={100}
                value={coverageGroupPercentage}
                barStyle={barStyle}
                lineContainerStyle={lineContainerStyle}>
                <RepositoryBarHeaderContainer>
                  <CoverageSummaryPopover
                    totalCoverages={totalCoverages}
                    coverageGroupDisplayName={coverageGroupDisplayName}
                    coverageValues={coverageGroupData}>
                    <RepositoryBarHeader>
                      <CoverageGroupLabel>{coverageGroupDisplayName}</CoverageGroupLabel>
                      <SubHeading4>{coverageGroupPercentage}%</SubHeading4>
                    </RepositoryBarHeader>
                  </CoverageSummaryPopover>
                  <ProviderIcons>
                    <TrimmedCollectionDisplay
                      limit={5}
                      excessiveItem={({ value: provider }) => (
                        <TextButton
                          to={makeUrl('/coverage', {
                            fl: {
                              RepositoryMonitorStatus: { values: ['Monitored'] },
                              MatchedProviders: { values: [provider] },
                              ...getCoverageOverviewFilters(dashboardFilters),
                            },
                          })}>
                          {provider}
                        </TextButton>
                      )}
                      limitExcessiveItems={10}
                      item={({ value: provider }) => (
                        <CoverageProviderPopover
                          key={provider}
                          totalCoverages={totalCoverages}
                          provider={provider}
                          coverageValue={coverageGroupData[provider]}>
                          <VendorIcon size={Size.XSMALL} name={provider} />
                        </CoverageProviderPopover>
                      )}>
                      {groupProviders}
                    </TrimmedCollectionDisplay>
                  </ProviderIcons>
                </RepositoryBarHeaderContainer>
              </CoverageBar>
            </CoverageBarContainer>
          );
        })}
      </CoverageHorizontalBars>
      <CoverageTileLegendLine>
        <TextButton to="/coverage" showArrow>
          View coverage
        </TextButton>
      </CoverageTileLegendLine>
    </OverviewStateBoundary>
  );
}

function getCoverageGroupDisplayName(coverageGroup: string) {
  switch (coverageGroup) {
    case 'ApiSecurity':
      return 'API';
    case 'Sast':
      return 'SAST';
    case 'Sca':
      return 'SCA';
    default:
      return coverageGroup;
  }
}

const ProviderIcons = styled.span`
  display: flex;
  gap: 1.5rem;
`;

const CoverageBarContainer = styled.div``;
const CoverageGroupLabel = styled.span``;

const RepositoryBarHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CoverageTileLegendLine = styled(LegendLine)`
  display: flex;
  justify-content: flex-end;
  margin: 5rem 0 4rem 0;
`;

const CoverageBar = styled(HorizontalBar)`
  height: 14rem;
  box-shadow: var(--elevation-0);
  pointer-events: all;

  &:not([data-has-coverage]) {
    pointer-events: none;
  }

  &:hover {
    box-shadow: var(--elevation-0);
  }
`;

const barStyle = {
  background: `var(--color-blue-65)`,
  borderRadius: '100px',
  height: '2rem',
};

const lineContainerStyle = {
  background: `var(--color-blue-40)`,
  boxShadow: `0px 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.11) inset`,
  overflow: 'hidden',
  marginTop: '1rem',
};

const CoverageHorizontalBars = styled(HorizontalBars)`
  gap: 2.5rem;
  justify-content: space-around;
`;
