import { DateTime } from '@src-v2/components/time';
import { dateFormats } from '@src-v2/data/datetime';
import { DueDateChangeTimelineEvent } from '@src-v2/types/inventory-elements';

export function DueDateChangeDescription({ details }: { details: DueDateChangeTimelineEvent }) {
  return (
    <>
      Changed{' '}
      {details.currentDueDate && (
        <>
          to <DateTime date={details.currentDueDate} format={dateFormats.longDate} />{' '}
        </>
      )}
      by {details.createdBy}
    </>
  );
}
