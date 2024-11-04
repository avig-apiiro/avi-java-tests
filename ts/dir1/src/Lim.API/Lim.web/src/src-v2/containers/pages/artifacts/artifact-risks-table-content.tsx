import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import {
  ActionsMenuCell,
  ActionsTakenCell,
  ComponentCell,
  DiscoveryDateCell,
  DueDateCell,
  FindingComponentCell,
  MainContributorCell,
  RiskCategoryCell,
  RiskIconCell,
  RiskInsightsCell,
  RiskStatusCell,
  RuleNameCell,
  SourceCell,
} from '@src-v2/containers/risks/risks-common-cells';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { ArtifactDependencyFindingRiskTriggerSummary } from '@src-v2/types/risks/risk-types/artifact-dependency-finding-risk-trigger-summary';
import { Column } from '@src-v2/types/table';

export const artifactRiskTableColumns: Column<RiskTriggerSummaryResponse>[] = [
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
    minWidth: '65rem',
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
    key: 'artifactImageIds',
    label: 'Artifact version',
    fieldName: 'artifactImageIds',
    Cell: ({ data, ...props }: { data: ArtifactDependencyFindingRiskTriggerSummary }) => {
      return (
        <TrimmedCollectionCell
          {...props}
          searchMethod={({ item, searchTerm }) =>
            item.toLowerCase()?.includes(searchTerm?.toLowerCase())
          }>
          {data.artifactImageIdentifications.map(_ => _.imageId)}
        </TrimmedCollectionCell>
      );
    },
  },
  {
    key: 'actions-taken',
    label: 'Actions taken',
    minWidth: '35rem',
    Cell: ActionsTakenCell,
  },
  {
    key: 'vulnerability',
    label: 'Vulnerability',
    fieldName: 'cveIdentifiers',
    Cell: ({ data, ...props }: { data: ArtifactDependencyFindingRiskTriggerSummary }) => {
      return <TrimmedCollectionCell {...props}>{data.cveIdentifiers}</TrimmedCollectionCell>;
    },
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
    key: 'discovered-on',
    fieldName: 'Discovered',
    label: 'Discovered on',
    minWidth: '36rem',
    sortable: true,
    Cell: DiscoveryDateCell,
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
    key: 'actions-menu',
    label: '',
    width: '10rem',
    draggable: false,
    resizeable: false,
    Cell: ActionsMenuCell,
  },
];
