import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { PaneProps } from '@src-v2/components/panes/pane';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export function LicenseEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisLicenseCard {...childProps} />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisLicenseCard(props: ControlledCardProps) {
  const { element } = useEntityPaneContext<BaseElement & { dependencies: any[] }>();

  return (
    <ControlledCard {...props} title="About this license">
      <EvidenceLine label="Number of packages">{element.dependencies?.length}</EvidenceLine>
    </ControlledCard>
  );
}
