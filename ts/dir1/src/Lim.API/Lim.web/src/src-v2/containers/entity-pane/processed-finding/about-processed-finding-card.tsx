import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AboutProcessedFindingCardContent } from '@src-v2/containers/entity-pane/processed-finding/components/about-processed-finding-card-content';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export const AboutProcessedFindingCard = ({
  finding,
  risk,
  type = 'risk',
  ...props
}: {
  finding: LightweightFindingResponse;
  risk?: RiskTriggerSummaryResponse;
  type?: string;
} & ControlledCardProps) => {
  return (
    <ControlledCard {...props} title={`About this ${type}`}>
      <AboutProcessedFindingCardContent finding={finding} risk={risk} />
    </ControlledCard>
  );
};
