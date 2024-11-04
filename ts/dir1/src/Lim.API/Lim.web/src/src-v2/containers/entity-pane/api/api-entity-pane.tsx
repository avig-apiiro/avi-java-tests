import styled from 'styled-components';
import { CodeBadge } from '@src-v2/components/badges';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { DiffableEntityPaneHeader } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane-header';
import { PaneProps } from '@src-v2/components/panes/pane';
import { EllipsisText, Title } from '@src-v2/components/typography';
import { ApiMainTab } from '@src-v2/containers/entity-pane/api/main-tab/api-main-tab';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { useInject } from '@src-v2/hooks';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

export function ApiEntityPane({
  dataModelReference,
  ...props
}: { dataModelReference: DiffableEntityDataModelReference } & PaneProps) {
  const { inventory } = useInject();

  return (
    <DiffableEntityPane
      {...props}
      dataModelReference={dataModelReference}
      elementDataFetcher={inventory.getApiElement}
      header={<ApiEntityPaneHeader />}>
      {props => <ApiMainTab {...props} />}
    </DiffableEntityPane>
  );
}

function ApiEntityPaneHeader() {
  const { element } = useApiPaneContext();

  return (
    <DiffableEntityPaneHeader
      title={
        <ApiHeaderTitle>
          <CodeBadge>{element.codeReference.httpMethod}</CodeBadge>
          <EllipsisText>{element.codeReference.httpRoute}</EllipsisText>
        </ApiHeaderTitle>
      }
    />
  );
}

const ApiHeaderTitle = styled(Title)`
  display: flex;
  gap: 1rem;
  align-items: center;
`;
