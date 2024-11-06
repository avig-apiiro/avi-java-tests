import styled from 'styled-components';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { SubHeading4 } from '@src-v2/components/typography';
import { abbreviate } from '@src-v2/utils/number-utils';

export const RiskScoreInfo = styled(({ riskScore, maxRiskScore, ...props }) => {
  return (
    <Tooltip content="A weighted value based on the number of risks at each severity level. The percentage shows how this asset’s score compares to the highest score.">
      <div {...props}>
        <SubHeading4>Risk score:</SubHeading4>
        {abbreviate(riskScore ?? 0)}
        {maxRiskScore > 0 && ` (${abbreviate((riskScore * 100) / maxRiskScore)}%)`}
      </div>
    </Tooltip>
  );
})`
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 1rem;
`;
