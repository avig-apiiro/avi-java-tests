import styled from 'styled-components';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelDropdown } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StyledProps } from '@src-v2/types/styled';

export const RiskLevelWidget = styled(
  ({
    risk,
    isExtendedWidth = false,
    ...props
  }: StyledProps<{
    risk: RiskTriggerSummaryResponse;
    isExtendedWidth?: boolean;
  }>) => (
    <EvidenceLine isExtendedWidth={isExtendedWidth} label="Risk level" {...props}>
      <RiskLevelDropdown risk={risk} />
    </EvidenceLine>
  )
)`
  display: flex;
  align-items: center;
  gap: ${props => (props.isExtendedWidth ? 0 : '1rem')};
`;
