import { ComplianceFrameworkReference } from '@src-v2/types/inventory-elements/code-findings';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export interface SastRiskTriggerSummary extends RiskTriggerSummaryResponse {
  complianceFrameworkReferences: ComplianceFrameworkReference[];
  issueTitle: string;
  externalType: string;
}
