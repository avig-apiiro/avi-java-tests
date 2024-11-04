import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { SvgIcon } from '@src-v2/components/icons';
import { PaneProps } from '@src-v2/components/panes/pane';
import { RelatedApisCard } from '@src-v2/containers/entity-pane/sensitive-data/main-tab/related-apis-card';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { SensitiveDataElement } from '@src-v2/types/inventory-elements/sensitive-data-element';
import { humanize } from '@src-v2/utils/string-utils';

export function SensitiveDataEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisSensitiveDataCard {...childProps} />
          <RelatedApisCard {...childProps} />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisSensitiveDataCard(props: ControlledCardProps) {
  const { element, relatedProfile, risk } = useEntityPaneContext<SensitiveDataElement>();

  return (
    <ControlledCard {...props} title="About this sensitive data model">
      <EvidenceLinesWrapper>
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
          <CodeReferenceLink codeReference={element.codeReference} repository={relatedProfile} />
        </EvidenceLine>
        {Boolean(element.insights.length) && (
          <EvidenceLine isExtendedWidth label="Insights">
            <ElementInsights insights={element.insights} />
          </EvidenceLine>
        )}
        {Boolean(risk?.moduleName) && (
          <EvidenceLine isExtendedWidth label="Module">
            <SvgIcon name="Module" /> {risk.moduleName}
          </EvidenceLine>
        )}
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}
