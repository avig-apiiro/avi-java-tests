import { ArtifactImageIdentification } from '@src-v2/types/artifacts/artifacts-types';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export interface ArtifactDependencyFindingRiskTriggerSummary extends RiskTriggerSummaryResponse {
  artifactImageIdentifications: ArtifactImageIdentification[];
  cveIdentifiers: string[];
}
