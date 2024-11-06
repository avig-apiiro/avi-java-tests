import { useMemo } from 'react';
import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { Counter } from '@src-v2/components/counter';
import { HtmlMarkdown } from '@src-v2/components/html-markdown';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText } from '@src-v2/components/typography';
import { LanguagesCell } from '@src-v2/containers/connectors/management/repositories-management';
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
  RiskStatusCell,
  RuleNameCell,
  ServerUrlCell,
  SourceCell,
  TagCell,
  TeamsCell,
} from '@src-v2/containers/risks/risks-common-cells';
import { riskLevelWorkAround } from '@src-v2/data/risk-data';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import {
  OssRiskTriggerSummary,
  UsedInCode,
} from '@src-v2/types/risks/risk-types/oss-risk-trigger-summary';
import { Column } from '@src-v2/types/table';

export const mappedUsedInCode = (data?: OssRiskTriggerSummary) => {
  const usedIncCodeInsight = data?.insights?.find(
    insight => insight.badge === 'Used in code'
  )?.description;

  return {
    [UsedInCode.Imported]: {
      tooltip: usedIncCodeInsight || '',
      icon: 'Valid',
    },
    [UsedInCode.NotImported]: {
      tooltip: 'No import statements detected for this package',
      icon: 'CloseRoundedOutline',
    },
    [UsedInCode.Unknown]: {
      tooltip: 'This package is not yet included in Apiiro’s coverage.',
      icon: 'Help',
    },
  };
};

const NoCVSSData = styled.span`
  color: var(--color-blue-gray-35);
`;

const VulnerabilitiesCell = styled(({ data, ...props }: { data: OssRiskTriggerSummary }) => {
  // TODO: this will be removed once backend will sort this
  const sortedVulnerabilities = useMemo(
    () => data.vulnerabilities?.sort((first, second) => second.cvssScore - first.cvssScore),
    [data]
  );

  return (
    <Table.FlexCell {...props}>
      {data.vulnerabilities?.length > 0 && (
        <>
          <Tooltip
            content={
              sortedVulnerabilities[0].cvssScore ? (
                `CVSS Score: ${sortedVulnerabilities[0].cvssScore}`
              ) : (
                <NoCVSSData>No CVSS data</NoCVSSData>
              )
            }>
            <VulnerabilitiesRiskIcon>
              <RiskIcon
                riskLevel={riskLevelWorkAround(
                  sortedVulnerabilities[0].cvssScore,
                  sortedVulnerabilities[0].severity
                )}
              />
            </VulnerabilitiesRiskIcon>
          </Tooltip>
          <TooltipWrapper content={sortedVulnerabilities[0].name}>
            <EllipsisText>{sortedVulnerabilities[0].name}</EllipsisText>
          </TooltipWrapper>

          {data.vulnerabilities.length > 1 && (
            <Tooltip
              content={
                <>
                  {sortedVulnerabilities.slice(1, 4).map(({ name, cvssScore, severity }) => (
                    <ExtraVulnerabilitiesTooltipContent key={name}>
                      <RiskIcon riskLevel={riskLevelWorkAround(cvssScore, severity)} />
                      {name}
                    </ExtraVulnerabilitiesTooltipContent>
                  ))}
                  <div>
                    {sortedVulnerabilities.length > 4 && (
                      <>+{sortedVulnerabilities.length - 4} more</>
                    )}
                  </div>
                </>
              }>
              <Counter>+{data.vulnerabilities.length - 1}</Counter>
            </Tooltip>
          )}
        </>
      )}
    </Table.FlexCell>
  );
})`
  ${RiskIcon} {
    width: 4rem;
    height: 4rem;
  }
`;

const TooltipWrapper = styled(Tooltip)`
  max-width: 110rem;
`;

const VulnerabilitiesRiskIcon = styled.span`
  display: flex;
`;

const ExtraVulnerabilitiesTooltipContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  ${RiskIcon} {
    width: 4rem;
    height: 4rem;
  }
`;

export const UsedInCodeIcon = styled(SvgIcon)`
  &[data-type=${UsedInCode.NotImported}] {
    color: var(--color-green-45);
  }

  &[data-type=${UsedInCode.Unknown}] {
    color: var(--color-blue-gray-50);
  }

  &[data-type=${UsedInCode.Imported}] {
    color: var(--color-red-45);
  }
`;

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
    key: 'dependency-name',
    label: 'Component',
    fieldName: 'RiskName',
    Cell: ComponentCell,
  },
  {
    key: 'type',
    label: 'Type',
    fieldName: 'DependencyDeclarationType',
    sortable: true,
    Cell: ({ data, ...props }: { data: OssRiskTriggerSummary }) => (
      <Table.Cell {...props}>
        <ClampText lines={2}>{data.type}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'sca-license',
    label: 'License',
    fieldName: 'licenses',
    Cell: ({ data, ...props }: { data: OssRiskTriggerSummary }) => (
      <TrimmedCollectionCell {...props}>{data.licenses}</TrimmedCollectionCell>
    ),
    betaFeature: FeatureFlag.LicenseUsageDifferEnabled,
  },
  {
    key: 'vulnerabilities',
    label: 'Vulnerabilities',
    Cell: VulnerabilitiesCell,
  },
  {
    key: 'usedInCode',
    label: 'Used in code',
    Cell: ({ data, ...props }: { data: OssRiskTriggerSummary }) => (
      <Table.CenterCell {...props}>
        <Tooltip
          interactive
          content={
            <HtmlMarkdown>{mappedUsedInCode(data)[data.usedInCodeStatus].tooltip}</HtmlMarkdown>
          }>
          <UsedInCodeIcon
            data-type={data.usedInCodeStatus}
            name={mappedUsedInCode(data)[data.usedInCodeStatus].icon}
          />
        </Tooltip>
      </Table.CenterCell>
    ),
    width: '28rem',
    betaFeature: FeatureFlag.UsedInCode,
  },
  {
    key: 'packageManager',
    label: 'Package manager',
    Cell: ({ data, ...props }: { data: OssRiskTriggerSummary }) => {
      return (
        <Table.CenterCell {...props}>
          {data.packageManager && (
            <Tooltip content={data.packageManager.displayName}>
              <VendorIcon name={data.packageManager.name} size={Size.SMALL} />
            </Tooltip>
          )}
        </Table.CenterCell>
      );
    },
  },
  {
    betaFeature: FeatureFlag.UsedInCode,
    key: 'languages',
    label: 'Languages',
    Cell: LanguagesCell,
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
    width: '22rem',
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
    key: 'rule-name',
    label: 'Policy name',
    fieldName: 'RuleName',
    sortable: true,
    hidden: true,
    Cell: RuleNameCell,
  },
  {
    key: 'risk-category',
    label: 'Risk category',
    fieldName: 'RiskCategory',
    sortable: true,
    hidden: true,
    Cell: RiskCategoryCell,
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
