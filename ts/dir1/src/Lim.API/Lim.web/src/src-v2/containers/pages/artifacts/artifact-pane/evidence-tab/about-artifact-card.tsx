import _ from 'lodash';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { Divider } from '@src-v2/components/divider';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { RiskTag } from '@src-v2/components/tags';
import { DateTime } from '@src-v2/components/time';
import { Heading5 } from '@src-v2/components/typography';
import { CardContentWrapper } from '@src-v2/containers/pages/artifacts/artifact-pane/components/common';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';
import { dateFormats } from '@src-v2/data/datetime';

export const AboutArtifactCard = (props: ControlledCardProps) => {
  const { risk, finding: findingObj } = useArtifactPaneContext();
  const {
    finding: { severity },
  } = findingObj;

  return (
    <ControlledCard {...props} title="About this risk">
      <CardContentWrapper>
        {risk && (
          <>
            <RiskLevelWidget isExtendedWidth risk={risk} />
            <EvidenceLine isExtendedWidth label="Discovered on">
              <DateTime date={risk.discoveredAt} format={dateFormats.longDate} />
            </EvidenceLine>
            <DueDateEvidenceLine isExtendedWidth risk={risk} />
            {Boolean(risk.insights?.length) && (
              <EvidenceLine isExtendedWidth label="Insights">
                <ElementInsights insights={risk.insights} />
              </EvidenceLine>
            )}
            <Divider />
          </>
        )}
        <Heading5>Finding details</Heading5>
        {Boolean(risk.findingName) && (
          <EvidenceLine isExtendedWidth label="Finding name">
            {risk?.findingName}
          </EvidenceLine>
        )}
        {Boolean(severity) && (
          <EvidenceLine isExtendedWidth label="Severity">
            <RiskTag riskLevel={_.camelCase(severity.toString())}>{severity}</RiskTag>
          </EvidenceLine>
        )}
        {Boolean(risk?.providers?.length) && (
          <SourceEvidenceLine isExtendedWidth providers={risk.providers} />
        )}
      </CardContentWrapper>
    </ControlledCard>
  );
};
