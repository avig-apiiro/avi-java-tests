import _ from 'lodash';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { makeUrl } from '@src-v2/utils/history-utils';

export const riskOrder = ['low', 'medium', 'high', 'critical'];

export const riskLevelToRiskOrder: Record<RiskLevel, number> = {
  None: 0,
  AutoIgnored: 1,
  Ignored: 2,
  Accepted: 3,
  Low: 4,
  Medium: 5,
  High: 6,
  Critical: 7,
};

export const noRisk = 'none';

export function getRiskColor({ riskLevel }: { riskLevel: string }): string {
  switch (riskLevel) {
    case 'critical':
      return 'var(--risk-color-critical)';
    case 'high':
      return 'var(--risk-color-high)';
    case 'medium':
      return 'var(--risk-color-medium)';
    case 'low':
      return 'var(--risk-color-low)';
    case 'accepted':
    case 'compliant':
      return 'var(--color-success)';
    default:
      return 'var(--risk-color-none)';
  }
}

// TODO: this will be removed once backend will sort this
export const riskLevelWorkAround = (cvssScore: number, severity: string): string => {
  if (!_.isNil(severity) && (_.isNil(cvssScore) || cvssScore === 0)) {
    return severity;
  }
  if (cvssScore < 4) {
    return RiskLevel.Low;
  }
  if (cvssScore >= 4 && cvssScore < 7) {
    return RiskLevel.Medium;
  }
  if (cvssScore >= 7 && cvssScore < 9) {
    return RiskLevel.High;
  }
  return RiskLevel.Critical;
};

export function getRiskTextColor({ riskLevel }: { riskLevel: string }) {
  return riskLevel === 'low' ? 'var(--color-yellow-45)' : getRiskColor({ riskLevel });
}

export function getTextOverRiskColor({ riskLevel }: { riskLevel: string }): string {
  switch (riskLevel) {
    case 'critical':
    case 'high':
    case 'medium':
      return 'var(--color-white)';
    case 'accepted':
    case 'low':
    default:
      return 'var(--default-text-color)';
  }
}

export function getRiskGradientColor({ riskLevel }: { riskLevel: string }): string {
  switch (riskLevel) {
    case 'critical':
      return 'var(--risk-gradient-critical)';
    case 'high':
      return 'var(--risk-color-high)';
    default:
      return 'var(--risk-color-none)';
  }
}

export function getHighestRiskLevel(riskLevels: RiskLevel[]) {
  const highestIndex = _.max(riskLevels.map(risk => riskOrder.indexOf(risk.toLowerCase())));
  return riskOrder[highestIndex];
}

export function getRiskUrl({
  key: triggerKey,
  riskCategory,
  relatedEntity,
  applications: [application] = [],
}: RiskTriggerSummaryResponse) {
  if (!relatedEntity) {
    return makeUrl(`${window.location.origin}/risks`, {
      trigger: triggerKey,
    });
  }
  let profileUrl = `repositories/${relatedEntity.key}`;
  let riskUrl: string;
  switch (riskCategory.toLowerCase()) {
    case 'design':
      riskUrl = 'design';
      if (!_.isEmpty(application)) {
        profileUrl = `applications/${application.key}`;
      }
      break;
    case 'branch protection':
    case 'pipeline misconfigurations':
    case 'permissions':
      riskUrl = 'supplyChain';
      break;
    default:
      riskUrl = 'development';
  }

  return makeUrl(`${window.location.origin}/profiles/${profileUrl}/risk/${riskUrl}`, {
    trigger: triggerKey,
  });
}
