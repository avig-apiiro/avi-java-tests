import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { OverviewTilesGrid } from '@src-v2/components/overview/overview-tiles';
import { AbnormalCommitsLineTile } from '@src-v2/containers/overview/tiles/abnormal-commits-line-tile';
import { SupplyChainManualRemediationActionLinesTile } from '@src-v2/containers/overview/tiles/manual-remediation-action-lines-tile';
import { SupplyChainMttrVsSlaTile } from '@src-v2/containers/overview/tiles/mttr-vs-sla-tile';
import { SupplyChainOpenRisksTile } from '@src-v2/containers/overview/tiles/open-risks-tile';
import { RisksByAgeAndSeverityTile } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/risk-age-severity-tile';
import { SupplyChainRisksFunnelTile } from '@src-v2/containers/overview/tiles/risks-funnel-tile';
import { SupplyChainRisksStatusLineTile } from '@src-v2/containers/overview/tiles/risks-status-line-tile';
import { SupplyChainRiskyPipelinesLineTile } from '@src-v2/containers/overview/tiles/risky-pipelines-over-time-line-tile';
import { TopRepositoriesInactiveContributorsSupplyChainTile } from '@src-v2/containers/overview/tiles/top-repositories-inactive-contributors-tile';
import { TopRepositoriesSupplyChainTile } from '@src-v2/containers/overview/tiles/top-repositories-tile';
import { SupplyChainTopRisksTile } from '@src-v2/containers/overview/tiles/top-risks-tiles';
import { BaseOverviewPage } from '@src-v2/containers/pages/overview/base-overview-page';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default function () {
  const { supplyChainOverview, application } = useInject();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Supply chain dashboard' }}>
      <BaseOverviewPage
        title="Supply chain dashboard"
        filtersFetcher={supplyChainOverview.getFilterOptions}>
        <OverviewTilesGrid>
          {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) ? (
            <SupplyChainRisksFunnelTile />
          ) : (
            <SupplyChainOpenRisksTile />
          )}

          <SupplyChainMttrVsSlaTile />
          <RisksByAgeAndSeverityTile
            solutionsOverview={supplyChainOverview}
            baseUrl="/risks/supplyChain"
          />
          <SupplyChainRisksStatusLineTile />
          {application.isFeatureEnabled(FeatureFlag.SupplyChainDashboardAdditionalTiles) && (
            <SupplyChainRiskyPipelinesLineTile />
          )}
          <SupplyChainTopRisksTile />
          <TopRepositoriesSupplyChainTile />
          {application.isFeatureEnabled(FeatureFlag.SupplyChainDashboardAdditionalTiles) && (
            <TopRepositoriesInactiveContributorsSupplyChainTile />
          )}
          <SupplyChainManualRemediationActionLinesTile />
          {application.isFeatureEnabled(FeatureFlag.SupplyChainDashboardAbnormalCommitsTile) && (
            <AbnormalCommitsLineTile />
          )}
        </OverviewTilesGrid>
      </BaseOverviewPage>
    </AnalyticsLayer>
  );
}
