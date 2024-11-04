import { WorkflowOptions } from '@src-v2/containers/workflow/types/types';

export const workflowOptions: WorkflowOptions = {
  given: {
    MaterialChange: {
      displayName: 'Material Change',
      subTypes: [
        {
          key: 'Any',
          displayName: 'anywhere',
        },
        {
          key: 'Repository',
          displayName: 'repository',
          options: [
            {
              key: 'any',
              displayName: 'Any',
            },
          ],
          additionalProperties: [
            {
              key: 'Module',
              displayName: 'Module',
              optionsKey: 'modules',
            },
          ],
        },
        {
          key: 'AssetCollection',
          displayName: 'application',
          options: [
            {
              key: 'any',
              displayName: 'Any',
            },
          ],
        },
        {
          key: 'Team',
          displayName: 'team',
          options: [
            {
              key: 'any',
              displayName: 'Any',
            },
          ],
        },
      ],
    },
    RiskAdded: {
      displayName: 'Risk Added',
      subTypes: [
        {
          key: 'Any',
          displayName: 'anywhere',
        },
        {
          key: 'Repository',
          displayName: 'in repository',
          additionalProperties: [],
        },
        {
          key: 'AssetCollection',
          displayName: 'in application',
        },
        {
          key: 'Team',
          displayName: 'in team',
          options: [
            {
              key: 'any',
              displayName: 'Any',
            },
          ],
        },
      ],
    },
    RiskResolved: {
      displayName: 'Risk Resolved',
      subTypes: [
        {
          key: 'Any',
          displayName: 'anywhere',
        },
        {
          key: 'Repository',
          displayName: 'in repository',
          additionalProperties: [],
        },
        {
          key: 'AssetCollection',
          displayName: 'in application',
        },
        {
          key: 'Team',
          displayName: 'in team',
          options: [
            {
              key: 'any',
              displayName: 'Any',
            },
          ],
        },
      ],
    },
    QuestionnaireCompleted: {
      displayName: 'Questionnaire',
      subTypes: [
        {
          key: 'Any',
          displayName: 'from any template',
        },
        {
          key: 'QuestionnaireTemplate',
          displayName: 'from template',
          options: [],
        },
      ],
    },
    Issue: {
      displayName: 'Issue',
      subTypes: [
        {
          key: 'Any',
          displayName: 'anywhere',
        },
        {
          key: 'Project',
          displayName: 'in project',
        },
        {
          key: 'AssetCollection',
          displayName: 'in application',
        },
      ],
    },
    PullRequest: {
      displayName: 'Pull request opened/updated',
      subTypes: [
        {
          key: 'Any',
          displayName: 'anywhere',
        },
        {
          key: 'Repository',
          displayName: 'in repository',
          additionalProperties: [
            {
              key: 'Module',
              displayName: 'Module',
              optionsKey: 'modules',
            },
          ],
        },
        {
          key: 'AssetCollection',
          displayName: 'in application',
        },
        {
          key: 'Team',
          displayName: 'in team',
          options: [
            {
              key: 'any',
              displayName: 'Any',
            },
          ],
        },
      ],
    },
    PullRequestMerged: {
      displayName: 'Pull request merged',
      subTypes: [
        {
          key: 'Any',
          displayName: 'anywhere',
        },
        {
          key: 'Repository',
          displayName: 'in repository',
        },
        {
          key: 'AssetCollection',
          displayName: 'in application',
        },
      ],
    },
    Server: {
      displayName: 'Server',
    },
    Build: {
      displayName: 'Build analysis request',
      subTypes: [
        {
          key: 'Any',
          displayName: 'anywhere',
        },
        {
          key: 'Repository',
          displayName: 'in repository',
        },
      ],
    },
  },
  when: {
    DiffBasedLabel: {
      displayName: 'Type of change',
      options: null,
    },
    IssueLabel: {
      displayName: 'Change',
      allowEmptySelection: true,
      options: null,
    },
    QuestionnaireScore: {
      displayName: 'Its score is equal to or larger than',
      options: null,
      type: 'text',
    },
    NewProject: {
      displayName: 'Discover new project',
      options: [
        {
          key: 'private',
          displayName: 'private',
        },
        {
          key: 'public',
          displayName: 'public',
        },
        {
          key: 'any',
          displayName: 'any',
        },
      ],
    },
    NewRepository: {
      displayName: 'Discover new repository',
      options: [
        {
          key: 'private',
          displayName: 'private',
        },
        {
          key: 'public',
          displayName: 'public',
        },
        {
          key: 'any',
          displayName: 'any',
        },
      ],
    },
    GovernanceViolationName: {
      displayName: 'Policy name',
      options: null,
    },
    GovernanceViolationTag: {
      displayName: 'Policy tag',
      options: null,
    },
    RiskChangeType: {
      displayName: 'Risk change type',
    },
    Risk: {
      displayName: 'Risk',
      options: [
        {
          key: 'Critical',
          displayName: 'Critical',
          risk: 'Critical',
        },
        {
          key: 'High',
          displayName: 'High',
          risk: 'High',
        },
        {
          key: 'Medium',
          displayName: 'Medium',
          risk: 'Medium',
        },
        {
          key: 'Low',
          displayName: 'Low',
          risk: 'Low',
        },
      ],
    },
    GovernanceViolationRisk: {
      displayName: 'Risk',
      options: [
        {
          key: 'Critical',
          displayName: 'Critical',
          risk: 'Critical',
        },
        {
          key: 'High',
          displayName: 'High',
          risk: 'High',
        },
        {
          key: 'Medium',
          displayName: 'Medium',
          risk: 'Medium',
        },
        {
          key: 'Low',
          displayName: 'Low',
          risk: 'Low',
        },
      ],
    },
  },
  then: {
    Comment: {
      displayName: 'Comment on pull request',
      additionalProperties: [
        {
          key: 'SecureCodeWarrior',
          displayName: 'Provide a link to Secure Code Warrior',
          type: 'labelOnly',
        },
      ],
    },
    BuildReportViolations: {
      displayName: 'Break the build flow',
    },
    FailPullRequest: {
      displayName: 'Block merge of pull request',
      additionalProperties: [
        {
          key: 'OnTimeout',
          displayName: 'In case of timeout',

          options: [
            {
              key: 'Fail',
              displayName: 'Block the pull request',
            },
            {
              key: 'Pass',
              displayName: "Don't block the pull request",
            },
          ],
        },
      ],
    },
    AddUserReviewer: {
      displayName: 'Add user as reviewer',
      type: 'developer',
    },
    AddLabel: {
      displayName: 'Add label',
      type: 'text',
    },
    AddTitleReviewer: {
      displayName: 'Add point of contact as reviewer',
      additionalProperties: [
        {
          key: 'fallback',
          displayName: 'fallback to',
          type: 'developer',
          placeholder: 'username',
        },
      ],
      allowDuplication: true,
    },

    Github: {
      displayName: 'Create a GitHub issue',
      provider: 'Github',
      additionalProperties: [
        {
          key: 'Assignee',
          displayName: 'Assign user',
          type: 'text',
        },
        {
          key: 'AssignCommitter',
          displayName: 'Set committer as assignee',
          type: 'labelOnly',
        },
        {
          key: 'AssignMainContributor',
          displayName: 'Set main contributor as assignee',
          type: 'labelOnly',
        },
        {
          key: 'AssignTitle',
          displayName: 'Assign to a point of contact',
        },
        {
          key: 'Label',
          displayName: 'Add label',
          type: 'text',
        },
        {
          key: 'Watcher',
          displayName: 'Add watcher',
          type: 'text',
        },
        {
          key: 'SecureCodeWarrior',
          displayName: 'Provide a link to Secure Code Warrior',
          type: 'labelOnly',
        },
        {
          key: 'DataContext',
          displayName: 'Provide a link to',

          options: [
            {
              key: 'Apiiro',
              displayName: 'Apiiro',
            },
            {
              key: 'Developer',
              displayName: 'source code',
            },
          ],
        },
      ],
    },
    Gitlab: {
      displayName: 'Create a Gitlab issue',
      provider: 'Gitlab',
      additionalProperties: [
        {
          key: 'Assignee',
          displayName: 'Assign user',
          type: 'text',
        },
        {
          key: 'AssignCommitter',
          displayName: 'Set committer as assignee',
          type: 'labelOnly',
        },
        {
          key: 'AssignMainContributor',
          displayName: 'Set main contributor as assignee',
          type: 'labelOnly',
        },
        {
          key: 'AssignTitle',
          displayName: 'Assign to a point of contact',
        },
        {
          key: 'Label',
          displayName: 'Add label',
          type: 'text',
        },
        {
          key: 'SecureCodeWarrior',
          displayName: 'Provide a link to Secure Code Warrior',
          type: 'labelOnly',
        },
        {
          key: 'DataContext',
          displayName: 'Provide a link to',
          options: [
            {
              key: 'Apiiro',
              displayName: 'Apiiro',
            },
            {
              key: 'Developer',
              displayName: 'source code',
            },
          ],
        },
      ],
    },
    Jira: {
      displayName: 'Create a Jira Ticket',
      provider: 'Jira',
      customSchema: true,
    },
    AzureDevops: {
      displayName: 'Create an AzureDevops Work Item',
      provider: 'AzureDevops',
      customSchema: true,
    },
    Slack: {
      provider: 'Slack',
      displayName: 'Send a Slack Message',
      creatable: true,
      additionalProperties: [
        {
          key: 'DataContext',
          displayName: 'Provide a link to',
          options: [
            {
              key: 'Apiiro',
              displayName: 'Apiiro',
            },
            {
              key: 'Developer',
              displayName: 'source code',
            },
          ],
        },

        {
          key: 'SecureCodeWarrior',
          displayName: 'Provide a link to Secure Code Warrior',
          type: 'labelOnly',
        },
      ],
    },
    Teams: {
      provider: 'Teams',
      displayName: 'Send a Teams Message',
      additionalProperties: [
        {
          key: 'DataContext',
          displayName: 'Provide a link to',
          options: [
            {
              key: 'Apiiro',
              displayName: 'Apiiro',
            },
            {
              key: 'Developer',
              displayName: 'source code',
            },
          ],
        },
        {
          key: 'SecureCodeWarrior',
          displayName: 'Provide a link to Secure Code Warrior',
          type: 'labelOnly',
        },
      ],
    },
    GoogleChat: {
      provider: 'GoogleChat',
      displayName: 'Send a Google Chat Message',
      additionalProperties: [
        {
          key: 'DataContext',
          displayName: 'Provide a link to',
          options: [
            {
              key: 'Apiiro',
              displayName: 'Apiiro',
            },
            {
              key: 'Developer',
              displayName: 'source code',
            },
          ],
        },
        {
          key: 'SecureCodeWarrior',
          displayName: 'Provide a link to Secure Code Warrior',
          type: 'labelOnly',
        },
      ],
    },
    Webhook: {
      icon: 'WebhookLogo',
      displayName: 'Send a webhook',
      type: 'text',
      additionalProperties: [
        {
          key: 'Version',
          displayName: 'API Version',
          options: [
            {
              key: 'v1',
              displayName: 'v1',
            },
            {
              key: 'v2',
              displayName: 'v2',
            },
          ],
        },
        {
          key: 'AuthorizationHeader',
          displayName: 'Authorization Header',
          type: 'password',
        },
      ],
    },
    Questionnaire: {
      displayName: 'Create a questionnaire',
      icon: 'Apiiro',
    },
  },
};
