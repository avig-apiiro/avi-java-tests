import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { PaneProps } from '@src-v2/components/panes/pane';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { ServerlessFunctionElement } from '@src-v2/types/inventory-elements/serverless-function-element';

export function ServerlessFunctionEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisServerlessFunctionCard {...childProps} />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisServerlessFunctionCard(props: ControlledCardProps) {
  const { element } = useEntityPaneContext<ServerlessFunctionElement>();

  return (
    <ControlledCard {...props} title="About this Serverless function">
      <EvidenceLine label="Provider">{element.provider}</EvidenceLine>
      {Boolean(element.triggerEvents?.length) && (
        <EvidenceLine label="Triggered by">{element.triggerEvents.join(', ')}</EvidenceLine>
      )}
      <EvidenceLine label="Runtime">{element.runtime}</EvidenceLine>
      {element.iamRole && <EvidenceLine label="Linked IAM role">{element.iamRole}</EvidenceLine>}
      {element.handlerIdentifier && (
        <EvidenceLine label="Code handler">{element.handlerIdentifier}</EvidenceLine>
      )}

      {element.region && <EvidenceLine label="Deployed in region">{element.region}</EvidenceLine>}
      {element.stage && <EvidenceLine label="Deployed at stage">{element.stage}</EvidenceLine>}
    </ControlledCard>
  );
}
