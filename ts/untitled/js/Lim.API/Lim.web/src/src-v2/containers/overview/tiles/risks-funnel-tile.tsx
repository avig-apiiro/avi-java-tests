import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { SegmentContainer } from '@src-v2/components/charts/funnel-chart/funnel-chart';
import { OverviewTile } from '@src-v2/components/overview/overview-tiles';
import { useMakeOverviewUrl } from '@src-v2/containers/overview/tiles/utils';
import { RisksFunnel } from '@src-v2/containers/risks/funnels/risks-funnel';
import { RisksFunnelDataProvider } from '@src-v2/containers/risks/funnels/risks-funnel-data-provider';
import { RisksContext, useRisksContext } from '@src-v2/containers/risks/risks-context';
import { risksFunnelColors } from '@src-v2/data/risks-funnel';
import { useInject } from '@src-v2/hooks';
import { ActiveFiltersData } from '@src-v2/hooks/use-filters';
import { getRiskyRiskLevels } from '@src-v2/types/enums/risk-level';
import { StyledProps } from '@src-v2/types/styled';

export const PlainRisksFunnelTile = styled((props: StyledProps) => {
  return (
    <OverviewTile
      timeFilterInsensitive
      tileContainer={FunnelContainer}
      {...props}
      title="Contextual prioritization funnel ">
      <FunnelContainer>
        <RisksFunnelElement />
      </FunnelContainer>
    </OverviewTile>
  );
})`
  grid-column: 1 / -1;
  height: 60rem;

  ${SegmentContainer}[data-selected-scope]:hover {
    background-color: var(--color-blue-gray-15);
  }
`;

const RisksFunnelElement = () => {
  const { risksService, baseUrl } = useRisksContext();
  const makeOverviewUrl = useMakeOverviewUrl();
  const history = useHistory();

  const handleSearchFunnel = useCallback(
    params =>
      risksService.searchFunneledRisksCount({
        ...params,
        bySeverity: true,
      }),
    []
  );

  const handleSegmentClick = useCallback(
    (segmentFilters: ActiveFiltersData) =>
      history.push(
        makeOverviewUrl({
          baseUrl,
          query: {
            RiskLevel: [...getRiskyRiskLevels()],
            ...segmentFilters,
          },
          customParams: {
            divideFunnelBy: 'severity',
          },
        })
      ),
    [baseUrl]
  );

  return (
    <RisksFunnelDataProvider storagePrefix="Dashboard">
      <RisksFunnel
        readOnly
        enablePopoverClick
        dataFetcher={handleSearchFunnel}
        baseUrl={baseUrl}
        colorsMapper={risksFunnelColors.bySeverity}
        onSegmentClick={handleSegmentClick}
      />
    </RisksFunnelDataProvider>
  );
};

const FunnelContainer = styled.div``;

export const ApiRisksFunnelTile = () => {
  const { apiRisks } = useInject();
  return (
    <RisksContext risksService={apiRisks} baseUrl="/risks/api">
      <PlainRisksFunnelTile />
    </RisksContext>
  );
};

export const OssRisksFunnelTile = () => {
  const { ossRisks } = useInject();
  return (
    <RisksContext risksService={ossRisks} baseUrl="/risks/oss">
      <PlainRisksFunnelTile />
    </RisksContext>
  );
};

export const SastRisksFunnelTile = () => {
  const { sastRisks } = useInject();
  return (
    <RisksContext risksService={sastRisks} baseUrl="/risks/sast">
      <PlainRisksFunnelTile />
    </RisksContext>
  );
};
export const SecretsRisksFunnelTile = () => {
  const { secretsRisks } = useInject();
  return (
    <RisksContext risksService={secretsRisks} baseUrl="/risks/secrets">
      <PlainRisksFunnelTile />
    </RisksContext>
  );
};

export const SupplyChainRisksFunnelTile = () => {
  const { supplyChainRisks } = useInject();
  return (
    <RisksContext risksService={supplyChainRisks} baseUrl="/risks/supplyChain">
      <PlainRisksFunnelTile />
    </RisksContext>
  );
};

export const AllRisksFunnelTile = () => {
  const { risks } = useInject();
  return (
    <RisksContext risksService={risks}>
      <PlainRisksFunnelTile />
    </RisksContext>
  );
};
