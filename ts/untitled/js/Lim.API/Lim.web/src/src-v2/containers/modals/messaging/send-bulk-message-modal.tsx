import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { BulkActionModal } from '@src-v2/containers/modals/bulk-action-modal';
import { MessagePreview } from '@src-v2/containers/modals/messaging/message-preview';
import {
  ChannelSelect,
  CustomContentField,
} from '@src-v2/containers/modals/messaging/send-message-inputs';
import { bulkActionModes } from '@src-v2/data/actions-data';
import { useInject } from '@src-v2/hooks';

export const SendBulkMessageModal = observer(
  ({ messageType, dataModel, previewTags, allowCustomChannel, defaultLimit = 20, ...props }) => {
    const { messaging } = useInject();
    const isDisabled = dataModel.selection.length > defaultLimit;

    const handleAggregated = useCallback(
      message =>
        messaging.sendAggregatedMessage({
          messageType,
          message,
          items: dataModel.selection,
        }),
      [dataModel?.selection, messageType]
    );

    const handleSeparate = useCallback(
      message =>
        messaging.sendSeparateMessages({
          messageType,
          message,
          items: dataModel.selection,
        }),
      [dataModel?.selection, messageType]
    );

    return (
      <BulkActionModal
        {...props}
        dataModel={dataModel}
        provider={messageType}
        overLimit={isDisabled}
        defaultValues={{
          actionMode: isDisabled ? bulkActionModes.SEPARATE : bulkActionModes.AGGREGATED,
        }}
        onAggregatedSubmitted={handleAggregated}
        onSeparateSubmitted={handleSeparate}
        itemPreview={({ item }) => (
          <MessagePreview riskData={item} messageType={messageType} tags={previewTags} />
        )}>
        <ModalBodyEditor messageType={messageType} allowCustomChannel={allowCustomChannel} />
      </BulkActionModal>
    );
  }
);

function ModalBodyEditor({ messageType, allowCustomChannel }) {
  const { watch } = useFormContext();
  const mode = watch('actionMode');

  return (
    <>
      <ChannelSelect messageType={messageType} creatable={allowCustomChannel} />
      {mode === bulkActionModes.AGGREGATED && <CustomContentField />}
    </>
  );
}
