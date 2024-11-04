import { RiskStatus } from '@src-v2/types/enums/risk-level';
import { RiskLevel } from '@src-v2/types/enums/riskLevel';

export interface RiskOverrideData {
  riskLevel: RiskLevel;
  riskStatus: RiskStatus;
  user: string;
  reason: string;
  timestamp: Date;
  changedByType: 'Api' | 'User';
}
