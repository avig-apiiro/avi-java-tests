import _ from 'lodash';
import { observer } from 'mobx-react';
import { ReactNode, useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { IconButton } from '@src-v2/components/buttons';
import { VendorCircle } from '@src-v2/components/circles';
import { SubmitSeverityState } from '@src-v2/components/confirmation-modal';
import { RadioGroupControl } from '@src-v2/components/forms/form-controls';
import { BaseIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { SuccessToast } from '@src-v2/components/toastify';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, ListItem, Paragraph, UnorderedList } from '@src-v2/components/typography';
import { ActionModal } from '@src-v2/containers/modals/action-modal';
import { RiskComponent } from '@src-v2/containers/risks/risk-component';
import { bulkActionModes, getActionTextConfig } from '@src-v2/data/actions-data';
import { useInject } from '@src-v2/hooks';
import { customScrollbar } from '@src-v2/style/mixins';
import { StubAny } from '@src-v2/types/stub-any';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { humanize } from '@src-v2/utils/string-utils';

export const BulkActionModal = observer(
  ({
    dataModel,
    provider,
    overLimit,
    itemPreview: Preview,
    onAggregatedSubmitted,
    onSeparateSubmitted,
    onClose,
    children,
    ...props
  }: StubAny) => {
    const { toaster, risks } = useInject();
    const trackAnalytics = useTrackAnalytics();
    const { entityName, actionName } = getActionTextConfig(provider);
    const handleAggregated = useCallback(
      async (actionItem: StubAny) => {
        try {
          const updatedItems = await onAggregatedSubmitted(actionItem);

          const updatedTimelineItemsByTriggerKey = _.keyBy(updatedItems, 'triggerKey');
          dataModel.selection.forEach((item: StubAny) => {
            const updateTimelineItem =
              updatedTimelineItemsByTriggerKey[item.triggerKey ?? item.key];
            if (updateTimelineItem) {
              risks.modifyActionTimelineItem(item, updateTimelineItem);
            }
          });

          const createActionItemLink = _.find(updatedItems, item => item.externalLink);
          toaster.success(
            <SuccessToast>
              An aggregated {entityName} was created successfully!{' '}
              {createActionItemLink && (
                <ExternalLink href={createActionItemLink.externalLink}>
                  View {humanize(entityName)}
                </ExternalLink>
              )}
            </SuccessToast>
          );
        } catch (error) {
          throw Error(`There was a problem creating your ${entityName}s`);
        }
      },
      [dataModel, onAggregatedSubmitted, entityName]
    );

    const handleSeparated = useCallback(
      async (actionItem: StubAny) => {
        const [successfulActionItems, rejectedActionItems] = await onSeparateSubmitted(actionItem);

        if (successfulActionItems?.length) {
          successfulActionItems.forEach(
            ({ sentItem, response }: { sentItem: StubAny; response: StubAny }) => {
              risks.modifyActionTimelineItem(sentItem, response);
            }
          );
          toaster.success(
            `${successfulActionItems.length} ${entityName}s were created successfully!`
          );
        } else {
          throw Error(`There was a problem sending your ${entityName}s`);
        }

        if (rejectedActionItems?.length) {
          // @ts-expect-error
          throw Error({
            severity: SubmitSeverityState.warn,
            message: `Only ${successfulActionItems.length}/${dataModel.selection} ${entityName}s were sent successfully.`,
          });
        }
      },
      [dataModel, onSeparateSubmitted]
    );

    const handleSubmit = useCallback(
      async ({ actionMode, ...actionItem }: { actionMode: StubAny; actionItem: StubAny }) => {
        await (actionMode === bulkActionModes.AGGREGATED
          ? handleAggregated(actionItem)
          : handleSeparated(actionItem));

        trackAnalytics(AnalyticsEventName.ActionInvoked, {
          [AnalyticsDataField.ActionType]: `Create ${humanize(provider, true)} bulk ${entityName}`,
          [AnalyticsDataField.ActionMode]: actionMode,
        });

        onClose();
      },
      [handleAggregated, handleSeparated, dataModel, trackAnalytics]
    );

    return (
      <Modal
        {...props}
        mode="onChange"
        confirmOnClose
        submitText={humanize(actionName, true)}
        onSubmit={handleSubmit}
        onClose={onClose}
        title={<ModalTitle provider={provider} dataModel={dataModel} />}>
        <RisksList>
          <HeaderRow>
            <RiskNameContainer>Policy Name</RiskNameContainer>
            <RiskComponentContainer>Component</RiskComponentContainer>
          </HeaderRow>

          <UnorderedList>
            {dataModel.selection.map((item: StubAny, index: number) => (
              <ListItem key={index}>
                <RiskNameContainer>
                  <RiskIcon riskLevel={_.camelCase(item.riskLevel)} />
                  <Tooltip content={item.ruleName}>
                    <Paragraph>{item.ruleName}</Paragraph>
                  </Tooltip>
                </RiskNameContainer>
                <RiskComponentContainer>
                  <RiskComponent item={item} />
                </RiskComponentContainer>
                {Preview && (
                  <Popover
                    appendTo={document.getElementById('modal')}
                    content={<Preview item={item} />}>
                    <IconButton name="Visible" />
                  </Popover>
                )}
                <IconButton
                  name="Close"
                  disabled={dataModel.selection.length === 1}
                  onClick={() => dataModel.removeSelection(item)}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </RisksList>

        <ModalBody provider={provider} overLimit={overLimit}>
          {children}
        </ModalBody>
      </Modal>
    );
  }
);

const ModalBody = ({
  provider,
  overLimit,
  children,
}: {
  provider: StubAny;
  overLimit: StubAny;
  children: ReactNode;
}) => {
  const { entityName, actionName } = getActionTextConfig(provider);
  const actionMode = useWatch({ name: 'actionMode' });
  return (
    <>
      <RadioGroupControl
        name="actionMode"
        rules={{ required: true }}
        options={[
          {
            value: bulkActionModes.AGGREGATED,
            label: `Aggregate risks and ${actionName} a single ${entityName}`,
            disabled: overLimit,
            disableReason: 'Aggregation is limited to 20 risks',
          },
          {
            value: bulkActionModes.SEPARATE,
            label: `${humanize(actionName)} separate ${entityName}s`,
          },
        ]}
      />
      {actionMode && children}
    </>
  );
};

const Modal = styled(ActionModal)`
  width: 175rem;
`;

const ModalTitle = observer(
  ({ provider, dataModel }: { provider: StubAny; dataModel: StubAny }) => {
    const actionMode = useWatch({ name: 'actionMode' });

    const { entityName, actionName } = getActionTextConfig(provider);

    return (
      <>
        <VendorCircle size={Size.XLARGE} name={provider} />
        {humanize(actionName)} a{' '}
        {actionMode === bulkActionModes.SEPARATE
          ? 'Separate '
          : actionMode === bulkActionModes.AGGREGATED
            ? 'Single '
            : ''}
        {humanize(provider, true)} {entityName} for{' '}
        {pluralFormat(dataModel.selection?.length, 'Risk', null, true)}
      </>
    );
  }
);

const ItemContentContainer = styled.div`
  display: flex;
  height: 12rem;
  align-items: center;
  overflow: hidden;
`;

const RiskNameContainer = styled(ItemContentContainer)`
  min-width: 49rem;
  max-width: 49rem;
  gap: 2rem;

  ${BaseIcon} {
    width: 5rem;
    height: 5rem;
  }

  ${Paragraph} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const RiskComponentContainer = styled(ItemContentContainer)`
  flex-grow: 1;
  padding: 0 4rem;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

const HeaderRow = styled(ListItem)`
  border-top-left-radius: 3rem;
  border-top-right-radius: 3rem;
  border-bottom: 0.25rem solid var(--color-blue-gray-30);
  background: var(--color-blue-gray-20);
  color: var(--color-blue-gray-60);

  ${RiskNameContainer}:before {
    content: '';
    position: absolute;
    inset: 2rem 0 2rem auto;
    border-left: 0.25rem solid var(--color-blue-gray-30);
  }
`;

const RisksList = styled.div`
  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 3rem;

  ${UnorderedList} {
    max-height: 42rem;
    overflow: auto;
    padding: 0;

    ${customScrollbar}
  }

  ${ListItem} {
    display: flex;
    height: 12rem;
    padding: 0 5rem 0 6rem;
    align-items: center;
    margin-bottom: 0;

    &:not(:last-child) {
      border-bottom: 0.25rem solid var(--color-blue-35);
    }

    ${BaseIcon} {
      min-width: 6rem;
    }
  }
`;
