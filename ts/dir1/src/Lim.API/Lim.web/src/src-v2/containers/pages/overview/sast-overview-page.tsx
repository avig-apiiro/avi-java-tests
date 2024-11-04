import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { OverviewTilesGrid } from '@src-v2/components/overview/overview-tiles';
import { SastManualRemediationActionLinesTile } from '@src-v2/containers/overview/tiles/manual-remediation-action-lines-tile';
import { SastMttrVsSlaTile } from '@src-v2/containers/overview/tiles/mttr-vs-sla-tile';
import { SastOpenRisksTile } from '@src-v2/containers/overview/tiles/open-risks-tile';
import { RisksByAgeAndSeverityTile } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/risk-age-severity-tile';
import { SastRisksFunnelTile } from '@src-v2/containers/overview/tiles/risks-funnel-tile';
import { SastRisksStatusLineTile } from '@src-v2/containers/overview/tiles/risks-status-line-tile';
import { TopRepositoriesSastTile } from '@src-v2/containers/overview/tiles/top-repositories-tile';
import { SastTopRisksTile } from '@src-v2/containers/overview/tiles/top-risks-tiles';
import { BaseOverviewPage } from '@src-v2/containers/pages/overview/base-overview-page';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default function () {
  const { sastOverview, application } = useInject();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'SAST dashboard' }}>
      <BaseOverviewPage title="SAST dashboard" filtersFetcher={sastOverview.getFilterOptions}>
        <OverviewTilesGrid>
          {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) ? (
            <SastRisksFunnelTile />
          ) : (
            <SastOpenRisksTile />
          )}

          <SastMttrVsSlaTile />
          <RisksByAgeAndSeverityTile solutionsOverview={sastOverview} baseUrl="/risks/sast" />
          <SastRisksStatusLineTile />
          <SastTopRisksTile />
          <TopRepositoriesSastTile />
          <SastManualRemediationActionLinesTile />
        </OverviewTilesGrid>
      </BaseOverviewPage>
    </AnalyticsLayer>
  );
}
