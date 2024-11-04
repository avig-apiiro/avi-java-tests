import { Caption1 } from '@src-v2/components/typography';
import { CommentTimelineEvent } from '@src-v2/types/inventory-elements';
import { ActionTakenDetails } from '@src-v2/types/risks/action-taken-details';

export function CommentDescription({
  commentDetails,
}: {
  commentDetails: CommentTimelineEvent | ActionTakenDetails;
}) {
  return <Caption1>Added comment by {commentDetails.createdBy}</Caption1>;
}
