import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { OverviewTilesGrid } from '@src-v2/components/overview/overview-tiles';
import { ApiManualRemediationActionLinesTile } from '@src-v2/containers/overview/tiles/manual-remediation-action-lines-tile';
import { ApiMttrVsSlaTile } from '@src-v2/containers/overview/tiles/mttr-vs-sla-tile';
import { ApiOpenRisksTile } from '@src-v2/containers/overview/tiles/open-risks-tile';
import { RisksByAgeAndSeverityTile } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/risk-age-severity-tile';
import { ApiRisksFunnelTile } from '@src-v2/containers/overview/tiles/risks-funnel-tile';
import { ApiRisksStatusLineTile } from '@src-v2/containers/overview/tiles/risks-status-line-tile';
import { TopRepositoriesApiTile } from '@src-v2/containers/overview/tiles/top-repositories-tile';
import { ApiTopRisksTile } from '@src-v2/containers/overview/tiles/top-risks-tiles';
import { BaseOverviewPage } from '@src-v2/containers/pages/overview/base-overview-page';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default function () {
  const { apiSecurityOverview, application } = useInject();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'API dashboard' }}>
      <BaseOverviewPage
        title="API Security Dashboard"
        filtersFetcher={apiSecurityOverview.getFilterOptions}>
        <OverviewTilesGrid>
          {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) ? (
            <ApiRisksFunnelTile />
          ) : (
            <ApiOpenRisksTile />
          )}

          <ApiMttrVsSlaTile />

          <RisksByAgeAndSeverityTile solutionsOverview={apiSecurityOverview} baseUrl="/risks/api" />

          <ApiRisksStatusLineTile />
          <ApiTopRisksTile />
          <ApiManualRemediationActionLinesTile />
          <TopRepositoriesApiTile />
        </OverviewTilesGrid>
      </BaseOverviewPage>
    </AnalyticsLayer>
  );
}
