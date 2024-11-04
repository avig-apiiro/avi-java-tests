import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { GroupBase } from 'react-select/dist/declarations/src/types';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ClampText } from '@src-v2/components/clamp-text';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import { useProviderModalSettings } from '@src-v2/containers/modals/issues/providers-issue-modals';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { Project } from '@src-v2/types/projects/project';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StyledProps } from '@src-v2/types/styled';

type IssueDestinationControlProps = {
  provider: ProviderGroup;
  riskData?: RiskTriggerSummaryResponse;
} & StyledProps;

type ProjectOption = Project & { label: string };

export const IssueDestinationControl = styled(
  ({ provider, riskData, ...props }: IssueDestinationControlProps) => {
    const { ticketingIssues } = useInject();
    const { noIssueType } = useProviderModalSettings(provider);
    const { watch, setValue } = useFormContext();
    const project: Project = watch('project');

    const preFilledDestination = useSuspense(ticketingIssues.getDefaultIssueDestination, {
      provider,
      riskLevel: riskData?.riskLevel,
      applicationKey: riskData?.applications?.[0]?.key,
    });

    useEffect(() => {
      if (preFilledDestination?.length !== 2) {
        return;
      }

      const [project, issueType] = convertPreFilled(preFilledDestination);
      setValue('project', project);
      setValue('issueType', issueType);
    }, [preFilledDestination]);

    return (
      <div {...props}>
        <Field>
          <Label required>Open in</Label>
          <AsyncBoundary>
            <ProjectControl provider={provider} riskData={riskData} />
          </AsyncBoundary>
        </Field>

        {!noIssueType && (
          <Field>
            <Label required>Issue Type</Label>
            <AsyncBoundary>
              <IssueTypeControl provider={provider} project={project} />
            </AsyncBoundary>
          </Field>
        )}
      </div>
    );
  }
)`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${Field} {
    flex: 1;
  }

  ${LogoSpinner} {
    height: 9rem;
  }
`;

function convertPreFilled([project, issueType]) {
  return [
    { key: project.value, name: project.label },
    { id: issueType.value, name: issueType.label },
  ];
}

function ProjectControl({
  provider,
  riskData,
}: Pick<IssueDestinationControlProps, 'provider' | 'riskData'>) {
  const { application, orgTeamProfiles, ticketingIssues } = useInject();
  const { resetField } = useFormContext();
  const { withCreateIssuesPermission } = useProviderModalSettings(provider);

  const [projects, orgTeamProjectOptions] = useSuspense([
    [
      ticketingIssues.getMonitoredProjects,
      {
        provider,
        withCreateIssuesPermission,
      },
    ] as const,
    [
      orgTeamProfiles.getTeamsCommunicationProjectOptions,
      {
        provider,
        keys: riskData?.orgTeams.map(team => team.key),
      },
    ] as const,
  ]);

  const projectOptions = useMemo<(ProjectOption | GroupBase<ProjectOption>)[]>(() => {
    const modifiedProjects = projects?.map(project => ({ ...project, label: project.name }));

    if (
      !application.isFeatureEnabled(FeatureFlag.OrgTeamsCommunication) ||
      !orgTeamProjectOptions.length
    ) {
      return modifiedProjects;
    }

    const projectsByKey = _.keyBy(projects, 'key');
    return [
      {
        label: 'OrgTeamOptionsGroup',
        options: orgTeamProjectOptions.map(response => {
          const project = projectsByKey[response.projectId];
          return {
            ...project,
            id: `${response.key}__${response.projectId}`,
            label: `${response.name} (${project.name})`,
          };
        }),
      },
      {
        label: 'channelOptionsGroup',
        options: modifiedProjects,
      },
    ];
  }, [projects, orgTeamProjectOptions]);

  const handleChange = useCallback(() => resetField('issueType'), [resetField]);

  return (
    <SelectControlV2
      rules={{ required: true }}
      name="project"
      keyBy="id"
      placeholder="Select an address..."
      options={projectOptions}
      option={({ data }) => <ClampText>{data.label}</ClampText>}
      onChange={handleChange}
    />
  );
}

function IssueTypeControl({ provider, project }) {
  const { asyncCache, ticketingIssues } = useInject();

  const searchIssueType = useCallback(async () => {
    const issueTypes = await asyncCache.suspend(ticketingIssues.getMonitoredProjectIssueTypes, {
      provider,
      projectKey: project?.key,
    });

    return issueTypes?.filter(issue => !issue.isSubTask);
  }, [provider, project]);

  return (
    <SelectControlV2
      name="issueType"
      searchable={false}
      rules={{ required: true }}
      placeholder="e.g. Story"
      searchMethod={searchIssueType}
      formatOptionLabel={option => option.name}
    />
  );
}
