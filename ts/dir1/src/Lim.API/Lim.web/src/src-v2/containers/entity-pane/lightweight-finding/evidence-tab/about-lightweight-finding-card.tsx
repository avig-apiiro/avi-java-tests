import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AboutCardContent } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/about-card-content';
import { ExtendedAboutCardContent } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/extended-about-card-content';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export const AboutLightweightFindingCard = ({
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
    <ControlledCard
      {...props}
      title={`About this ${type}`}
      nestedContent={
        finding.finding.sourceRawFindings.length > 0 ? (
          <ExtendedAboutCardContent finding={finding} />
        ) : null
      }>
      <AboutCardContent finding={finding} risk={risk} />
    </ControlledCard>
  );
};
