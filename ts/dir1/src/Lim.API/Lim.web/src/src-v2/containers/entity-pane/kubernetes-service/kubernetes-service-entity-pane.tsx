import _ from 'lodash';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { PaneProps } from '@src-v2/components/panes/pane';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { KubernetesServiceElement } from '@src-v2/types/inventory-elements/kubernetes-service-element';

export function KubernetesServiceEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisKubernetesServiceCard {...childProps} />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisKubernetesServiceCard(props: ControlledCardProps) {
  const { element } = useEntityPaneContext<KubernetesServiceElement>();

  return (
    <ControlledCard {...props} title="About this Kubernetes service">
      {!_.isEmpty(element.backingDeploymentsNamesById) && (
        <EvidenceLine label="Linked deployments">
          {Object.values(element.backingDeploymentsNamesById).join(', ')}
        </EvidenceLine>
      )}
      {Boolean(element.ports?.length) && (
        <EvidenceLine label="Ports">
          {element.ports.map(({ targetPort }) => targetPort).join(', ')}
        </EvidenceLine>
      )}
      <EvidenceLine label="Type">{element.type}</EvidenceLine>
    </ControlledCard>
  );
}
