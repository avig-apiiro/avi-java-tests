import { GivenType, ThenType, WhenType } from '@src-v2/containers/workflow/types/types';
import { Application } from '@src-v2/services';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export const givenTypes: GivenType[] = [
  'MaterialChange',
  'RiskAdded',
  'RiskResolved',
  'PullRequest',
  'PullRequestMerged',
  'Issue',
  'QuestionnaireCompleted',
  'Server',
  'Build',
];

type GivenWhenTypeMapping = {
  whenType: WhenType;
  mutuallyExcludes?: WhenType[];
  requiresFeatureFlag?: FeatureFlag[];
};

export const givenTypeToWhenTypes: {
  [Key in GivenType]: GivenWhenTypeMapping[];
} = {
  MaterialChange: [{ whenType: 'DiffBasedLabel' }, { whenType: 'Risk' }],
  RiskAdded: [
    { whenType: 'GovernanceViolationName' },
    { whenType: 'GovernanceViolationTag' },
    { whenType: 'GovernanceViolationRisk' },
  ],
  RiskResolved: [
    { whenType: 'GovernanceViolationName' },
    { whenType: 'GovernanceViolationTag' },
    { whenType: 'GovernanceViolationRisk' },
  ],
  PullRequest: [
    {
      whenType: 'DiffBasedLabel',
      mutuallyExcludes: ['GovernanceViolationTag', 'GovernanceViolationName', 'RiskChangeType'],
    },
    {
      whenType: 'Risk',
      mutuallyExcludes: ['GovernanceViolationTag', 'GovernanceViolationName', 'RiskChangeType'],
    },
    {
      whenType: 'GovernanceViolationTag',
      mutuallyExcludes: ['DiffBasedLabel', 'Risk'],
      requiresFeatureFlag: [FeatureFlag.SmartPolicyRisksInPr],
    },
    {
      whenType: 'RiskChangeType',
      mutuallyExcludes: ['DiffBasedLabel', 'Risk'],
      requiresFeatureFlag: [FeatureFlag.SmartPolicyRisksInPr],
    },
    {
      whenType: 'GovernanceViolationName',
      mutuallyExcludes: ['DiffBasedLabel', 'Risk'],
      requiresFeatureFlag: [FeatureFlag.SmartPolicyRisksInPr],
    },
  ],
  PullRequestMerged: [
    {
      whenType: 'DiffBasedLabel',
      mutuallyExcludes: ['GovernanceViolationTag', 'GovernanceViolationName', 'RiskChangeType'],
    },
    {
      whenType: 'Risk',
      mutuallyExcludes: ['GovernanceViolationTag', 'GovernanceViolationName', 'RiskChangeType'],
    },
    {
      whenType: 'GovernanceViolationTag',
      mutuallyExcludes: ['DiffBasedLabel', 'Risk'],
      requiresFeatureFlag: [FeatureFlag.SmartPolicyRisksInPr],
    },
    {
      whenType: 'RiskChangeType',
      mutuallyExcludes: ['DiffBasedLabel', 'Risk'],
      requiresFeatureFlag: [FeatureFlag.SmartPolicyRisksInPr],
    },
    {
      whenType: 'GovernanceViolationName',
      mutuallyExcludes: ['DiffBasedLabel', 'Risk'],
      requiresFeatureFlag: [FeatureFlag.SmartPolicyRisksInPr],
    },
  ],
  Issue: [{ whenType: 'IssueLabel' }],
  QuestionnaireCompleted: [{ whenType: 'QuestionnaireScore' }],
  Build: [{ whenType: 'GovernanceViolationName' }, { whenType: 'GovernanceViolationRisk' }],
  Server: [{ whenType: 'NewProject' }, { whenType: 'NewRepository' }],
};

export function permissibleWhenTypes(
  application: Application,
  given: GivenType,
  existingWhenTypes: WhenType[]
): WhenType[] {
  const existingWhenTypesSet = new Set(existingWhenTypes);
  return givenTypeToWhenTypes[given]
    .filter(
      whenTypeMapping =>
        (!whenTypeMapping.requiresFeatureFlag ||
          !whenTypeMapping.requiresFeatureFlag.find(
            requiredFlag => !application.isFeatureEnabled(requiredFlag)
          )) &&
        !existingWhenTypesSet.has(whenTypeMapping.whenType) &&
        !whenTypeMapping.mutuallyExcludes?.find(excludedType =>
          existingWhenTypesSet.has(excludedType)
        )
    )
    .map(whenTypeMapping => whenTypeMapping.whenType);
}

export const givenTypeToThenTypes: {
  [Key in GivenType]: ThenType[];
} = {
  Build: ['BuildReportViolations'],
  RiskAdded: ['Github', 'Gitlab', 'Jira', 'AzureDevops', 'Slack', 'Teams', 'GoogleChat'],
  RiskResolved: ['Github', 'Gitlab', 'Jira', 'AzureDevops', 'Slack', 'Teams', 'GoogleChat'],
  Server: ['Github', 'Gitlab', 'Jira', 'AzureDevops', 'Slack', 'Teams', 'GoogleChat'],
  MaterialChange: [
    'Github',
    'Gitlab',
    'Jira',
    'AzureDevops',
    'Slack',
    'Teams',
    'GoogleChat',
    'Webhook',
  ],
  Issue: [
    'Github',
    'Gitlab',
    'Jira',
    'AzureDevops',
    'Slack',
    'Teams',
    'GoogleChat',
    'Webhook',
    'Questionnaire',
  ],
  QuestionnaireCompleted: ['Jira'],
  PullRequestMerged: ['Github', 'Gitlab', 'Jira', 'AzureDevops', 'Slack', 'Teams', 'GoogleChat'],
  PullRequest: [
    'Comment',
    'AddUserReviewer',
    'FailPullRequest',
    'AddLabel',
    'AddTitleReviewer',
    'Slack',
    'Teams',
    'GoogleChat',
    'Webhook',
  ],
};

export const consumablesMap = {
  Repositories: { title: 'Source Code', path: 'sourceCode' },
  IssueProjects: { title: 'Ticketing System', path: 'ticketingSystem' },
  Messaging: { title: 'Communication', path: 'communication' },
  SecurityScans: { title: 'Security', path: 'security' },
  FindingsReports: { title: 'Security', path: 'security' },
  Identities: { title: 'Identities', path: 'identity' },
  ApiGateways: { title: 'API Gateway', path: 'apiGateways' },
} as const;
