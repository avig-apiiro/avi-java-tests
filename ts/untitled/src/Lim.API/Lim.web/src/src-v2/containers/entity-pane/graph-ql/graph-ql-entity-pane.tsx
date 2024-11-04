import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { PaneProps } from '@src-v2/components/panes/pane';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { humanize } from '@src-v2/utils/string-utils';

export function GraphQlEntityPane(
  props: {
    dataModelReference: DiffableEntityDataModelReference;
  } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisGraphQlCard {...childProps} />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisGraphQlCard(props: ControlledCardProps) {
  const { element, relatedProfile } = useEntityPaneContext<
    BaseElement & {
      kind: string;
    }
  >();

  return (
    <ControlledCard {...props} title={`About this Graph QL ${element.kind ?? ''}`}>
      {element.codeReference && (
        <EvidenceLine label="Introduced through">
          <CodeReferenceLink codeReference={element.codeReference} repository={relatedProfile} />
        </EvidenceLine>
      )}
      {Object.entries(element).map(
        ([key, value]) =>
          (typeof value === 'string' || typeof value === 'number') && (
            <EvidenceLine key={key} label={humanize(key)}>
              {value}
            </EvidenceLine>
          )
      )}
    </ControlledCard>
  );
}
