import { ParentSize } from '@visx/responsive';
import styled from 'styled-components';
import { BubbleChart, BubbleData } from '@src-v2/components/charts/bubble-chart';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { useInject, useSuspense } from '@src-v2/hooks';
import {
  BusinessImpactAbbreviation,
  BusinessImpactToLevel,
} from '@src-v2/types/enums/business-impact';
import { AppsRiskScoreResponse } from '@src-v2/types/overview/overview-responses';
import { abbreviate } from '@src-v2/utils/number-utils';
import { resourceRiskColor } from '@src/cluster-map-work/components/charts/chart-view-presentation-config';

const businessImpactOrder = [
  BusinessImpactAbbreviation.low,
  BusinessImpactAbbreviation.medium,
  BusinessImpactAbbreviation.high,
];

const getBubbleColor = (_: any, BI: BusinessImpactAbbreviation) =>
  resourceRiskColor(BusinessImpactToLevel[BI]);
const getTextColor = (_: any, BI: BusinessImpactAbbreviation) => {
  switch (BI) {
    case 'HBI':
      return 'var(--color-white)';
    default:
      return 'var(--color-blue-gray-70)';
  }
};

function generateRiskScoreRanges(
  appData: AppsRiskScoreResponse[]
): { value: number; display: string }[] {
  const uniqueRanges = [...new Set(appData.map(item => item.range))].sort((a, b) => a - b);
  return uniqueRanges.map(range => ({
    value: range,
    display: abbreviate(range),
  }));
}

function formatRiskData(appData: AppsRiskScoreResponse[]): BubbleData {
  const formattedData: BubbleData = {};

  appData.forEach(item => {
    const rangeKey = abbreviate(item.range);

    if (!formattedData[rangeKey]) {
      formattedData[rangeKey] = {};
    }

    if (!formattedData[rangeKey][item.businessImpact]) {
      formattedData[rangeKey][item.businessImpact] = 0;
    }

    formattedData[rangeKey][item.businessImpact] += item.count;
  });

  return formattedData;
}

function AppsBubbleChart() {
  const { overview } = useInject();
  const { activeFilters } = useOverviewFilters();
  const appData = useSuspense(overview.getAppsCountByBusinessImpactAndRiskScore, {
    filters: activeFilters,
  });

  const formattedAppsData = formatRiskData(appData);
  const riskScoreRanges = generateRiskScoreRanges(appData);

  return (
    <ChartContainer>
      <ParentSize>
        {({ width, height }) => (
          <BubbleChart
            width={width - 36}
            height={height - 36}
            data={formattedAppsData}
            getBubbleColor={getBubbleColor}
            getTextColor={getTextColor}
            xLabels={riskScoreRanges.map(range => range.display)}
            yLabels={businessImpactOrder.slice()}
            xAxisLabel="Risk score"
          />
        )}
      </ParentSize>
    </ChartContainer>
  );
}

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export const AppsByBusinessImpactAndScore = () => (
  <OverviewTile title="Apps by Business Impact and Risk Score">
    <AppsBubbleChart />
  </OverviewTile>
);
