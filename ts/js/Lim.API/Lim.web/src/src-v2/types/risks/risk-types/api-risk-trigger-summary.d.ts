import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export interface ApiRiskTriggerSummary extends RiskTriggerSummaryResponse {
  technology: string;
  httpMethod: string;
  httpRoute: string;
}
