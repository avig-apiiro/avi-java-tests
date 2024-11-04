import _ from 'lodash';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import styled from 'styled-components';
import { RiskStatusIndicator } from '@src-v2/components/activity-indicator';
import { AvatarProfile } from '@src-v2/components/avatar';
import { Badge } from '@src-v2/components/badges';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { VendorCircle } from '@src-v2/components/circles';
import { ClampPath, ClampText } from '@src-v2/components/clamp-text';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { RiskDueDate } from '@src-v2/components/risk/risk-due-date';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { RiskOverrideDetails } from '@src-v2/components/risk/risk-override-details';
import { ValidityIcon, getValidityMapper } from '@src-v2/components/risk/risk-validity';
import { Table } from '@src-v2/components/table/table';
import {
  InsightsCell,
  InsightsCellProps,
} from '@src-v2/components/table/table-common-cells/insights-cell';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { DateTime, Time } from '@src-v2/components/time';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, Link } from '@src-v2/components/typography';
import { OverrideRiskStatus } from '@src-v2/containers/action-modals/override-risk/override-risk-status';
import { ActionsHistory } from '@src-v2/containers/actions-timeline/actions-history';
import { useDataTableContext } from '@src-v2/containers/data-table/data-table';
import {
  ApplicationsView,
  ConsumableProfileView,
} from '@src-v2/containers/profiles/consumable-profiles-view';
import { RiskComponent } from '@src-v2/containers/risks/risk-component';
import { RiskRowActions } from '@src-v2/containers/risks/risk-row-actions';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { dateFormats } from '@src-v2/data/datetime';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { useQueryParams, useSuspense } from '@src-v2/hooks';
import { Provider } from '@src-v2/types/enums/provider';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { SecretRiskTriggerSummary } from '@src-v2/types/risks/risk-types/secret-risk-trigger-summary';
import { StubAny } from '@src-v2/types/stub-any';
import { StyledProps } from '@src-v2/types/styled';
import { Cell } from '@src-v2/types/table';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';
import { makeUrl } from '@src-v2/utils/history-utils';

export const ComponentCell = styled<Cell<RiskTriggerSummaryResponse>>(({ data, ...props }) => (
  <Table.FlexCell {...props}>
    <RiskComponent item={data} />
  </Table.FlexCell>
))`
  ${Table.Cell} & {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 0;
  }
`;

export const FindingComponentCell: Cell<StubAny> = ({ data, ...props }) => {
  const allObjects = data.findingComponents;
  const objectsWithSubjectRole = allObjects?.filter((obj: StubAny) => obj.role === 'Subject');
  const [associatedObject] = _.isEmpty(objectsWithSubjectRole)
    ? allObjects
    : objectsWithSubjectRole;
  return (
    <DoubleLinedCell {...props}>
      <>
        {associatedObject?.componentSubtitle && (
          <ClampText>{associatedObject.componentSubtitle}</ClampText>
        )}
      </>
      <ClampText>{associatedObject?.componentTitle}</ClampText>
    </DoubleLinedCell>
  );
};

export const RiskInsightsCell: Cell<
  RiskTriggerSummaryResponse & Omit<InsightsCellProps, 'insights' | 'disableFilter'>
> = ({ data, ...props }) => (
  <InsightsCell {...props} insights={data.insights} filterKey="RiskInsights" />
);

export const ActionsTakenCell = styled<Cell<RiskTriggerSummaryResponse>>(
  observer(({ data, ...props }) => {
    const { queryParams } = useQueryParams();

    return (
      <Table.FlexCell {...props}>
        {data.actionsTakenSummaries?.map((summary, index) => (
          <ActionsHistory
            key={index}
            summary={summary}
            itemToTimelineLink={location => ({ pathname: location.pathname, query: queryParams })}
          />
        ))}
      </Table.FlexCell>
    );
  })
)`
  max-width: fit-content;
  overflow-x: hidden;
  white-space: nowrap;
  gap: 1rem;
`;

export const ActionsMenuCell = styled<Cell<RiskTriggerSummaryResponse>>(
  observer(({ data, ...props }) => {
    const { dataModel } = useDataTableContext();

    const isItemSelected = useMemo(
      () => dataModel.isItemSelected(data),
      [dataModel.selection.length, data]
    );

    return (
      <Table.FlexCell
        {...props}
        data-action-menu
        data-pinned-column={dataAttr(dataModel.isPinFeatureEnabled)}>
        <Tooltip
          content="When rows are selected, only bulk actions are available"
          disabled={!isItemSelected}>
          <RiskRowActions disabled={isItemSelected} data={data} />
        </Tooltip>
      </Table.FlexCell>
    );
  })
)`
  justify-content: center;
  padding: 0;
`;

export const RiskIconCell = styled(
  observer(
    ({
      data,
      hasOverride = true,
      ...props
    }: {
      data: RiskTriggerSummaryResponse;
      hasOverride?: boolean;
    }) => {
      return (
        <Table.CenterCell {...props}>
          <Tooltip
            content={
              data.riskOverrideData ? (
                <RiskOverrideDetails data={data.riskOverrideData} />
              ) : (
                `${data.riskLevel === 'None' ? 'No' : data.riskLevel} Risk`
              )
            }>
            <RiskIcon riskLevel={data.riskLevel} />
          </Tooltip>
        </Table.CenterCell>
      );
    }
  )
)`
  ${DropdownMenu} {
    color: var(--color-blue-gray-50);
  }
`;

export const RiskStatusCell = styled<Cell<RiskTriggerSummaryResponse>>(
  observer(({ data, ...props }) => {
    return (
      <Table.FlexCell {...props}>
        <IndicatorLabelContainer>
          <RiskStatusIndicator status={data.riskStatus} />
          {data.riskStatus}
        </IndicatorLabelContainer>
        <OverrideRiskStatus risk={data} />
      </Table.FlexCell>
    );
  })
)`
  justify-content: space-between;
  gap: 0;

  ${DropdownMenu} {
    color: var(--color-blue-gray-50);
  }
`;

const IndicatorLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const ModuleNameCell = styled(({ moduleName, ...props }: { moduleName: string }) => {
  const isPath = moduleName?.indexOf('/');
  return (
    <Table.FlexCell {...props}>
      {moduleName && (
        <>
          <SvgIcon name="Module" />
          {isPath > -1 ? <ClampPath>{moduleName}</ClampPath> : <ClampText>{moduleName}</ClampText>}
        </>
      )}
    </Table.FlexCell>
  );
})`
  ${BaseIcon} {
    width: 4rem;
    min-width: 4rem;
  }
`;

export const LocationCell = styled<Cell<RiskTriggerSummaryResponse>>(
  ({ data: { applications, relatedEntity }, ...props }) => {
    return (
      <Table.Cell {...props}>
        {Boolean(applications?.length) && <ApplicationsView applications={applications} />}
        {relatedEntity && relatedEntity.type !== 'ProjectProfile' && (
          <ConsumableProfileView
            profile={relatedEntity}
            showArchivedIndicator={false}
            isActive={relatedEntity.isActive}
          />
        )}
      </Table.Cell>
    );
  }
)`
  color: var(--color-blue-65);
  font-size: var(--font-size-s);

  ${BaseIcon} {
    width: 4rem;
    height: 4rem;
  }

  ${Link} {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export const TeamsCell: Cell<RiskTriggerSummaryResponse & StyledProps> = ({ data, ...props }) => {
  const teamsWithoutChildren = useMemo(() => {
    if (!data?.orgTeams?.length) {
      return [];
    }

    const allParentKeys = _.keyBy(data.orgTeams.map(team => team.parentKey).filter(Boolean));
    return data.orgTeams.filter(team => !allParentKeys[team.key]);
  }, [data?.orgTeams]);

  return (
    <TrimmedCollectionCell
      {...props}
      item={({ value }) => (
        <LinkOverflow to={`/profiles/teams/${value.key}`} onClick={stopPropagation}>
          <ClampText>{value.name}</ClampText>
        </LinkOverflow>
      )}>
      {teamsWithoutChildren}
    </TrimmedCollectionCell>
  );
};

export const TagCell = ({ tags, ...props }: { tags: TagResponse[] }) => (
  <TrimmedCollectionCell
    {...props}
    item={({ value }) => (
      <Badge size={Size.XSMALL}>
        <ClampText>{`${value.name}: ${value.value}`}</ClampText>
      </Badge>
    )}
    excessiveItem={({ value }) => <ClampText>{`${value.name}: ${value.value}`}</ClampText>}
    limitExcessiveItems={tags?.length}>
    {tags}
  </TrimmedCollectionCell>
);

export const PlatformCell = styled<Cell<SecretRiskTriggerSummary>>(({ data, ...props }) => (
  <Table.FlexCell {...props}>
    {data.platform !== 'None' && (
      <Tooltip content={data.platform}>
        <VendorIcon name={data.platform} platform />
      </Tooltip>
    )}
  </Table.FlexCell>
))`
  justify-content: center;
`;

export const ValidityCell = styled<Cell<SecretRiskTriggerSummary>>(({ data, ...props }) => {
  const { icon, content } = getValidityMapper(data) ?? {};
  return (
    <Table.FlexCell {...props}>
      <Tooltip content={content}>
        <ValidityIcon data-type={data.validity} name={icon} />
      </Tooltip>
    </Table.FlexCell>
  );
})`
  justify-content: center;
`;

export const MainContributorCell = styled<Cell<RiskTriggerSummaryResponse>>(
  ({ data, ...props }) => {
    return (
      <Table.FlexCell {...props}>
        {data.codeOwner && (
          <AvatarProfile
            identityKey={data?.codeOwner?.identityKey}
            username={data?.codeOwner?.username}
            size={Size.MEDIUM}
            active={data?.codeOwner?.isActive}
            lastActivity={data?.codeOwner?.lastActivity}
            activeSince={data?.codeOwner?.activeSince}
          />
        )}
      </Table.FlexCell>
    );
  }
)`
  justify-content: center;
`;

export const ServerUrlCell: Cell<RiskTriggerSummaryResponse> = ({ data, ...props }) => (
  <Table.FlexCell {...props}>
    <ServerUrlLink onClick={stopPropagation} href={data?.serverUrl ?? data?.relatedEntity?.url}>
      <ClampPath>{data?.serverUrl ?? data?.relatedEntity?.url}</ClampPath>
    </ServerUrlLink>
  </Table.FlexCell>
);

export const RuleNameCell: Cell<RiskTriggerSummaryResponse> = ({ data, ...props }) => (
  <Table.Cell {...props}>
    <ClampText lines={2}>{data.ruleName}</ClampText>
  </Table.Cell>
);
export const GroupCell: Cell<RiskTriggerSummaryResponse> = ({ data, ...props }) => (
  <Table.CenterCell {...props}>
    {data.relatedEntity ? (
      <ClampPath lines={2}>{String(data.relatedEntity.repositoryGroupId)}</ClampPath>
    ) : null}
  </Table.CenterCell>
);

export const SourceCell = styled<Cell<RiskTriggerSummaryResponse>>(({ data, ...props }) => (
  <Table.Cell {...props}>
    <IconsContainer>
      {data.providers?.map((provider: Provider) => (
        <Tooltip key={provider} content={getProviderDisplayName(provider)}>
          <VendorCircle name={provider} size={Size.SMALL} fallback={<SvgIcon name="Api" />} />
        </Tooltip>
      ))}
    </IconsContainer>
  </Table.Cell>
))`
  max-width: fit-content;
  white-space: nowrap;
`;

export const FileClassificationCell: Cell<StubAny> = ({ data, ...props }) => {
  const { risksService } = useRisksContext();
  const filterOptions = useSuspense(risksService.getFilterOptions);

  const type = useMemo(
    () =>
      filterOptions
        .find(_ => _.key === 'FileClassification')
        ?.options?.find(_ => _.value === data.fileClassification)?.title,
    [data, filterOptions]
  );

  return (
    <Table.FlexCell {...props}>
      <ClampText lines={2}>{type}</ClampText>
    </Table.FlexCell>
  );
};

export const RiskCategoryCell: Cell<RiskTriggerSummaryResponse> = ({ data, ...props }) => (
  <Table.Cell {...props}>
    <ClampText lines={2}>{data.riskCategory}</ClampText>
  </Table.Cell>
);

export const DiscoveryDateCell: Cell<StubAny> = ({ data, ...props }) => {
  return (
    <Table.Cell {...props}>
      {Boolean(data.discoveredAt) && (
        <DateTime date={data.discoveredAt} format={dateFormats.longDate} />
      )}
    </Table.Cell>
  );
};

const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  ${BaseIcon} {
    min-width: 6rem;
  }
`;

export const DueDateCell = styled<Cell<RiskTriggerSummaryResponse>>(({ data: risk, ...props }) => (
  <Table.FlexCell {...props}>
    <RiskDueDate risk={risk} />
  </Table.FlexCell>
))`
  ${DropdownMenu} {
    flex-shrink: 0;
  }

  ${Time} {
    white-space: nowrap;
  }
`;

export const ArtifactCell: Cell<StubAny> = ({ data, ...props }) => {
  const artifact = data.findingComponents.find(
    (component: StubAny) => component.artifactKey && component.packageId
  );

  const artifactKey = artifact?.artifactKey;
  const packageId = artifact?.packageId;

  return (
    <Table.Cell {...props}>
      {artifactKey && packageId && (
        <ArtifactCellWrapper>
          <IconWrapper name="ContainerImage" size={Size.XSMALL} />
          <TextButton
            underline
            mode={LinkMode.EXTERNAL}
            size={Size.XSMALL}
            onClick={stopPropagation}
            to={makeUrl(`/inventory/artifacts/${artifactKey}/risks`, {})}>
            <ClampText>{packageId}</ClampText>
          </TextButton>
        </ArtifactCellWrapper>
      )}
    </Table.Cell>
  );
};

const ArtifactCellWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  ${TextButton} {
    width: 95%;
  }
`;

const IconWrapper = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;

const ServerUrlLink = styled(ExternalLink)`
  width: 100%;
`;

const LinkOverflow = styled(Link)`
  overflow: hidden;
`;
