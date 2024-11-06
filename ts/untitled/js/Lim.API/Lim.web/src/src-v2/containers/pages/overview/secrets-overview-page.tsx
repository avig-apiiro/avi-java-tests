import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { OverviewTilesGrid } from '@src-v2/components/overview/overview-tiles';
import { SecretsManualRemediationActionLinesTile } from '@src-v2/containers/overview/tiles/manual-remediation-action-lines-tile';
import { SecretsMttrVsSlaTile } from '@src-v2/containers/overview/tiles/mttr-vs-sla-tile';
import { SecretsOpenRisksTile } from '@src-v2/containers/overview/tiles/open-risks-tile';
import { RisksByAgeAndSeverityTile } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/risk-age-severity-tile';
import { SecretsRisksFunnelTile } from '@src-v2/containers/overview/tiles/risks-funnel-tile';
import { SecretsRisksStatusLineTile } from '@src-v2/containers/overview/tiles/risks-status-line-tile';
import { SecretCommonExternalProviderKeysTile } from '@src-v2/containers/overview/tiles/secret-common-external-provider-keys-tile';
import { TopRepositoriesSecretsTile } from '@src-v2/containers/overview/tiles/top-repositories-tile';
import { SecretsTopRisksTile } from '@src-v2/containers/overview/tiles/top-risks-tiles';
import { ValidSecretsTile } from '@src-v2/containers/overview/tiles/valid-secrets-tile/valid-secrets-tile';
import { BaseOverviewPage } from '@src-v2/containers/pages/overview/base-overview-page';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default function () {
  const { secretsOverview, application } = useInject();

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Secrets dashboard' }}>
      <BaseOverviewPage
        title="Secrets Dashboard"
        filtersFetcher={useInject().secretsOverview.getFilterOptions}>
        <OverviewTilesGrid>
          {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) ? (
            <SecretsRisksFunnelTile />
          ) : (
            <SecretsOpenRisksTile />
          )}

          <SecretsMttrVsSlaTile />
          <RisksByAgeAndSeverityTile solutionsOverview={secretsOverview} baseUrl="/risks/secrets" />
          <SecretsRisksStatusLineTile />
          <SecretsTopRisksTile />
          <TopRepositoriesSecretsTile />
          <ValidSecretsTile />
          <SecretsManualRemediationActionLinesTile />
          <SecretCommonExternalProviderKeysTile />
        </OverviewTilesGrid>
      </BaseOverviewPage>
    </AnalyticsLayer>
  );
}
