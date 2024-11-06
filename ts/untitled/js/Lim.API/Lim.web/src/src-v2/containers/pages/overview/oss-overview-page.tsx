import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { OverviewTilesGrid } from '@src-v2/components/overview/overview-tiles';
import { OssManualRemediationActionLinesTile } from '@src-v2/containers/overview/tiles/manual-remediation-action-lines-tile';
import { OssMttrVsSlaTile } from '@src-v2/containers/overview/tiles/mttr-vs-sla-tile';
import { OssOpenRisksTile } from '@src-v2/containers/overview/tiles/open-risks-tile';
import { RisksByAgeAndSeverityTile } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/risk-age-severity-tile';
import { OssRisksFunnelTile } from '@src-v2/containers/overview/tiles/risks-funnel-tile';
import { OssRisksStatusLineTile } from '@src-v2/containers/overview/tiles/risks-status-line-tile';
import { TopRepositoriesOssTile } from '@src-v2/containers/overview/tiles/top-repositories-tile';
import { OssTopRisksTile } from '@src-v2/containers/overview/tiles/top-risks-tiles';
import { BaseOverviewPage } from '@src-v2/containers/pages/overview/base-overview-page';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { TopExploitableVulnerabilitiesTile } from '../../overview/tiles/top-exploitable-vulnerabilities-tile';

export default function () {
  const { ossOverview, application } = useInject();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'OSS dashboard' }}>
      <BaseOverviewPage title="SCA Dashboard" filtersFetcher={ossOverview.getFilterOptions}>
        <OverviewTilesGrid>
          {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) ? (
            <OssRisksFunnelTile />
          ) : (
            <OssOpenRisksTile />
          )}
          <TopExploitableVulnerabilitiesTile />

          <OssMttrVsSlaTile />
          <RisksByAgeAndSeverityTile solutionsOverview={ossOverview} baseUrl="/risks/oss" />
          <OssRisksStatusLineTile />
          <OssTopRisksTile />
          <TopRepositoriesOssTile />
          <OssManualRemediationActionLinesTile />
        </OverviewTilesGrid>
      </BaseOverviewPage>
    </AnalyticsLayer>
  );
}
