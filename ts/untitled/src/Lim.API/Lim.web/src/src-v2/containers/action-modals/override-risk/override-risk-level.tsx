import { observer } from 'mobx-react';
import React, { forwardRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  AnalyticsLayer,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import {
  ItemProps,
  SelectControlV2,
  TextareaControl,
} from '@src-v2/components/forms/form-controls';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import { SvgIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { SelectV2 } from '@src-v2/components/select/select-v2';
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
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StubAny } from '@src-v2/types/stub-any';
import { StyledProps } from '@src-v2/types/styled';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { Dropdown } from '@src/src-v2/components/dropdown';

type OverrideRiskLevelProps = StyledProps & {
  risk: RiskTriggerSummaryResponse;
};

export const OverrideRiskLevel = styled(
  observer(
    forwardRef<HTMLElement, OverrideRiskLevelProps>(({ risk, ...props }, ref) => {
      const { modalElement, setModal } = useConfirmOverrideModal(risk);

      const handleOverrideClick = (
        event: React.MouseEvent<HTMLElement>,
        newRiskLevel: RiskLevel
      ) => {
        stopPropagation(event);
        setModal(risk.riskLevel, newRiskLevel);
      };

      return (
        <AnalyticsLayer analyticsData={{ [AnalyticsDataField.EntryPoint]: 'Override risk level' }}>
          <Tooltip content="Override risk level">
            <DropdownMenu
              {...props}
              onClick={stopPropagation}
              onItemClick={stopPropagation}
              icon="ChevronDown"
              size={Size.SMALL}
              ref={ref}>
              {Object.values(RiskLevel)
                .filter(level => level !== risk.riskLevel)
                .map(newRiskLevel => (
                  <Dropdown.Item
                    key={newRiskLevel}
                    onClick={event => handleOverrideClick(event, newRiskLevel)}>
                    <RiskIcon riskLevel={newRiskLevel} />
                    {newRiskLevel}
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
  const canEdit = rbac.canEdit(resourceTypes.RiskLevel);

  const showConfirmOverrideModal1 = (currentRiskLevel: RiskLevel, newRiskLevel: RiskLevel) => {
    setModal(
      <OverrideBulkRiskLevelModal
        disabledSubmitButton={!canEdit}
        risk={risk}
        currentRiskLevel={currentRiskLevel}
        newRiskLevel={newRiskLevel}
        onClose={closeModal}
      />
    );
  };
  return { setModal: showConfirmOverrideModal1, modalElement };
};

export const OverrideBulkRiskLevelModal = styled(
  ({
    currentRiskLevel,
    newRiskLevel,
    risk,
    onClose,
    onSubmit,
    ...props
  }: StyledProps & {
    currentRiskLevel?: RiskLevel;
    newRiskLevel: RiskLevel;
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
      async ({ description }: { description: StubAny }) => {
        try {
          await (risksContext?.risksService ?? risks).overrideRisksLevel({
            risks: isBulk ? risk : [risk],
            overrideRiskLevelData: {
              riskLevel: newRiskLevel,
              reason: description,
            },
          });
          toaster.success('Risk level changed successfully');

          trackAnalytics(AnalyticsEventName.ActionClicked, {
            [AnalyticsDataField.ActionType]: 'Override Risk Level',
            [AnalyticsDataField.OverridenRiskLevel]: risk?.riskLevel,
            [AnalyticsDataField.RiskLevel]: newRiskLevel,
          });

          onSubmit?.();
          onClose?.();
        } catch (error) {
          toaster.error('Failed changing risk level');
        }
      },
      [risk, newRiskLevel]
    );

    return (
      <OverrideModalContainer
        {...props}
        title={
          <OverrideModalTitleContainer>
            {!isBulk && currentRiskLevel && <RiskIcon riskLevel={currentRiskLevel} />}
            {isBulk ? 'Multiple risk levels' : currentRiskLevel}
            <SvgIcon name="Arrow" />
            <RiskIcon riskLevel={newRiskLevel} />
            {newRiskLevel}
          </OverrideModalTitleContainer>
        }
        onSubmit={handleSubmit}
        submitText="Change"
        onClose={onClose}>
        <OverrideModalContentContainer>
          <Title>Override risk level?</Title>
          <Paragraph>
            {isBulk
              ? 'This action overrides the current risk level for multiple risks\n'
              : 'This action overrides the current risk level \n'}
            and will appear in the Audit log and the Timeline with the reason below.
            {'\n'}You can override the risk level again if needed.
          </Paragraph>
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

export const OverrideRiskLevelModal = ({
  risk,
  closeModal,
  ...props
}: {
  risk: RiskTriggerSummaryResponse;
  closeModal: () => void;
}) => {
  const { risks, toaster } = useInject();
  const trackAnalytics = useTrackAnalytics();

  const handleSubmit = useCallback(
    async ({ description, newRiskLevel }: { description: string; newRiskLevel: StubAny }) => {
      try {
        await risks.overrideRiskLevel({ risk, description, riskLevel: newRiskLevel.key });
        toaster.success('Risk level changed successfully');

        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'Override Risk Level',
          [AnalyticsDataField.OverridenRiskLevel]: risk.riskLevel,
          [AnalyticsDataField.RiskLevel]: newRiskLevel.key,
        });

        closeModal();
      } catch (error) {
        toaster.error('Failed changing risk level');
      }
    },
    [risk]
  );

  return (
    <OverrideModalContainer
      {...props}
      title={<OverrideRiskLevelModalTitle currentRiskLevel={risk.riskLevel} />}
      onSubmit={handleSubmit}
      submitText="Override"
      onClose={closeModal}>
      <OverrideModalContentContainer>
        <Title>Override risk level?</Title>
        <Description>
          This action overrides the current risk level and will appear in the Timeline with the
          reason below.{'\n'}You can override the risk level again, as needed.
        </Description>
        <RiskLevelField>
          <Label required>New risk level</Label>
          <SelectControlV2
            name="newRiskLevel"
            rules={{ required: true }}
            options={riskLevelItems.filter(item => item.key !== risk.riskLevel)}
            placeholder="Select risk level..."
            option={({ data }: { data: StubAny }) => (
              <RiskLevelOption {...props}>
                {data.icon}
                {data.label}
              </RiskLevelOption>
            )}
            clearable={false}
          />
        </RiskLevelField>

        <TextareaControl
          placeholder="Add a reason... (optional)"
          name="description"
          charLimit={500}
        />
      </OverrideModalContentContainer>
    </OverrideModalContainer>
  );
};

const OverrideRiskLevelModalTitle = ({ currentRiskLevel }: { currentRiskLevel: string }) => {
  const { watch } = useFormContext();
  const newRiskLevel = watch('newRiskLevel');
  return (
    <OverrideModalTitleContainer>
      <RiskIcon riskLevel={currentRiskLevel} />
      <SvgIcon name="Arrow" />
      {newRiskLevel && <RiskIcon riskLevel={newRiskLevel.label} />}
    </OverrideModalTitleContainer>
  );
};

export const riskLevelItems: ItemProps[] = [
  {
    label: 'Critical',
    key: RiskLevel.Critical,
    icon: <RiskIcon riskLevel={RiskLevel.Critical} />,
  },
  { label: 'High', key: RiskLevel.High, icon: <RiskIcon riskLevel={RiskLevel.High} /> },
  { label: 'Medium', key: RiskLevel.Medium, icon: <RiskIcon riskLevel={RiskLevel.Medium} /> },
  { label: 'Low', key: RiskLevel.Low, icon: <RiskIcon riskLevel={RiskLevel.Low} /> },
];

const RiskLevelField = styled(Field)`
  max-width: 60rem;
  align-self: flex-start;
  margin: 0;

  ${SelectV2.Container} {
    width: 55rem;
  }
`;

const Description = styled(Paragraph)`
  white-space: break-spaces;
`;

const RiskLevelOption = styled.span`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
