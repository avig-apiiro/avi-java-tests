import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Collapsible } from '@src-v2/components/collapsible';
import { GroupingCollapsibleBody } from '@src-v2/containers/risks/risks-grouping';
import { useToggle } from '@src-v2/hooks';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

type RowProps = StyledProps<{
  dataGroupingModel: any;
  item: any;
}>;

export const _TableGroupingRow = styled(
  observer(({ dataGroupingModel, item, ...props }: RowProps) => {
    const [open, toggleCollapsible] = useToggle();
    const { isOpen, shouldRender, getTriggerProps, getContentProps } = useCollapsible({ open });

    return (
      <div {...props} data-open={dataAttr(isOpen)}>
        <Layout {...getTriggerProps()} onClick={toggleCollapsible}>
          <Collapsible.Chevron name="Chevron" />
          {dataGroupingModel.columns.map(({ Cell, key }) => (
            <Cell key={key} item={item} />
          ))}
        </Layout>
        <Collapsible.Body {...getContentProps()}>
          {shouldRender && (
            <AsyncBoundary>
              <GroupingCollapsibleBody dataGroupingModel={dataGroupingModel} item={item} />
            </AsyncBoundary>
          )}
        </Collapsible.Body>
      </div>
    );
  })
)`
  background-color: var(--color-white);
  cursor: pointer;

  &:not(:last-of-type) {
    border-bottom: 0.25rem solid var(--color-blue-gray-25);
  }

  &:last-of-type {
    border-radius: 3rem;
  }

  &[data-open] {
    [data-grouping-title] {
      font-weight: 600;
    }

    ${Collapsible.Chevron} {
      color: var(--color-blue-gray-60);
      transform: rotate(90deg);
    }
  }

  &:hover {
    background-color: var(--color-blue-20);
  }

  ${Collapsible.Chevron} {
    width: 8rem;
    height: 8rem;
    transform: rotate(0deg);
  }
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: var(--default-grid-template-columns);
  padding: 3rem 5rem;
`;

export const TableGroupingRow = assignStyledNodes(_TableGroupingRow, {
  Layout,
});
