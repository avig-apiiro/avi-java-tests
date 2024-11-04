import { ExternalProvider } from '@src-v2/types/enums/external-provider';
import { SecretExposure, Validity } from '@src-v2/types/inventory-elements';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export interface SecretRiskTriggerSummary extends RiskTriggerSummaryResponse {
  secretHash: string;
  platform: ExternalProvider;
  validity: Validity;
  exposure: SecretExposure;
  count: number;
}
