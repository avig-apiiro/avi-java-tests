import { ReactNode } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { OverviewTilesGrid } from '@src-v2/components/overview/overview-tiles';
import { SLATile } from '@src-v2/containers/overview/tiles/SLA-tile';
import { AbnormalCommitsLineTile } from '@src-v2/containers/overview/tiles/abnormal-commits-line-tile';
import { AppsByBusinessImpactAndScore } from '@src-v2/containers/overview/tiles/apps-by-BI-and-score';
import { CoverageSummaryTile } from '@src-v2/containers/overview/tiles/coverage-summary-tile/coverage-summary-tile';
import { ManualRemediationActionLinesTile } from '@src-v2/containers/overview/tiles/manual-remediation-action-lines-tile';
import { GeneralMttrVsSlaTile } from '@src-v2/containers/overview/tiles/mttr-vs-sla-tile';
import { OpenRisksTile } from '@src-v2/containers/overview/tiles/open-risks-tile';
import { PullRequestsVelocityTile } from '@src-v2/containers/overview/tiles/pull-requests-velocity-tile';
import { RisksByAgeAndSeverityTile } from '@src-v2/containers/overview/tiles/risks-by-age-and-severity/risk-age-severity-tile';
import { AllRisksFunnelTile } from '@src-v2/containers/overview/tiles/risks-funnel-tile';
import { RisksStatusLineTile } from '@src-v2/containers/overview/tiles/risks-status-line-tile';
import { RiskyCommitsLineTile } from '@src-v2/containers/overview/tiles/risky-commits-line-tile';
import { SupplyChainRiskyPipelinesLineTile } from '@src-v2/containers/overview/tiles/risky-pipelines-over-time-line-tile';
import { RiskScoreTrendTile } from '@src-v2/containers/overview/tiles/risky-score-trend-tile';
import { TopRepositoriesInactiveContributorsSupplyChainTile } from '@src-v2/containers/overview/tiles/top-repositories-inactive-contributors-tile';
import { TopRepositoriesGeneralTile } from '@src-v2/containers/overview/tiles/top-repositories-tile';
import { TopRiskScoreApplications } from '@src-v2/containers/overview/tiles/top-risk-score-applicaitons-tile';
import { TopRiskScoreRepositories } from '@src-v2/containers/overview/tiles/top-risk-score-repositories-tile';
import { TopRiskScoreOrgTeams } from '@src-v2/containers/overview/tiles/top-risk-score-teams-tile';
import {
  ApiTopRisksTile,
  GeneralTopRisksTile,
  OssTopRisksTile,
  RiskyIssuesTopRisksTile,
  SecretsTopRisksTile,
  SupplyChainTopRisksTile,
} from '@src-v2/containers/overview/tiles/top-risks-tiles';
import { UnprotectedRepositoriesTile } from '@src-v2/containers/overview/tiles/unprotected-repositories-tile';
import { ValidSecretsTile } from '@src-v2/containers/overview/tiles/valid-secrets-tile/valid-secrets-tile';
import { WorkflowRemediationActionsTile } from '@src-v2/containers/overview/tiles/workflow-remediation-actions-tile';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function GeneralDashboardTilesLayout({
  showMultiAssetsTiles,
  children,
}: {
  showMultiAssetsTiles?: boolean;
  children?: ReactNode;
}) {
  const { params } =
    useRouteMatch<{
      profileType: string;
    }>('/profiles/:profileType') ?? {};
  const { application } = useInject();

  const hideInDashboards = (dashboardsNames: string[]) =>
    !dashboardsNames.includes(params?.profileType);

  return (
    <OverviewTilesGrid>
      {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) &&
      hideInDashboards(['teams']) ? (
        <AllRisksFunnelTile />
      ) : (
        <OpenRisksTile />
      )}
      <GeneralMttrVsSlaTile />
      <RisksStatusLineTile />
      {showMultiAssetsTiles && <PullRequestsVelocityTile />}
      {hideInDashboards(['repositories']) && <CoverageSummaryTile />}
      {showMultiAssetsTiles && <RiskyCommitsLineTile />}
      {showMultiAssetsTiles && <ManualRemediationActionLinesTile />}
      {hideInDashboards(['repositories']) && showMultiAssetsTiles && <TopRepositoriesGeneralTile />}
      {hideInDashboards(['repositories']) && <UnprotectedRepositoriesTile />}
      {application.isFeatureEnabled(FeatureFlag.RisksByAgeAndSeverityTile) && (
        <RisksByAgeAndSeverityTile />
      )}
      <GeneralTopRisksTile />

      <WorkflowRemediationActionsTile />
      <ApiTopRisksTile />
      <OssTopRisksTile />
      <SecretsTopRisksTile />
      <ValidSecretsTile />
      {application.isFeatureEnabled(FeatureFlag.SLATile) && <SLATile />}
      {application.isFeatureEnabled(FeatureFlag.SupplyChainDashboardAbnormalCommitsTile) && (
        <AbnormalCommitsLineTile />
      )}

      {application.isFeatureEnabled(FeatureFlag.RiskScore) &&
        hideInDashboards(['repositories', 'applications']) && <AppsByBusinessImpactAndScore />}
      <SupplyChainRiskyPipelinesLineTile />
      {hideInDashboards(['repositories']) && <TopRepositoriesInactiveContributorsSupplyChainTile />}

      {application.isFeatureEnabled(FeatureFlag.RiskScore) &&
        hideInDashboards(['repositories', 'applications']) && <TopRiskScoreApplications />}
      {application.isFeatureEnabled(FeatureFlag.RiskScore) &&
        hideInDashboards(['repositories']) && <TopRiskScoreRepositories />}
      {application.isFeatureEnabled(FeatureFlag.RiskScore) &&
        hideInDashboards(['repositories', 'applications']) && <TopRiskScoreOrgTeams />}
      {application.isFeatureEnabled(FeatureFlag.RiskScore) && params?.profileType && (
        <RiskScoreTrendTile />
      )}
      {application.isFeatureEnabled(FeatureFlag.SupplyChainRiskTable) && (
        <SupplyChainTopRisksTile />
      )}
      {application.isFeatureEnabled(FeatureFlag.DesignRisksV3) && <RiskyIssuesTopRisksTile />}
      {children}
    </OverviewTilesGrid>
  );
}
