import styled from 'styled-components';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { DateTime } from '@src-v2/components/time';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { dateFormats } from '@src-v2/data/datetime';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { calculateTimeDifference, isEmptyDate } from '@src-v2/utils/datetime-utils';

export const DiscoveredEvidenceLine = ({
  risk,
  isExtendedWidth = false,
}: {
  risk: RiskTriggerSummaryResponse;
  isExtendedWidth?: boolean;
}) => {
  return (
    risk.discoveredAt && (
      <EvidenceLine isExtendedWidth={isExtendedWidth} label="Discovered on">
        <DateTime date={risk.discoveredAt} format={dateFormats.longDate} />{' '}
        {calculateTimeDifference(risk.discoveredAt.toString())}
      </EvidenceLine>
    )
  );
};

const DateEvidenceItem = ({
  date,
  label,
  tooltip,
  isExtendedWidth = false,
}: {
  date: Date;
  label: string;
  tooltip: string;
  isExtendedWidth?: boolean;
}) =>
  !date || isEmptyDate(date) ? null : (
    <EvidenceLine
      isExtendedWidth={isExtendedWidth}
      label={
        <DateEvidenceItemLabel>
          {label} <InfoTooltip content={tooltip} />
        </DateEvidenceItemLabel>
      }>
      <DateTime date={date} format={dateFormats.longDate} />
    </EvidenceLine>
  );

export const FirstDetectedEvidenceLine = ({
  firstDetectionTime,
  isExtendedWidth = false,
}: {
  firstDetectionTime: Date;
  isExtendedWidth?: boolean;
}) => (
  <DateEvidenceItem
    isExtendedWidth={isExtendedWidth}
    date={firstDetectionTime}
    label="First detected on"
    tooltip="Date the vendor first detected the issue"
  />
);

export const LastDetectedEvidenceLine = ({
  latestDetectionTime,
  isExtendedWidth = false,
}: {
  latestDetectionTime: Date;
  isExtendedWidth?: boolean;
}) => (
  <DateEvidenceItem
    isExtendedWidth={isExtendedWidth}
    date={latestDetectionTime}
    label="Last detected on"
    tooltip="Date the vendor last detected the issue"
  />
);

export const FirstOccurenceEvidenceLine = ({
  firstOccurenceTime,
  isExtendedWidth = false,
}: {
  firstOccurenceTime: Date;
  isExtendedWidth?: boolean;
}) => (
  <DateEvidenceItem
    isExtendedWidth={isExtendedWidth}
    date={firstOccurenceTime}
    label="Introduced on"
    tooltip="Date the issue entered the code"
  />
);

const DateEvidenceItemLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
