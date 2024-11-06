import { Application } from '@src-v2/services';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export const shouldShowExposureGraph = (
  risk: RiskTriggerSummaryResponse,
  application: Application
) => {
  if (application.isFeatureEnabled(FeatureFlag.ExposurePathV2) && risk?.exposurePath) {
    return true;
  }

  return risk?.insights.some(
    insight =>
      (insight.badge === 'Internet exposed' || insight.badge === 'Deployed') &&
      Boolean(
        insight.insights?.reasons?.some(reason => {
          return reason.insights?.clusterInsights?.length;
        })
      )
  );
};
