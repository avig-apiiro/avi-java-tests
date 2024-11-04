import styled from 'styled-components';
import { CodeBadge } from '@src-v2/components/badges';
import { BaseIcon, LanguageIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText, Paragraph, Small } from '@src-v2/components/typography';
import {
  ActionsMenuCell,
  ActionsTakenCell,
  DiscoveryDateCell,
  DueDateCell,
  GroupCell,
  LocationCell,
  MainContributorCell,
  ModuleNameCell,
  RiskCategoryCell,
  RiskIconCell,
  RiskInsightsCell,
  RiskStatusCell,
  RuleNameCell,
  ServerUrlCell,
  SourceCell,
  TagCell,
  TeamsCell,
} from '@src-v2/containers/risks/risks-common-cells';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { ApiRiskTriggerSummary } from '@src-v2/types/risks/risk-types/api-risk-trigger-summary';
import { Column } from '@src-v2/types/table';

const LanguageCell = styled(({ data, ...props }: { data: ApiRiskTriggerSummary }) => (
  <Table.CenterCell {...props}>
    {data.technology && (
      <Tooltip content={data.technology}>
        <LanguageIcon name={data.technology} />
      </Tooltip>
    )}
  </Table.CenterCell>
))`
  ${BaseIcon} {
    background-color: var(--color-blue-30);
    padding: 1rem;
    border-radius: 100vmax;
  }
`;

const ApiEndpointCell = styled(({ data, ...props }: { data: ApiRiskTriggerSummary }) => (
  <Table.CenterCell {...props}>
    <Small>
      <EllipsisText>{data.codeReference?.relativeFilePath} </EllipsisText>
    </Small>
    <Paragraph>
      <CodeBadge size={Size.XSMALL}>{data.httpMethod}</CodeBadge>
      <EllipsisText>{data.httpRoute}</EllipsisText>
    </Paragraph>
  </Table.CenterCell>
))`
  flex-direction: column;
  gap: 1rem;

  ${Small} {
    width: 100%;
    font-size: var(--font-size-xs);
  }

  ${Paragraph} {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
  }
`;

export const apiTableColumns: Column<RiskTriggerSummaryResponse>[] = [
  {
    key: 'risk-status',
    label: 'Risk status',
    minWidth: '36rem',
    width: '36rem',
    resizeable: false,
    Cell: RiskStatusCell,
  },
  {
    key: 'risk-column',
    label: 'Risk level',
    width: '28rem',
    resizeable: false,
    fieldName: 'RiskLevel',
    sortable: true,
    Cell: RiskIconCell,
  },
  {
    key: 'rule-name',
    label: 'Policy name',
    fieldName: 'RuleName',
    sortable: true,
    Cell: RuleNameCell,
  },
  {
    key: 'component',
    label: 'Component',
    fieldName: 'RiskName',
    minWidth: '30rem',
    Cell: ApiEndpointCell,
  },
  {
    key: 'module-name',
    label: 'Code module',
    fieldName: 'ModuleName',
    minWidth: '35rem',
    sortable: false,
    Cell: ({ data }) => <ModuleNameCell moduleName={data.moduleName} />,
  },
  {
    key: 'insights',
    label: 'Insights',
    minWidth: '30rem',
    Cell: RiskInsightsCell,
  },
  {
    key: 'language',
    label: 'Language',
    fieldName: 'Technology',
    sortable: false,
    minWidth: '30rem',
    Cell: LanguageCell,
  },
  {
    key: 'app-repo',
    label: 'Application/Repository',
    minWidth: '50rem',
    Cell: LocationCell,
  },
  {
    key: 'teams',
    label: 'Teams',
    minWidth: '50rem',
    Cell: TeamsCell,
    betaFeature: FeatureFlag.OrgTeams,
  },
  {
    key: 'discovered-on',
    label: 'Discovered on',
    fieldName: 'Discovered',
    minWidth: '36rem',
    sortable: true,
    Cell: DiscoveryDateCell,
  },
  {
    key: 'main-contributor',
    label: 'Main contributor',
    minWidth: '39rem',
    width: '39rem',
    resizeable: false,
    Cell: MainContributorCell,
  },
  {
    key: 'source',
    label: 'Source',
    minWidth: '23rem',
    resizeable: false,
    Cell: SourceCell,
  },
  {
    key: 'risk-category',
    label: 'Risk category',
    fieldName: 'RiskCategory',
    sortable: true,
    Cell: RiskCategoryCell,
  },
  {
    key: 'actions-taken',
    label: 'Actions taken',
    minWidth: '35rem',
    Cell: ActionsTakenCell,
  },
  {
    key: 'actions-menu',
    label: '',
    width: '10rem',
    draggable: false,
    resizeable: false,
    Cell: ActionsMenuCell,
  },
  {
    key: 'due-date',
    fieldName: 'DueDate',
    label: 'Due date',
    minWidth: '36rem',
    width: '36rem',
    sortable: true,
    hidden: true,
    Cell: DueDateCell,
  },
  {
    key: 'repository-group',
    label: 'Repository Group',
    minWidth: '20rem',
    sortable: true,
    hidden: true,
    Cell: GroupCell,
  },
  {
    key: 'repository-tag',
    label: 'Repository tag',
    width: '50rem',
    Cell: ({ data }) => <TagCell tags={data.repositoryTags} />,
    hidden: true,
    betaFeature: FeatureFlag.RepositoryTagFilter,
  },
  {
    key: 'application-tag',
    label: 'Application tag',
    Cell: ({ data }) => <TagCell tags={data.applicationTags} />,
    hidden: true,
    betaFeature: FeatureFlag.ApplicationTagFilter,
  },
  {
    key: 'server-url',
    label: 'Server URL',
    minWidth: '20rem',
    hidden: true,
    Cell: ServerUrlCell,
  },
];
