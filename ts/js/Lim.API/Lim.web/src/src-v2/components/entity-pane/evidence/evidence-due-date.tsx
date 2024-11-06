import { observer } from 'mobx-react';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskDueDate } from '@src-v2/components/risk/risk-due-date';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export const DueDateEvidenceLine = observer(
  ({
    risk,
    isExtendedWidth = false,
  }: {
    risk: RiskTriggerSummaryResponse;
    isExtendedWidth?: boolean;
  }) => {
    return (
      <EvidenceLine isExtendedWidth={isExtendedWidth} label="Due date">
        <RiskDueDate risk={risk} />
      </EvidenceLine>
    );
  }
);
