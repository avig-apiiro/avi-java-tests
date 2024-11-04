import styled from 'styled-components';
import { Heading1 } from '@src-v2/components/typography';

export const RiskScoreWidget = styled(({ profile, ...props }) => {
  return (
    <div {...props}>
      <Heading1>{profile.riskScore ?? 0}</Heading1>
      <ProfileWidgetLabel>Risk Score</ProfileWidgetLabel>
    </div>
  );
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

export const ProfileWidgetLabel = styled.div`
  color: var(--default-text-color);
  font-size: var(--font-size-xs);
  font-weight: 300;
  white-space: nowrap;
  line-height: 1;
`;
