import { format } from 'date-fns';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1 } from '@src-v2/components/typography';
import { stringifyIssueId } from '@src-v2/data/ticketing-issues-provider';
import { ActionTakenDetails } from '@src-v2/types/risks/action-taken-details';
import { makeUrl } from '@src-v2/utils/history-utils';

export function IssueDescription({
  issueDetails,
  inlineCreateAt = false,
}: {
  issueDetails: ActionTakenDetails;
  inlineCreateAt?: boolean;
}) {
  const workflowShortName = issueDetails.workflowName?.match(/(?<=· ).*/);
  const searchTerm = workflowShortName ? workflowShortName[0] : '';
  return (
    <Caption1>
      {issueDetails.provider === 'Jira' ? 'Ticket' : 'Issue'}{' '}
      <TextButton
        href={issueDetails.externalLink}
        mode={LinkMode.EXTERNAL}
        underline
        size={Size.XXSMALL}>
        {stringifyIssueId(issueDetails.id)}
      </TextButton>{' '}
      was {issueDetails.isLinkedManually ? 'linked' : 'created'}{' '}
      {issueDetails.createdBy && <> by {issueDetails.createdBy} </>}
      {issueDetails.isAutomated && (
        <>
          by triggered workflow: <br />
          <TextButton
            mode={LinkMode.INTERNAL}
            underline
            size={Size.XXSMALL}
            to={makeUrl('/workflows/manager', {
              fl: { searchTerm },
            })}>
            '{issueDetails.workflowName}'
          </TextButton>
        </>
      )}
      {inlineCreateAt && <> at {format(issueDetails.createdAt, 'p')}</>}
    </Caption1>
  );
}
