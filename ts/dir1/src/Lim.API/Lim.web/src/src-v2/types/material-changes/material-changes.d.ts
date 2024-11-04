export type ThenSubType = 'Added' | 'Removed' | 'Upgraded' | 'Downgraded' | 'Altered' | 'Modified';

export type AbnormalBehaviorType =
  | 'DormantRepositoryAnomaly'
  | 'DormantDeveloperAnomaly'
  | 'DormantRepositoryDeveloperAnomaly';

export interface MaterialChange {
  governanceRule: string;
  abnormalBehavior: AbnormalBehaviorType;
  thenSubType?: ThenSubType;
  commitSha: string;
  dismissed: boolean;
  governanceRuleKey: string;
  isPartial: boolean;
  key: string;
  moduleKeys: [];
  orderByValue: string;
  relatedFilePath?: string;
  repositoryKey?: string;
  riskLevel: string;
  ruleThenIndexes: number[];
  ruleWhenIndexes: number[];
  timelineEventKey: string;
  isAutoIgnored?: boolean;
}
