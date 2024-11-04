import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { useAdditionalProperties } from '@src-v2/containers/workflow/hooks/use-additional-properties';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';
import { ThenType } from '@src-v2/containers/workflow/types/types';
import {
  WorkflowLabel,
  WorkflowRemoteSelectControl,
  WorkflowSelectControl,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { useInject, useSuspense } from '@src-v2/hooks';
import { SearchParams } from '@src-v2/services';
import { Provider } from '@src-v2/types/enums/provider';
import { StubAny } from '@src-v2/types/stub-any';
import { humanize } from '@src-v2/utils/string-utils';

export const TicketingProjectControl = ({
  data: { type: provider, subType: projectKey, index },
}: {
  data: any;
}) => {
  const { setValue, workflowType } = useWorkflowEditor({ step: 'then' });
  return (
    <>
      <AsyncBoundary>
        <ProjectSelect
          projectKey={projectKey}
          workflowType={workflowType}
          provider={provider}
          index={index}
          name={`then[${index}].subType`}
          onSelect={() => {
            setValue(`then[${index}].value`, null);
            setValue(`then[${index}].additionalProperties`, []);
          }}
        />
      </AsyncBoundary>
      <WorkflowLabel>Issue type</WorkflowLabel>
      <AsyncBoundary>
        <IssueTypeSelect projectKey={projectKey} provider={provider} index={index} />
      </AsyncBoundary>
    </>
  );
};

const ProjectSelect = ({ provider, projectKey, index, workflowType, ...props }: StubAny) => {
  const { workflows } = useInject();

  const { setValue } = useWorkflowEditor({ step: 'then' });
  const initialProjectValue = useSuspense(workflows.getProject, {
    key: projectKey,
  }) as { name: string };

  const monitoredTicketingProjects = useSuspense(workflows.getMonitoredTicketingProjects, {
    provider,
    withCreateIssuesPermission: true,
    searchTerm: '',
  });

  const searchProjects = useCallback(
    async () =>
      await workflows.getMonitoredTicketingProjects({
        provider,
        withCreateIssuesPermission: true,
        searchTerm: '',
      }),
    [provider]
  );

  useEffect(() => {
    if (!initialProjectValue) {
      setValue(`then[${index}].subType`, monitoredTicketingProjects[0]);
    }
  }, [provider, workflowType]);

  return (
    <WorkflowRemoteSelectControl
      {...props}
      name={props.name}
      multiple={false}
      placeholder="Select project"
      itemToString={item => item?.name ?? initialProjectValue?.name}
      searchMethod={searchProjects}
      defaultValue={initialProjectValue}
    />
  );
};

const IssueTypeSelect = ({ index, provider, projectKey }: StubAny) => {
  const { workflows } = useInject();
  const {
    workflowState: { isReadonly, then },
    setValue,
  } = useWorkflowEditor({ step: 'then' });

  const selectedIssueType = then[index].value;
  const project = then[index].subtype;

  const { resetAdditionalProperties } = useAdditionalProperties(true, index);

  const issueTypes = useSuspense(workflows.getIssueTypeOptions, {
    isCustomSchema: true,
    provider,
    projectKey: projectKey?.key ?? projectKey,
  });

  useEffect(() => {
    const isIssueTypeInitialized = Boolean(selectedIssueType?.value);
    if (selectedIssueType && !isIssueTypeInitialized) {
      const [initialIssueTypeKey] = selectedIssueType;
      setValue(
        `then[${index}].value`,
        issueTypes.find((issueType: StubAny) => issueType?.key === initialIssueTypeKey)
      );
    }
  }, [selectedIssueType]);

  useEffect(() => {
    if (isReadonly) {
      return;
    }
    if (selectedIssueType?.additionalProperties) {
      resetAdditionalProperties(selectedIssueType?.additionalProperties ?? []);
    }
  }, [project]);

  return (
    <WorkflowSelectControl
      items={issueTypes}
      placeholder="Select an issue type"
      itemToString={(item: StubAny) =>
        item?.displayName
          ? humanize(item.displayName)
          : getInitialIssueTypeDisplayName(item, issueTypes)
      }
      name={`then[${index}].value`}
      onSelect={({ selectedItem }: StubAny) => {
        const currentValue = selectedIssueType?.value;
        const nextValue = selectedItem?.value;
        if (currentValue !== nextValue) {
          resetAdditionalProperties(selectedItem?.additionalProperties ?? []);
        }
      }}
    />
  );
};

export const getInitialIssueTypeDisplayName = (
  value: string,
  options: { key: string; displayName: string }[]
) => {
  return options?.find(option => option?.key === value)?.displayName;
};

export const SearchContributorsControl = ({ name }: StubAny) => {
  const { workflows } = useInject();

  const { watch } = useFormContext();
  const searchTerm = watch(name);

  const initialValue = useSuspense(workflows.getContributor, {
    key: searchTerm ?? '',
  }) as unknown as { name: string };

  const items = useSuspense(workflows.searchContributors, { searchTerm });

  return (
    <WorkflowSelectControl
      itemToString={(item: StubAny) => item?.displayName ?? ''}
      name={`${name}-key`}
      placeholder="Search for a contributor"
      items={items}
      defaultValue={initialValue}
    />
  );
};

export const RepositoryProjectControl = ({
  type,
  onSelect,
  ...props
}: {
  type: ThenType;
  onSelect: (value: StubAny) => void;
  name: string;
}) => {
  const { projects, workflows } = useInject();
  const { watch, setValue } = useFormContext();
  const value = watch(props.name)?.[0];

  const initialValue = useSuspense(workflows.getProject, {
    key: value,
  });

  useEffect(() => {
    if (initialValue && !value?.[0]?.name) {
      setValue(props.name, initialValue);
    }
  }, []);

  const handleSearch = useCallback(
    async (searchParams: SearchParams) => {
      const projectsData = await projects.searchMonitoredProjects({
        provider: type as Provider,
        ...searchParams,
      });
      return {
        ...projectsData,
        items: [
          ...(!searchParams.pageNumber ? workflows.getThenSubTypeSpecialOptions() : []),
          ...projectsData.items,
        ],
      };
    },
    [type]
  );

  return (
    <SelectControlV2
      {...props}
      placeholder="Select a repository"
      clearable={false}
      searchMethod={handleSearch}
      getOptionLabel={(option: StubAny) => option.name}
      onChange={onSelect}
      fitMenuToContent
    />
  );
};

export const MessagingProviderControl = ({
  type,
  ...props
}: {
  type: ThenType;
  name: string;
  onSelect?: () => void;
  selectedItems?: string[];
  creatable?: boolean;
}) => {
  const { workflows } = useInject();
  const channels = useSuspense(workflows.getThenValueOptions, { type });

  return (
    <WorkflowSelectControl
      {...props}
      placeholder={`Select a ${type} channel`}
      itemToString={(item: StubAny) =>
        channels.find(channel => channel.key === item)?.displayName ??
        item?.displayName ??
        item?.label ??
        ''
      }
      items={channels}
      defaultValue={channels[0]}
    />
  );
};

export const ReviewerControl = (props: StubAny) => {
  const { workflows } = useInject();

  const reviewers = useSuspense(workflows.getThenValueOptions, { type: 'AddTitleReviewer' });

  return (
    <WorkflowSelectControl
      {...props}
      placeholder="Select a reviewer"
      itemToString={(item: StubAny) => item?.displayName ?? item ?? ''}
      items={reviewers}
    />
  );
};
