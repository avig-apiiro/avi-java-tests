import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectControl } from '@src-v2/components/forms/form-controls';
import { CreateIssueModal } from '@src-v2/containers/modals/issues/create-issue-modal';
import { LinkExistingTicketModal } from '@src-v2/containers/modals/issues/link-existing-ticket-modal';
import {
  SummaryFieldPathToProvider,
  TicketingProviders,
} from '@src-v2/data/ticketing-issues-provider';
import { useInject, useSuspense } from '@src-v2/hooks';

export function AzureDevopsModal(props) {
  return <CreateIssueModal {...props} provider={TicketingProviders.AzureDevops} />;
}

export function GithubModal(props) {
  return <CreateIssueModal {...props} provider={TicketingProviders.Github} />;
}

export function JiraModal(props) {
  return <CreateIssueModal {...props} provider={TicketingProviders.Jira} />;
}

export function LinkExistingJiraTicketModal(props) {
  return <LinkExistingTicketModal {...props} />;
}

const githubDefaultSchema = {
  requiredFields: [],
  additionalFields: [
    {
      key: 'description',
      label: 'Add Additional Description',
      type: 'string',
      isDefault: true,
    },
    { key: 'assignee', label: 'Assign User', type: 'user', isDefault: true },
    {
      key: 'labels',
      label: 'Add Labels',
      isDefault: true,
      component: function LabelsSelectControl(props) {
        const { profiles } = useInject();
        const { watch } = useFormContext();
        const project = watch('project');

        const labels = (
          useSuspense(profiles.getGithubProjectLabels, {
            projectKey: project?.key,
          }) as any[]
        ).map(label => ({ value: label, label }));

        return <SelectControl {...props} multiple items={labels} disabled={!labels?.length} />;
      },
    },
  ],
};

export function useProviderModalSettings(provider): {
  summaryFieldKey: string;
  descriptionFieldKey: string;
  noIssueType?: boolean;
  defaultSchema?: { requiredFields: any[]; additionalFields: any[] };
  withCreateIssuesPermission?: boolean;
  showLinkToCode?: boolean;
} {
  return useMemo(() => {
    const baseSettings = {
      summaryFieldKey: SummaryFieldPathToProvider[provider]?.join('.') ?? 'summary',
      descriptionFieldKey: 'fieldsValues.description',
    };

    switch (provider) {
      case TicketingProviders.Jira:
        return {
          ...baseSettings,
          withCreateIssuesPermission: true,
        };
      case TicketingProviders.AzureDevops:
        return {
          ...baseSettings,
          descriptionFieldKey: 'fieldsValues.System.Description',
          showLinkToCode: true,
        };
      case TicketingProviders.Github:
        return {
          ...baseSettings,
          noIssueType: true,
          showLinkToCode: true,
          defaultSchema: githubDefaultSchema,
        };
      default:
        console.warn(`Unsupported provider: ${provider}`);
        return null;
    }
  }, [provider]);
}
