import { useFormContext } from 'react-hook-form';
import { WorkflowRemoteSelectControl } from '@src-v2/containers/workflow/workflow-editor-controls';
import { useInject, useSuspense } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

export const RepositorySearchControl = ({ name, ...props }: { name: string }) => {
  const { workflows } = useInject();
  const { watch } = useFormContext();
  const inputValue = watch(name);

  const selectedRepositoryKeys = inputValue
    ? inputValue.map?.((data: StubAny) => data?.key ?? data)
    : [];

  const selectedRepositories = useSuspense(
    selectedRepositoryKeys?.map((key: StubAny) => [workflows.getRepository, { key }])
  ) as string[];

  return (
    <WorkflowRemoteSelectControl
      {...props}
      selectedItems={selectedRepositories ?? null}
      searchMethod={workflows.searchRepositories}
      placeholder="Search repositories"
      itemToString={item => formatRepositoryItem(item)}
      getIconName={item => item?.server?.providerGroup ?? item?.value?.server?.providerGroup}
      name={name}
    />
  );
};

export const ApplicationSearchControl = ({ name, ...props }: { name: string }) => {
  const { workflows } = useInject();
  const { watch } = useFormContext();
  const inputValue = watch(name);
  const selectedKeys = inputValue ? inputValue.map?.((data: StubAny) => data?.key ?? data) : [];

  const selectedApplications = useSuspense(
    selectedKeys?.map((key: string) => [workflows.getApplication, { key }])
  ) as string[];

  return (
    <WorkflowRemoteSelectControl
      {...props}
      searchMethod={workflows.searchApplications}
      itemToString={item => item?.uniqueName ?? item?.name ?? item}
      selectedItems={selectedApplications ?? null}
      placeholder="Search applications"
      name={name}
    />
  );
};

export const TeamSearchControl = ({ name, ...props }: { name: string }) => {
  const { workflows } = useInject();
  const { watch } = useFormContext();
  const inputValue = watch(name);
  const selectedKeys = inputValue ? inputValue.map?.((data: StubAny) => data?.key ?? data) : [];

  const selectedTeams = useSuspense(
    selectedKeys?.map((key: string) => [workflows.getTeam, { key }])
  ) as string[];

  return (
    <WorkflowRemoteSelectControl
      {...props}
      searchMethod={workflows.searchTeams}
      itemToString={item => item?.uniqueName ?? item?.name ?? item}
      selectedItems={selectedTeams ?? null}
      placeholder="Search teams"
      name={name}
    />
  );
};

export const ProjectsSearchControl = ({ name, ...props }: { name: string }) => {
  const { workflows } = useInject();
  const { watch } = useFormContext();
  const inputValue = watch(name);
  const selectedKeys = inputValue ? inputValue.map?.((data: StubAny) => data?.key ?? data) : [];
  const selectedProjects = useSuspense(
    selectedKeys?.map((key: string) => [workflows.getProject, { key }])
  ) as string[];

  return (
    <WorkflowRemoteSelectControl
      {...props}
      searchMethod={workflows.searchProjects}
      itemToString={item => item?.name ?? item}
      selectedItems={selectedProjects ?? null}
      placeholder="Search projects"
      name={name}
    />
  );
};

export const QuestionnaireTemplateSearchControl = ({ name, ...props }: { name: string }) => {
  const { workflows } = useInject();
  const { watch } = useFormContext();
  const inputValue = watch(name);
  const selectedKeys = inputValue ? inputValue.map?.((data: StubAny) => data?.key ?? data) : [];

  const selectedTemplates = useSuspense(
    (selectedKeys ?? []).map((key: string) => [workflows.getQuestionnaireTemplate, { key }])
  ) as string[];

  return (
    <WorkflowRemoteSelectControl
      {...props}
      multiple={false}
      searchMethod={workflows.getQuestionnaireTemplates}
      itemToString={item => item?.title ?? ''}
      selectedItems={selectedTemplates ?? null}
      placeholder="Search Templates"
      name={name}
    />
  );
};

export const ServerSearchControl = ({ name, ...props }: { name: string }) => {
  const { workflows } = useInject();

  return (
    <WorkflowRemoteSelectControl
      {...props}
      name={name}
      multiple
      itemToString={item => item?.name ?? item}
      searchMethod={workflows.searchServers}
      placeholder="Add servers"
      getIconName={item => item?.providerGroup ?? item?.value?.providerGroup}
    />
  );
};

const formatRepositoryItem = (item: StubAny) => {
  if (!item) {
    return '';
  }
  if (typeof item === 'string') {
    return item;
  }
  const { name, referenceName } = item;
  return referenceName ? `${name} (${referenceName})` : name;
};
