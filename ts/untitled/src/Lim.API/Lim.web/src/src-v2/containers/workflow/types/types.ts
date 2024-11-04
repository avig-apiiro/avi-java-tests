export type GivenType =
  | 'MaterialChange'
  | 'RiskAdded'
  | 'RiskResolved'
  | 'PullRequest'
  | 'PullRequestMerged'
  | 'Issue'
  | 'QuestionnaireCompleted'
  | 'Server'
  | 'Build';

export type GivenSubType =
  | 'Project'
  | 'Repository'
  | 'AssetCollection'
  | 'Team'
  | 'QuestionnaireTemplate';

export type WhenType =
  | 'DiffBasedLabel'
  | 'Risk'
  | 'IssueLabel'
  | 'QuestionnaireScore'
  | 'NewProject'
  | 'NewRepository'
  | 'GovernanceViolationName'
  | 'GovernanceViolationRisk'
  | 'GovernanceViolationTag'
  | 'RiskChangeType';

export type ThenType =
  | 'AddLabel'
  | 'AddTitleReviewer'
  | 'AddUserReviewer'
  | 'FailPullRequest'
  | 'AzureDevops'
  | 'BuildReportViolations'
  | 'Comment'
  | 'Github'
  | 'Gitlab'
  | 'GoogleChat'
  | 'Jira'
  | 'Questionnaire'
  | 'Slack'
  | 'Teams'
  | 'Webhook';

export type RiskChange = 'New' | 'Existing' | 'Resolved';

export const scmProviders = ['Github', 'Gitlab', 'Bitbucket'] as const;
export const messagingProviders = ['Slack', 'Teams', 'GoogleChat'] as const;
export const ticketingProviders = ['Jira', 'AzureDevops', 'Github', 'Gitlab'] as const;
export const anyOption = { key: 'any', value: 'any', name: 'any' } as const;
export const OpenIssueInSameRepositoryOption = {
  name: 'Open in same repository',
  key: 'OpenIssueInSameRepository',
} as const;

export const ApplicationDefaultProjectOption = {
  name: 'Applications default project',
  key: 'ApplicationDefaultCommunication__ApplicationDefaultCommunication',
} as const;

export const TeamDefaultProjectOption = {
  name: 'Team default project',
  key: 'TeamDefaultCommunication__TeamDefaultCommunication',
} as const;

export const alwaysEnabledThenTypes: ThenType[] = [
  'AddLabel',
  'Webhook',
  'Comment',
  'AddUserReviewer',
  'AddTitleReviewer',
  'FailPullRequest',
  'Questionnaire',
  'BuildReportViolations',
];

export type AdditionalProperty = {
  key?: string;
  displayName: string;
  type?: 'text' | 'developer' | 'password' | 'labelOnly';
  multi?: true;
  options?: { key: string; displayName: string }[];
  placeholder?: string;
  optionsKey?: string;
};

export type Option = {
  key?: string;
  displayName: string;
  risk?: string;
  optionsKey?: string;
  options?: Option[];
  additionalProperties?: AdditionalProperty[];
  required?: boolean;
  type?: 'text' | 'developer' | 'labelOnly' | 'password';
  placeholder?: string;
  allowEmptySelection?: boolean;
  allowDuplication?: boolean;
  optionsProvidedExternally?: true;
  creatable?: true;
  customSchema?: true;
  icon?: string;
};

export interface WorkflowOptions {
  given: Record<
    GivenType,
    {
      displayName: string;
      subTypes?: {
        key?: string;
        displayName: string;
        options?: Option[];
        additionalProperties?: AdditionalProperty[];
      }[];
    }
  >;
  when: Record<WhenType, Option>;
  then: Record<
    ThenType,
    Option & {
      provider?:
        | (typeof scmProviders)[number]
        | (typeof messagingProviders)[number]
        | (typeof ticketingProviders)[number];
    }
  >;
}
