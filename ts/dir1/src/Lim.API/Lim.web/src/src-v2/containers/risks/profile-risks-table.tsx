import { Strong, TextLink } from '@src-v2/components/typography';
import {
  ActionsMenuCell,
  ActionsTakenCell,
  ComponentCell,
  DiscoveryDateCell,
  DueDateCell,
  GroupCell,
  LocationCell,
  MainContributorCell,
  ModuleNameCell,
  RiskCategoryCell,
  RiskIconCell,
  RiskInsightsCell,
  RuleNameCell,
  ServerUrlCell,
  SourceCell,
  TeamsCell,
} from '@src-v2/containers/risks/risks-common-cells';
import { RisksContext } from '@src-v2/containers/risks/risks-context';
import { RisksTable } from '@src-v2/containers/risks/risks-table';
import { useInject } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useFilters } from '@src-v2/hooks/use-filters';
import { DevPhase } from '@src-v2/types/enums/dev-phase';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { Column } from '@src-v2/types/table';
import { makeUrl } from '@src-v2/utils/history-utils';

export function ProfileRisksTable({
  profile: { key: profileKey },
  profileType,
  devPhase,
}: {
  profile: { key: string };
  profileType: string;
  devPhase: DevPhase;
}) {
  const { risks } = useInject();
  const { activeFilters } = useFilters();

  const dataModel = useDataTable(
    risks.searchRisks,
    {
      key: `profile-risk-table-${devPhase}`,
      columns: tableColumns,
      searchParams: {
        profileKey,
        profileType,
        devPhase,
      },
    },
    risks.getTotalCount,
    risks.getFilteredCount
  );

  const scopeFilterName = (profileType: string) => {
    switch (profileType) {
      case 'ApplicationProfile':
      case 'OrgTeamProfile':
        return 'AssetCollectionKeys';
      case 'RepositoryProfile':
        return 'RepositoryKeys';
      case 'ModuleProfile':
        return 'ModuleRepositoryAndRoot';
      default:
        throw new Error(`Unsupported scope: ${profileType}`);
    }
  };
  return (
    <RisksContext risksService={risks} title="Profile risks">
      <RisksTable
        hideExport
        dataModel={dataModel}
        filterOptionsFetcherParams={{
          profileType,
          devPhase,
        }}
        actions={
          <TextLink
            to={makeUrl('/risks', {
              fl: {
                ...activeFilters,
                [scopeFilterName(profileType)]: { values: [profileKey] },
              },
            })}>
            View in <Strong>All Risks</Strong>
          </TextLink>
        }
      />
    </RisksContext>
  );
}

const tableColumns: Column<RiskTriggerSummaryResponse>[] = [
  {
    key: 'risk-column',
    label: 'Risk level',
    width: '28rem',
    resizeable: false,
    fieldName: 'RiskLevel',
    sortable: true,
    Cell: props => <RiskIconCell hasOverride={false} {...props} />,
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
    Cell: ComponentCell,
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
];
