import { format } from 'date-fns';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1 } from '@src-v2/components/typography';
import { ActionTakenDetails } from '@src-v2/types/risks/action-taken-details';
import { makeUrl } from '@src-v2/utils/history-utils';

export function MessageDescription({
  messageDetails,
  inlineCreateAt = false,
}: {
  messageDetails: ActionTakenDetails;
  inlineCreateAt?: boolean;
}) {
  const workflowShortName = messageDetails.workflowName?.match(/(?<=· ).*/);
  const searchTerm = workflowShortName ? workflowShortName[0] : '';
  return (
    <Caption1>
      Sent{' '}
      {messageDetails.channel && (
        <>
          in{' '}
          {messageDetails.externalLink ? (
            <TextButton
              mode={LinkMode.EXTERNAL}
              underline={true}
              size={Size.XXSMALL}
              href={messageDetails.externalLink}>
              {messageDetails.channel}
            </TextButton>
          ) : (
            messageDetails.channel
          )}
        </>
      )}{' '}
      by {messageDetails.createdBy}
      {messageDetails.isAutomated && (
        <>
          <br />
          was created by the triggered workflow: <br />
          <TextButton
            mode={LinkMode.INTERNAL}
            underline={true}
            size={Size.XXSMALL}
            to={makeUrl('/workflows/manager', {
              fl: { searchTerm },
            })}>
            '{messageDetails.workflowName}'
          </TextButton>
        </>
      )}
      {inlineCreateAt && <> at {format(messageDetails.createdAt, 'p')}</>}
    </Caption1>
  );
}
