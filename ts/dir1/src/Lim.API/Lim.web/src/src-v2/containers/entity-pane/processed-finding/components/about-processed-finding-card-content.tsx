import _ from 'lodash';
import { Divider } from '@src-v2/components/divider';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { RiskTag } from '@src-v2/components/tags';
import { DateTime } from '@src-v2/components/time';
import { Heading5 } from '@src-v2/components/typography';
import { dateFormats } from '@src-v2/data/datetime';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export const AboutProcessedFindingCardContent = ({
  finding,
  risk,
}: {
  finding: LightweightFindingResponse;
  risk: RiskTriggerSummaryResponse;
}) => {
  const { finding: findingObj } = finding;

  return (
    <EvidenceLinesWrapper>
      {risk && (
        <>
          <RiskLevelWidget isExtendedWidth risk={risk} />
          <EvidenceLine isExtendedWidth label="Discovered on">
            <DateTime date={risk.discoveredAt} format={dateFormats.longDate} />
          </EvidenceLine>
          <DueDateEvidenceLine isExtendedWidth risk={risk} />
          <Divider />
        </>
      )}
      <Heading5>Finding details</Heading5>
      <EvidenceLine isExtendedWidth label="Finding name">
        {findingObj.title}
      </EvidenceLine>
      {Boolean(findingObj.severity) && (
        <EvidenceLine isExtendedWidth label="Severity">
          <RiskTag riskLevel={_.camelCase(findingObj.severity.toString())}>
            {findingObj.severity}
          </RiskTag>
        </EvidenceLine>
      )}
      {Boolean(findingObj?.sourceProviders?.length) && (
        <SourceEvidenceLine isExtendedWidth providers={findingObj?.sourceProviders} />
      )}
    </EvidenceLinesWrapper>
  );
};
