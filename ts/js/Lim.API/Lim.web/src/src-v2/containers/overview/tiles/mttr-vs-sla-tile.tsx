import { hoursToMilliseconds } from 'date-fns';
import _ from 'lodash';
import { ReactNode } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { Gauge } from '@src-v2/components/charts/gauge';
import { OverviewStateBoundary } from '@src-v2/components/overview/overview-state-boundary';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useOverviewFilters } from '@src-v2/components/overview/use-overview-filters';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { useDistanceDate, useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { MttrVsSlaStatItem } from '@src-v2/types/overview/overview-responses';
import { StyledProps } from '@src-v2/types/styled';
import { humanize } from '@src-v2/utils/string-utils';

export function GeneralMttrVsSlaTile() {
  const { params } =
    useRouteMatch<{ profileType: string; profileKey: string }>(
      '/profiles/:profileType/:profileKey'
    ) ?? {};

  const { overview } = useInject();

  return (
    <MttrVsSlaTile title="MTTR vs. SLA">
      <PlainMttrVsSlaTile
        dataFetcher={filters => overview.getMttrVsSlaStats({ filters, params })}
      />
    </MttrVsSlaTile>
  );
}

export function ApiMttrVsSlaTile() {
  return (
    <OverviewTile title="MTTR vs. SLA">
      <PlainMttrVsSlaTile
        dataFetcher={useInject().apiSecurityOverview.getMttrVsSlaStats}
        to="api"
      />
    </OverviewTile>
  );
}

export function SupplyChainMttrVsSlaTile() {
  return (
    <OverviewTile title="MTTR vs. SLA">
      <PlainMttrVsSlaTile
        dataFetcher={useInject().supplyChainOverview.getMttrVsSlaStats}
        to="supplyChain"
      />
    </OverviewTile>
  );
}

export function SecretsMttrVsSlaTile() {
  return (
    <OverviewTile title="MTTR vs. SLA">
      <PlainMttrVsSlaTile
        dataFetcher={useInject().secretsOverview.getMttrVsSlaStats}
        to="secrets"
      />
    </OverviewTile>
  );
}

export function OssMttrVsSlaTile() {
  return (
    <OverviewTile title="MTTR vs. SLA">
      <PlainMttrVsSlaTile dataFetcher={useInject().ossOverview.getMttrVsSlaStats} to="oss" />
    </OverviewTile>
  );
}

export function SastMttrVsSlaTile() {
  return (
    <MttrVsSlaTile title="MTTR vs. SLA">
      <PlainMttrVsSlaTile dataFetcher={useInject().sastOverview.getMttrVsSlaStats} to="sast" />
    </MttrVsSlaTile>
  );
}

function PlainMttrVsSlaTile({
  dataFetcher,
  to,
}: {
  dataFetcher: (args: { filters }) => Promise<MttrVsSlaStatItem[]>;
  to?: string;
}) {
  const { organization, application } = useInject();
  const { activeFilters = {} } = useOverviewFilters();

  const [mttrVsSla, slaSettings] = useSuspense([
    [dataFetcher, { filters: activeFilters }] as const,
    [organization.getRiskSLASettings] as const,
  ]);
  const isEmptyState = application.isFeatureEnabled(FeatureFlag.EmptyStates);

  const hasSlaSetting = Object.values(slaSettings).some(item => Boolean(item));
  const relatedPath = to ? `/risks/${to}` : '/risks';

  const customEmptyStateCTA = isEmptyState ? (
    <Button to="/settings/general" variant={Variant.SECONDARY} endIcon="Arrow" size={Size.LARGE}>
      Create global SLA
    </Button>
  ) : undefined;

  return (
    <OverviewStateBoundary
      isEmpty={!mttrVsSla.length}
      noData={isEmptyState && !hasSlaSetting}
      customEmptyStateCTA={customEmptyStateCTA}>
      <MTTRItemsContainer>
        {mttrVsSla.map((item, index) => (
          <MttrVsSlaItem key={index} item={item} relatedPath={relatedPath} />
        ))}
      </MTTRItemsContainer>
      <MttrVsSlaLegend />
    </OverviewStateBoundary>
  );
}

const MTTRItemsContainer = styled.div`
  width: 82rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 2rem auto;
`;

const MttrVsSlaItem = styled(
  ({ item, relatedPath, ...props }: { item: MttrVsSlaStatItem; relatedPath: string }) => {
    const mttrDistanceFromMeanTime = item.mttrStats?.meanTimeInHours
      ? useDistanceDate(
          new Date().getTime() + hoursToMilliseconds(item.mttrStats?.meanTimeInHours),
          0,
          {
            strict: true,
            roundingMethod: 'ceil',
            unit: item.mttrStats?.meanTimeInHours <= 24 ? 'hour' : null,
          }
        )
      : null;
    const makeOverviewUrl = useMakeOverviewUrl();
    const mttrInDays = (item.mttrStats?.meanTimeInHours ?? 0) / 24;
    const slaValue = item.slaStats.slaValue || 0;
    const [timePeriod, timeUnit] = mttrDistanceFromMeanTime?.split(' ') ?? [];
    const maxValue = Math.ceil(slaValue * 1.1);
    const currentDate = new Date();
    const twoYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 2));
    const trackAnalytics = useTrackAnalytics();

    return (
      <Tooltip
        content={
          slaValue
            ? `View ${item.mttrStats?.riskLevel?.toLowerCase()} risks out of SLA`
            : 'SLA is not defined'
        }>
        <Link
          {...props}
          to={makeOverviewUrl({
            baseUrl: relatedPath,
            query: {
              RiskLevel: item.mttrStats ? [item.mttrStats.riskLevel] : [],
              DueDate: [twoYearsAgo, currentDate],
            },
          })}
          onClick={() =>
            trackAnalytics(AnalyticsEventName.ActionClicked, {
              [AnalyticsDataField.ActionType]: 'Tile click',
              [AnalyticsDataField.TileName]: 'MTTR vs SLA',
            })
          }>
          <GaugeContainer>
            <Gauge
              value={mttrInDays > 0 && typeof mttrInDays === 'number' ? Math.ceil(mttrInDays) : 0}
              tickValue={slaValue}
              minValue={0}
              maxValue={maxValue}
              width={220}
              height={200}
            />
          </GaugeContainer>
          <RiskLevelDisplayName riskLevel={_.camelCase(item.mttrStats?.riskLevel)}>
            {humanize(item.mttrStats?.riskLevel)}
          </RiskLevelDisplayName>
          <Heading>{timePeriod ?? '-'}</Heading>
          <Paragraph>{humanize(timeUnit)}</Paragraph>
        </Link>
      </Tooltip>
    );
  }
)`
  height: 36rem;
  width: 30rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  overflow: visible;
  margin: 0 2.5rem;

  ${Heading} {
    position: absolute;
    font-size: var(--font-size-xxl);
    margin-bottom: 10rem;
  }

  ${Paragraph} {
    position: absolute;
    font-size: var(--font-size-xs);
    margin-bottom: 0;
  }

  ${Tooltip} {
    translate: 0 10rem;
  }
`;

const RiskLevelDisplayName = styled.span<{
  riskLevel: string;
}>`
  position: absolute;
  font-size: var(--font-size-s);
  font-weight: 500;
  margin-top: 13rem;
`;

const GaugeContainer = styled.div`
  height: 48rem;
`;

const MttrVsSlaLegend = styled((props: StyledProps) => {
  const { organization } = useInject();
  const slaData = useSuspense(organization.getRiskSLASettings);
  return (
    <div {...props}>
      {Object.values(slaData).some(sla => sla !== 0) ? (
        '*SLA (days)'
      ) : (
        <Button variant={Variant.TERTIARY} endIcon="Arrow" to="settings/general">
          Set SLA
        </Button>
      )}
    </div>
  );
})`
  display: flex;
  justify-content: center;
  line-height: 0;
  font-size: var(--font-size-s);
  translate: 0 -3rem;

  ${Button} {
    translate: 0 -5rem;
  }
`;

const MttrVsSlaTile = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <OverviewTile
      interactiveTooltip
      title={title}
      infoTooltipContent={
        <>
          The scale is set dynamically according to the{' '}
          <Link to="/settings/general"> SLA definition</Link>
        </>
      }>
      {children}
    </OverviewTile>
  );
};
