import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export enum UsedInCode {
  Unknown = 'Unknown',
  NotImported = 'NotImported',
  Imported = 'Imported',
}

enum FindingSeverity {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  VeryLow = 'Very low',
  Informational = 'Informational',
  Unknown = 'Unknown',
}

interface Vulnerability {
  name: string;
  cvssScore: number;
  severity: FindingSeverity;
}

export interface OssRiskTriggerSummary extends RiskTriggerSummaryResponse {
  type: string;
  vulnerabilities: Vulnerability[];
  packageManager: { name: string; displayName: string };
  usedInCodeStatus: UsedInCode;
  licenses: string[];
}
