import { observer } from 'mobx-react';
import React, { forwardRef, useCallback } from 'react';
import styled from 'styled-components';
import { RiskStatusIndicator } from '@src-v2/components/activity-indicator';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  AnalyticsLayer,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { RadioGroupControl, TextareaControl } from '@src-v2/components/forms/form-controls';
import { SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph, Title } from '@src-v2/components/typography';
import {
  OverrideModalContainer,
  OverrideModalContentContainer,
  OverrideModalTitleContainer,
} from '@src-v2/containers/action-modals/override-risk/override-modal';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { RiskStatus } from '@src-v2/types/enums/risk-level';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StyledProps } from '@src-v2/types/styled';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { Dropdown } from '@src/src-v2/components/dropdown';

type OverrideRiskStatusProps = StyledProps & {
  risk: RiskTriggerSummaryResponse;
};

export const OverrideRiskStatus = styled(
  observer(
    forwardRef<HTMLElement, OverrideRiskStatusProps>(({ risk, ...props }, ref) => {
      const { modalElement, setModal } = useConfirmOverrideModal(risk);

      const handleOverrideClick = (
        event: React.MouseEvent<HTMLElement>,
        newRiskStatus: RiskStatus
      ) => {
        stopPropagation(event);
        setModal(risk.riskStatus, newRiskStatus);
      };

      return (
        <AnalyticsLayer analyticsData={{ [AnalyticsDataField.EntryPoint]: 'Override risk status' }}>
          <Tooltip content="Override risk status">
            <DropdownMenu
              onClick={stopPropagation}
              onItemClick={stopPropagation}
              icon="ChevronDown"
              {...props}
              size={Size.SMALL}
              ref={ref}>
              {Object.values(RiskStatus)
                .filter(status => status !== risk.riskStatus)
                .map(newRiskStatus => (
                  <Dropdown.Item
                    key={newRiskStatus}
                    onClick={event => handleOverrideClick(event, newRiskStatus)}>
                    <RiskStatusIndicator status={newRiskStatus} />
                    {newRiskStatus}
                  </Dropdown.Item>
                ))}
            </DropdownMenu>
          </Tooltip>
          {modalElement}
        </AnalyticsLayer>
      );
    })
  )
)`
  transition: transform 0.2s ease-in-out;

  &[data-active] {
    transform: rotate(-180deg);
    transition: transform 0.2s ease-in-out;
  }
`;

const useConfirmOverrideModal = (risk: any) => {
  const { rbac } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();
  const canEdit = rbac.canEdit(resourceTypes.RiskStatus);

  const showConfirmOverrideModal = (currentRiskStatus: RiskStatus, newRiskStatus: RiskStatus) => {
    setModal(
      <OverrideRiskStatusModal
        disabledSubmitButton={!canEdit}
        risk={risk}
        currentRiskStatus={currentRiskStatus}
        newRiskStatus={newRiskStatus}
        onClose={closeModal}
      />
    );
  };
  return { setModal: showConfirmOverrideModal, modalElement };
};

export const OverrideRiskStatusModal = styled(
  ({
    currentRiskStatus,
    newRiskStatus,
    risk,
    onClose,
    onSubmit,
    ...props
  }: StyledProps & {
    currentRiskStatus?: RiskStatus;
    newRiskStatus: RiskStatus;
    risk: any;
    disabledSubmitButton?: boolean;
    onClose?: () => void;
    onSubmit?: () => void;
  }) => {
    const { toaster, risks } = useInject();
    const risksContext = useRisksContext();
    const trackAnalytics = useTrackAnalytics();
    const isBulk = Array.isArray(risk);

    const handleSubmit = useCallback(
      async ({ description, ignoreType }) => {
        try {
          await (risksContext?.risksService ?? risks).overrideRisksStatus({
            risks: isBulk ? risk : [risk],
            overrideRiskStatusData: {
              riskStatus: newRiskStatus,
              reason: description,
              ignoreType,
            },
          });
          toaster.success('Risk status changed successfully');

          trackAnalytics(AnalyticsEventName.ActionClicked, {
            [AnalyticsDataField.ActionType]: 'Override Risk Status',
            [AnalyticsDataField.OverridenRiskStatus]: risk?.riskStatus,
            [AnalyticsDataField.RiskStatus]: newRiskStatus,
          });

          onSubmit?.();
          onClose?.();
        } catch (error) {
          toaster.error('Failed changing risk status');
        }
      },
      [risk, newRiskStatus]
    );

    return (
      <OverrideModalContainer
        {...props}
        title={
          <OverrideModalTitleContainer>
            {!isBulk && currentRiskStatus && <RiskStatusIndicator status={currentRiskStatus} />}
            {isBulk ? 'Multiple risk statuses' : currentRiskStatus}
            <SvgIcon name="Arrow" />
            <RiskStatusIndicator status={newRiskStatus} />
            {newRiskStatus}
          </OverrideModalTitleContainer>
        }
        onSubmit={handleSubmit}
        submitText="Change"
        onClose={onClose}>
        <OverrideModalContentContainer>
          <Title>Change risk status?</Title>
          <Paragraph>
            {isBulk
              ? 'This action overrides the current risk status for multiple risks\n'
              : 'This action overrides the current risk risk status \n'}
            and will appear in the Audit log and the Timeline with the reason below.
            {'\n'}You can override the risk status again if needed.
          </Paragraph>
          {newRiskStatus === RiskStatus.Ignored && (
            <RadioGroupControl
              name="ignoreType"
              defaultValue={ignoreOptions[0].value}
              options={ignoreOptions}
              rules={{ required: true }}
            />
          )}
          <TextareaControl
            placeholder="Add a reason... (optional)"
            name="description"
            charLimit={500}
          />
        </OverrideModalContentContainer>
      </OverrideModalContainer>
    );
  }
)`
  ${OverrideModalTitleContainer} {
    font-size: var(--font-size-s);
  }

  ${OverrideModalContentContainer} {
    ${Paragraph} {
      white-space: break-spaces;
    }
  }
`;

const ignoreOptions = [
  { value: 'falsePositive', label: "It's a false positive" },
  { value: 'notRelevant', label: "It's not relevant" },
];
