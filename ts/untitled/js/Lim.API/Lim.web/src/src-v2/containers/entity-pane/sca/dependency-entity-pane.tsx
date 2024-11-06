import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { PaneProps } from '@src-v2/components/panes/pane';
import { ScaMainTab } from '@src-v2/containers/entity-pane/sca/main-tab/sca-main-tab';
import { useInject } from '@src-v2/hooks';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

export function DependencyEntityPane({
  dataModelReference,
  ...props
}: { dataModelReference: DiffableEntityDataModelReference } & PaneProps) {
  const { inventory } = useInject();

  return (
    <DiffableEntityPane
      {...props}
      dataModelReference={dataModelReference}
      elementDataFetcher={inventory.getDependencyElement}>
      {props => <ScaMainTab {...props} dataModelReference={dataModelReference} />}
    </DiffableEntityPane>
  );
}
