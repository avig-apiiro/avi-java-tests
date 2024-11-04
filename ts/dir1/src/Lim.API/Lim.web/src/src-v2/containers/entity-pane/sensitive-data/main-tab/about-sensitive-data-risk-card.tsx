import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { SvgIcon } from '@src-v2/components/icons';
import { useSensitiveDataPaneContext } from '@src-v2/containers/entity-pane/sensitive-data/use-sensitive-data-pane-context';
import { humanize } from '@src-v2/utils/string-utils';

export function AboutSensitiveDataRiskCard(props: ControlledCardProps) {
  const { risk, element, relatedProfile } = useSensitiveDataPaneContext();

  return (
    <ControlledCard {...props} title="About this risk">
      <EvidenceLinesWrapper>
        {risk && <RiskLevelWidget isExtendedWidth risk={risk} />}
        {risk && (
          <>
            <DiscoveredEvidenceLine isExtendedWidth risk={risk} />
            <DueDateEvidenceLine isExtendedWidth risk={risk} />
          </>
        )}
        {Boolean(element.sensitiveDataDefinedTypes?.length) && (
          <EvidenceLine isExtendedWidth label="Data type">
            {element.sensitiveDataDefinedTypes.join(', ')}
          </EvidenceLine>
        )}
        {element.sensitiveDataSource && (
          <EvidenceLine isExtendedWidth label="Field type">
            {humanize(element.sensitiveDataSource)}
          </EvidenceLine>
        )}
        <EvidenceLine isExtendedWidth label="Introduced through">
          <CodeReferenceLink repository={relatedProfile} codeReference={element.codeReference} />
        </EvidenceLine>
        {Boolean(element.insights?.length) && (
          <EvidenceLine isExtendedWidth label="Insights">
            <ElementInsights insights={element.insights} />
          </EvidenceLine>
        )}
        {Boolean(risk?.moduleName) && (
          <EvidenceLine isExtendedWidth label="Module">
            <SvgIcon name="Module" /> {risk.moduleName}
          </EvidenceLine>
        )}
        <SourceEvidenceLine isExtendedWidth providers={risk.providers} />
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}
