import { ParentSize } from '@visx/responsive';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { BubbleChart, BubbleData } from '@src-v2/components/charts/bubble-chart';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { deriveDatesFromRange } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/derrive-dates-from-range';
import { useFetchRisksByAgeAndSeverityData } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/use-fetch-risks-by-age-and-severity-data';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { riskOrder } from '@src-v2/data/risk-data';
import { useInject, useToggle } from '@src-v2/hooks';
import { Overview } from '@src-v2/services';
import { RiskAgeRange, Severity } from '@src-v2/types/overview/overview-responses';
import { StubAny } from '@src-v2/types/stub-any';
import { resourceRiskColor } from '@src/cluster-map-work/components/charts/chart-view-presentation-config';

const ageRanges: RiskAgeRange[] = ['0-2', '2-7', '7-14', '14-30', '30+'];

function RiskBubbleChart({
  onLoad,
  onReload,
  solutionsOverview,
  baseUrl,
}: {
  onLoad: () => void;
  onReload: () => void;
  solutionsOverview?: Overview;
  baseUrl: string;
}) {
  const { overview } = useInject();
  const makeOverviewUrl = useMakeOverviewUrl();

  const [riskLevelsCountByAgeRange] = useFetchRisksByAgeAndSeverityData(
    ageRanges,
    solutionsOverview ?? overview,
    onLoad,
    onReload
  );

  const legendOffset = 36;
  const history = useHistory();
  const xLabels = Object.keys(riskLevelsCountByAgeRange);
  const trackAnalytics = useTrackAnalytics();
  const allSeverities = [
    ...new Set(
      [].concat(
        ...xLabels.map(x =>
          Object.keys(riskLevelsCountByAgeRange[x as keyof typeof riskLevelsCountByAgeRange])
        )
      )
    ),
  ];

  const yLabels = riskOrder
    .map(risk => _.capitalize(risk))
    .filter(risk => allSeverities.some(severity => severity === risk));

  const onValueClick = (dateRange: string, riskLevel: Severity) => {
    const [startDate, endDate] = deriveDatesFromRange(dateRange);
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Tile click',
      [AnalyticsDataField.TileName]: 'Risks by age and severity',
    });
    history.push(
      makeOverviewUrl({
        baseUrl: baseUrl ?? '/risks',
        query: {
          Discovered: [startDate, endDate],
          RiskLevel: [riskLevel],
        },
      })
    );
  };

  return (
    <ParentSize>
      {({ width, height }) => (
        <BubbleChart
          width={width}
          getBubbleColor={getBubbleColor}
          getTextColor={getTextColor}
          height={height - legendOffset}
          data={riskLevelsCountByAgeRange as BubbleData}
          handleValueClick={onValueClick}
          xLabels={xLabels}
          yLabels={yLabels}
          xAxisLabel="Days"
        />
      )}
    </ParentSize>
  );
}

export const RisksByAgeAndSeverityTile = styled(props => {
  const [isLoading, setLoading] = useToggle(true);
  const resolveLoader = () => setLoading(false);
  const onReload = () => setLoading(true);

  return (
    <OverviewTile {...props} title="Risks by age and severity">
      {isLoading && <LogoSpinner data-loading />}
      <RiskBubbleChart {...props} onLoad={resolveLoader} onReload={onReload} />
    </OverviewTile>
  );
})`
  position: relative;

  ${LogoSpinner} {
    top: 4rem;
    right: 4rem;
    position: absolute;
  }
`;

const getBubbleColor = (_: StubAny, riskLevel: Severity) => resourceRiskColor(riskLevel);
const getTextColor = (_: StubAny, riskLevel: Severity) => {
  switch (riskLevel) {
    case 'High':
    case 'Critical':
      return 'var(--color-white)';
    default:
      return 'var(--color-blue-gray-70)';
  }
};
