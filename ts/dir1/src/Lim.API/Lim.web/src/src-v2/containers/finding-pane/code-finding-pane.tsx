import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { PaneProps } from '@src-v2/components/panes/pane';
import { CodeFindingPaneContent } from '@src-v2/containers/finding-pane/code-finding-pane-content';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

export function CodeFindingPane({
  dataModelReference,
  ...props
}: { dataModelReference: DiffableEntityDataModelReference } & PaneProps) {
  return (
    <DiffableEntityPane dataModelReference={dataModelReference} {...props}>
      {childProps => <CodeFindingPaneContent {...childProps} />}
    </DiffableEntityPane>
  );
}
