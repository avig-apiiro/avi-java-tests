import styled from 'styled-components';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { DiffableEntityPaneHeader } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane-header';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { PaneProps } from '@src-v2/components/panes/pane';
import { Title } from '@src-v2/components/typography';
import { PipelineDependenciesMainTab } from '@src-v2/containers/entity-pane/pipeline-dependencies/pipeline-depencdencies-main-tab';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { CicdPipelineDependencyDeclarationElement } from '@src-v2/types/inventory-elements/pipeline-configuration-file-element';

export function PipelineDependencyPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props} header={<PipelinePaneHeader />} navigationTab={['profile']}>
      {props => <PipelineDependenciesMainTab {...props} />}
    </DiffableEntityPane>
  );
}

export const PipelinePaneHeader = () => {
  const { element } = useDependencyPipelinePaneContext();

  return (
    <DiffableEntityPaneHeader
      title={<PipelineHeaderTitle>{element.displayName}</PipelineHeaderTitle>}
    />
  );
};

const PipelineHeaderTitle = styled(Title)`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export function useDependencyPipelinePaneContext() {
  return useEntityPaneContext<CicdPipelineDependencyDeclarationElement>();
}
