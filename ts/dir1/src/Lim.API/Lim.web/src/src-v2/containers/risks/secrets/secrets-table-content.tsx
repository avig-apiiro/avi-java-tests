import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { BaseIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { InsightsCell } from '@src-v2/components/table/table-common-cells/insights-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { RiskComponent } from '@src-v2/containers/risks/risk-component';
import {
  ActionsMenuCell,
  ActionsTakenCell,
  DiscoveryDateCell,
  DueDateCell,
  FileClassificationCell,
  GroupCell,
  LocationCell,
  MainContributorCell,
  ModuleNameCell,
  PlatformCell,
  RiskCategoryCell,
  RiskIconCell,
  RiskInsightsCell,
  RiskStatusCell,
  RuleNameCell,
  ServerUrlCell,
  SourceCell,
  TagCell,
  TeamsCell,
  ValidityCell,
} from '@src-v2/containers/risks/risks-common-cells';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { SecretRiskTriggerSummary } from '@src-v2/types/risks/risk-types/secret-risk-trigger-summary';
import { Column } from '@src-v2/types/table';

const SecretComponentCell = styled(({ data, ...props }: { data: SecretRiskTriggerSummary }) => {
  const { pathname } = useLocation();

  const {
    updateFilters,
    activeFilters: { SecretHash: { values: activeSecrets } = { values: [] } },
  } = useFilters();
  const isActiveFilter = activeSecrets.includes(data.secretHash);

  const applyFilter = useCallback(() => {
    updateFilters({
      //@ts-expect-error
      check: true,
      key: 'SecretHash',
      value: [...activeSecrets, data.secretHash],
    });
  }, [updateFilters, data, activeSecrets]);

  const shouldShowFilterToggle = !isActiveFilter && data.count > 0;

  const groupingPage = pathname.includes('grouping');

  return (
    <Table.FlexCell {...props}>
      {Boolean(data.codeReference?.relativeFilePath ?? data.displayName) && (
        <RiskComponent.Subtitle>
          {data.codeReference?.relativeFilePath ?? data.displayName}
        </RiskComponent.Subtitle>
      )}
      <SecretDetails>
        <RiskComponent.Title>{data.riskName}</RiskComponent.Title>
        <SecretCount>
          {shouldShowFilterToggle && !groupingPage && (
            <>
              <Tooltip content="View all occurrences of this secret">
                <IconButton
                  name="Visible"
                  onClick={event => {
                    event.stopPropagation();
                    applyFilter();
                  }}
                />
              </Tooltip>
              ~{data.count}
            </>
          )}
        </SecretCount>
      </SecretDetails>
    </Table.FlexCell>
  );
})`
  ${Table.Cell} & {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-top: 1rem;
    gap: 0;
  }

  ${BaseIcon} {
    margin-left: 2rem;
  }
`;

const ExposureInsightsCell = styled(InsightsCell)`
  justify-content: center;
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
    key: 'component',
    label: 'Component',
    fieldName: 'RiskName',
    minWidth: '65rem',
    sortable: true,
    Cell: SecretComponentCell,
  },
  {
    key: 'platform',
    label: 'Platform',
    fieldName: 'Platform',
    minWidth: '26rem',
    resizeable: false,
    Cell: PlatformCell,
  },
  {
    key: 'validity',
    label: 'Validity',
    fieldName: 'SecretValidity',
    width: '25rem',
    minWidth: '25rem',
    resizeable: false,
    Cell: ValidityCell,
  },
  {
    key: 'insights',
    label: 'Insights',
    minWidth: '30rem',
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
    key: 'file-classification',
    label: 'File Type',
    minWidth: '20rem',
    Cell: FileClassificationCell,
  },
  {
    key: 'server-url',
    label: 'Server URL',
    minWidth: '20rem',
    Cell: ServerUrlCell,
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
    key: 'exposure',
    label: 'Exposure',
    fieldName: 'SecretExposure',
    width: '25rem',
    minWidth: '25rem',
    hidden: true,
    Cell: ({ data, ...props }: { data: SecretRiskTriggerSummary }) => (
      <ExposureInsightsCell
        {...props}
        insights={[{ badge: data.exposure, sentiment: 'Neutral' }]}
      />
    ),
  },
  {
    key: 'source',
    label: 'Source',
    minWidth: '23rem',
    resizeable: false,
    hidden: true,
    Cell: SourceCell,
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

const SecretDetails = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
`;

const SecretCount = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  color: var(--color-blue-gray-65);
  font-weight: 200;

  ${BaseIcon} {
    min-width: 5rem;
    width: 5rem;
    min-height: 5rem;
    height: 5rem;
  }
`;
