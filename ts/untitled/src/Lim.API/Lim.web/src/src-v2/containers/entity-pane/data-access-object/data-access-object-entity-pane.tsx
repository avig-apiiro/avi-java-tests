import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { PaneProps } from '@src-v2/components/panes/pane';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

export function DataAccessObjectEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisDataAccessObjectCard {...childProps} />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisDataAccessObjectCard(props: ControlledCardProps) {
  const { element, relatedProfile } = useEntityPaneContext();

  return (
    <ControlledCard {...props} title="About this data access object">
      <EvidenceLine label="Name">{element.displayName}</EvidenceLine>
      <EvidenceLine label="Introduced through">
        <CodeReferenceLink codeReference={element.codeReference} repository={relatedProfile} />
      </EvidenceLine>
    </ControlledCard>
  );
}
