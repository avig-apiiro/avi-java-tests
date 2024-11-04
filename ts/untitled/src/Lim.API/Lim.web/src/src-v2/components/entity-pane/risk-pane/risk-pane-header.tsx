import _ from 'lodash';
import { observer } from 'mobx-react';
import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { RiskStatusIndicator } from '@src-v2/components/activity-indicator';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { Circle } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { Dropdown } from '@src-v2/components/dropdown';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { RiskPaneActions } from '@src-v2/components/entity-pane/risk-pane/risk-pane-actions';
import { Combobox, Input } from '@src-v2/components/forms';
import { Select } from '@src-v2/components/forms/select';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1, ExternalLink, SubHeading3, Title } from '@src-v2/components/typography';
import { OverrideRiskStatusModal } from '@src-v2/containers/action-modals/override-risk/override-risk-status';
import { ActionsHistory } from '@src-v2/containers/actions-timeline/actions-history';
import {
  ApplicationsView,
  ConsumableProfileView,
  ProfilesSeparator,
  TeamsView,
} from '@src-v2/containers/profiles/consumable-profiles-view';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { stringifyIssueId } from '@src-v2/data/ticketing-issues-provider';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskStatus } from '@src-v2/types/enums/risk-level';
import { ActionTakenDetails } from '@src-v2/types/risks/action-taken-details';
import { StyledProps } from '@src-v2/types/styled';
import { RiskTag } from '@src/src-v2/components/tags';

export const RiskPaneHeader = observer(
  ({
    title: RiskTitle = RiskPaneHeader.Title,
    subtitle: RiskSubtitle = RiskPaneHeader.Subtitle,
  }: {
    title?: FC;
    subtitle?: FC;
  }) => {
    const { risk } = useEntityPaneContext();

    const relatedTicketDetails = useMemo(
      () =>
        risk.actionsTakenSummaries
          .filter(({ type }) => type === 'Issue')
          .flatMap(({ items }) => items),
      [risk]
    );
    return (
      <Container>
        <RiskTitle />
        <RiskSubtitle />
        <ProfilesSeparator>
          {Boolean(risk.orgTeams?.length) && (
            <>
              <Caption1>Teams:</Caption1>
              <TeamsView teams={risk.orgTeams} />
            </>
          )}
          {Boolean(risk.applications?.length) && (
            <>
              <Caption1>Applications:</Caption1>
              <ApplicationsView applications={risk.applications} />
            </>
          )}
          {risk.relatedEntity && (
            <>
              <Caption1>
                {risk.relatedEntity.type === 'ProjectProfile' ? 'Project' : 'Repository'}:
              </Caption1>
              <ConsumableProfileView profile={risk.relatedEntity} />
            </>
          )}
          {Boolean(risk.moduleName) && (
            <>
              <Caption1>Code module:</Caption1>
              <SvgIcon size={Size.XXSMALL} name="Module" />
              <ClampText>{risk.moduleName}</ClampText>
            </>
          )}
        </ProfilesSeparator>
        <RiskActions>
          <ActionContainer>
            {Boolean(relatedTicketDetails.length) && (
              <TrimmedCollectionDisplay
                limit={1}
                item={({ value }) => <TicketLink ticket={value} />}
                excessiveItem={({ value }) => <TicketLink withCircle ticket={value} />}>
                {relatedTicketDetails}
              </TrimmedCollectionDisplay>
            )}
          </ActionContainer>

          <ActionContainer>
            {risk.actionsTakenSummaries?.map((summary, index) => (
              <ActionsHistory key={index} summary={summary} />
            ))}
            <RiskPaneActions />
          </ActionContainer>
        </RiskActions>
      </Container>
    );
  }
);

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &:after {
    content: '';
    position: absolute;
    width: 100%;
    bottom: 0;
    border-bottom: 0.25rem solid var(--color-blue-gray-20);
  }
`;

RiskPaneHeader.Title = styled(
  observer((props: StyledProps) => {
    const { risk } = useEntityPaneContext();
    const { rbac } = useInject();
    const [modalElement, setModal, closeModal] = useModalState();
    const [selectedStatus, setSelectedStatus] = useState(
      riskStatusOptions.find(item => item.value === risk.riskStatus)
    );
    const canEdit = rbac.canEdit(resourceTypes.RiskStatus);

    const handleStatusChange = useCallback(
      (newRisk: { value: RiskStatus; label: string; icon: JSX.Element }) => {
        setModal(
          <OverrideRiskStatusModal
            risk={risk}
            disabledSubmitButton={!canEdit}
            currentRiskStatus={risk.riskStatus}
            newRiskStatus={newRisk.value}
            onClose={closeModal}
            onSubmit={() => setSelectedStatus(newRisk)}
          />
        );
      },
      [risk, canEdit, closeModal]
    );

    return (
      <div {...props}>
        <Title>{risk.shortSummary || risk.ruleName}</Title>
        <Combobox
          as={Select}
          items={riskStatusOptions.filter(risk => risk.value !== selectedStatus.value)}
          value={selectedStatus}
          inputValue={selectedStatus.value}
          icon={selectedStatus.icon}
          disabled={!canEdit}
          searchable={false}
          clearable={false}
          dropdownItem={Dropdown.IconItem}
          onSelect={event => handleStatusChange(event.selectedItem)}
        />
        {modalElement}
      </div>
    );
  })
)`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  ${Combobox} {
    width: 35rem;
    flex-shrink: 0;

    ${Combobox.InputContainer} {
      &[data-has-icon] > ${Input} {
        height: 8rem;
        font-size: var(--font-size-s);
        padding-left: 8rem;
      }
    }
  }
`;

const RiskTagContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

RiskPaneHeader.Subtitle = () => (
  <SubHeading3>
    {/*eslint-disable-next-line react-hooks/rules-of-hooks*/}
    {useEntityPaneContext().risk.riskName || useEntityPaneContext().risk.findingName}
  </SubHeading3>
);

const RiskActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5rem;
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TicketLink = styled(
  ({
    ticket,
    withCircle,
    ...props
  }: StyledProps<{
    ticket: ActionTakenDetails;
    withCircle?: boolean;
  }>) => {
    const { application } = useInject();
    const trackAnalytics = useTrackAnalytics();

    const handleOpenTicket = useCallback(() => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'View ticket',
        [AnalyticsDataField.EntryPoint]: 'pane header',
      });
    }, [trackAnalytics]);

    return (
      <div {...props}>
        {withCircle ? (
          <Circle size={Size.XSMALL}>
            <VendorIcon name={ticket.provider} />
          </Circle>
        ) : (
          <VendorIcon name={ticket.provider} />
        )}

        <ExternalLink href={ticket.externalLink} onClick={handleOpenTicket}>
          {ticket.id ? stringifyIssueId(ticket.id) : 'View related ticket'}
        </ExternalLink>
        {application.isFeatureEnabled(FeatureFlag.Jira2WayIntegration) && ticket.status && (
          <Badge
            color={ticket.status === 'Done' ? BadgeColors.Green : BadgeColors.Blue}
            size={Size.XXSMALL}>
            {ticket.status}
          </Badge>
        )}
      </div>
    );
  }
)`
  display: flex;
  gap: 1rem;
  align-items: center;

  ${Circle} {
    background-color: var(--color-white);
  }
`;

export const RiskLevelDropdown = observer(({ risk, ...props }) => (
  <RiskTagContainer {...props}>
    <RiskTag size={Size.SMALL} riskLevel={_.camelCase(risk.riskLevel.toString())}>
      {risk.riskLevel}
    </RiskTag>
  </RiskTagContainer>
));

const riskStatusOptions = [
  { label: 'Open', value: RiskStatus.Open, icon: <RiskStatusIndicator status={RiskStatus.Open} /> },
  {
    label: 'Accepted',
    value: RiskStatus.Accepted,
    icon: <RiskStatusIndicator status={RiskStatus.Accepted} />,
  },
  {
    label: 'Ignored',
    value: RiskStatus.Ignored,
    icon: <RiskStatusIndicator status={RiskStatus.Ignored} />,
  },
];
