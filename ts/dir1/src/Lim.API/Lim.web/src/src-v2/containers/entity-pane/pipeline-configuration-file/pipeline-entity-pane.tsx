import styled from 'styled-components';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { DiffableEntityPaneHeader } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane-header';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { VendorIcon } from '@src-v2/components/icons';
import { PaneProps } from '@src-v2/components/panes/pane';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Title } from '@src-v2/components/typography';
import { PipelineMainTab } from '@src-v2/containers/entity-pane/pipeline-configuration-file/pipeline-main-tab';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { PipelineConfigurationFileElement } from '@src-v2/types/inventory-elements/pipeline-configuration-file-element';
import { humanize } from '@src-v2/utils/string-utils';

export function PipelineEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props} header={<PipelinePaneHeader />} navigationTab={['profile']}>
      {props => <PipelineMainTab {...props} />}
    </DiffableEntityPane>
  );
}

export const PipelinePaneHeader = () => {
  const { element } = usePipelinePaneContext();

  return (
    <DiffableEntityPaneHeader
      title={
        <PipelineHeaderTitle>
          <Tooltip content={humanize(element.iacFramework)}>
            <VendorIcon name={element.iacFramework} fallback={humanize(element.iacFramework)} />
          </Tooltip>{' '}
          {element.displayName}
        </PipelineHeaderTitle>
      }
    />
  );
};

const PipelineHeaderTitle = styled(Title)`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export function usePipelinePaneContext() {
  return useEntityPaneContext<PipelineConfigurationFileElement>();
}
