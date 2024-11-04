import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import {
  ActionsMenuCell,
  ActionsTakenCell,
  ArtifactCell,
  ComponentCell,
  DiscoveryDateCell,
  DueDateCell,
  FindingComponentCell,
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
import { Column } from '@src-v2/types/table';

export const tableColumns: Column<RiskTriggerSummaryResponse>[] = [
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
    sortable: true,
    Cell: props => {
      if (props.data?.findingComponents?.length) {
        return <FindingComponentCell {...props} />;
      }

      return <ComponentCell {...props} />;
    },
  },
  {
    key: 'finding-name',
    label: 'Finding name',
    fieldName: 'findingName',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.findingName}</ClampText>
      </Table.Cell>
    ),
    hidden: true,
    betaFeature: FeatureFlag.FindingsRisk,
  },
  {
    key: 'insights',
    label: 'Insights',
    minWidth: '24rem',
    Cell: RiskInsightsCell,
  },
  {
    key: 'app-repo',
    label: 'Application/Repository',
    minWidth: '50rem',
    Cell: LocationCell,
  },
  {
    key: 'artifact',
    label: 'Artifact',
    minWidth: '50rem',
    Cell: ArtifactCell,
    betaFeature: FeatureFlag.GroupByArtifact,
  },
  {
    key: 'teams',
    label: 'Teams',
    minWidth: '50rem',
    Cell: TeamsCell,
    betaFeature: FeatureFlag.OrgTeams,
  },
  {
    key: 'risk-category',
    label: 'Risk category',
    fieldName: 'RiskCategory',
    sortable: true,
    minWidth: '35rem',
    Cell: RiskCategoryCell,
  },
  {
    key: 'discovered-on',
    fieldName: 'Discovered',
    label: 'Discovered on',
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
    key: 'server-url',
    label: 'Server URL',
    minWidth: '20rem',
    hidden: true,
    Cell: ServerUrlCell,
  },
  {
    key: 'repository-group',
    label: 'Repository Group',
    fieldName: 'RepositoryGroup',
    minWidth: '20rem',
    sortable: true,
    hidden: true,
    Cell: GroupCell,
  },
  {
    key: 'module-name',
    label: 'Code module',
    fieldName: 'ModuleName',
    minWidth: '35rem',
    sortable: false,
    hidden: true,
    Cell: ({ data }) => <ModuleNameCell moduleName={data.moduleName} />,
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
];
