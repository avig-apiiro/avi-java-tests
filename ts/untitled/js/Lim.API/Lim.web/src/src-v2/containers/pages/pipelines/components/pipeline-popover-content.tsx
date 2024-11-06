import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading4 } from '@src-v2/components/typography';
import { PipelineRisk } from '@src-v2/types/pipelines/pipelines-types';
import { makeUrl } from '@src-v2/utils/history-utils';

const MAX_RISKS = 8;
export const PipelinePopoverContent = ({
  risk,
  pipelineKey,
}: {
  risk: PipelineRisk;
  pipelineKey: string;
}) => {
  const { path: basePath } = useRouteMatch();
  const riskFactors = risk.riskFactors.slice(0, MAX_RISKS);

  return (
    <>
      <Heading4>{risk.combinedRiskLevel} Risk</Heading4>
      <PopoverContent>
        {riskFactors.map(riskFactor => (
          <PopoverContentRow key={riskFactor.ruleKey}>
            <RiskIcon riskLevel={risk.combinedRiskLevel} size={Size.XSMALL} />
            <TextButton
              showArrow
              to={makeUrl(`${basePath}/${pipelineKey}/risks`, {
                fl: {
                  RiskLevel: { values: ['Critical', 'High', 'Medium', 'Low'] },
                  RiskCategory: { values: ['PipelineMisconfigurations', 'PipelineDependencies'] },
                  GovernanceRuleName: { values: [riskFactor.ruleName] },
                },
              })}
              mode={LinkMode.INTERNAL}
              size={Size.XSMALL}>
              {riskFactor.ruleName}
            </TextButton>
          </PopoverContentRow>
        ))}
        {riskFactors.length > MAX_RISKS && (
          <TextButton
            to={makeUrl(`${basePath}/${pipelineKey}/risk`, {})}
            mode={LinkMode.INTERNAL}
            size={Size.XSMALL}
            showArrow>
            {`+${riskFactors.length - MAX_RISKS} Risk Factors`}
          </TextButton>
        )}
      </PopoverContent>
    </>
  );
};
const PopoverContent = styled.div`
  max-height: 90rem;
  border-top: 1px solid var(--color-blue-gray-25);
  margin-top: 3rem;
`;

const PopoverContentRow = styled.div`
  display: flex;
  align-items: end;
  padding-top: 3rem;
  gap: 1rem;

  ${TextButton} {
    width: 95%;
  }
`;
