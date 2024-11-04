import styled from 'styled-components';
import { InlineButton } from '@src-v2/components/buttons';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { Table } from '@src-v2/components/table/table';
import { assignStyledNodes } from '@src-v2/types/styled';

const Actions = styled.div`
  display: flex;
  flex: 1 0 auto;
  align-items: center;
  justify-content: flex-end;
  font-size: var(--font-size-s);
  gap: 2rem;

  ${InlineButton} {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const Filters = styled(Actions)`
  justify-content: space-between;
`;

const Counter = styled.span`
  margin-left: auto;
  padding: 0 0 1rem 0;
  text-align: end;
  align-self: end;
  white-space: nowrap;
`;

export const TablePagination = styled.div`
  display: flex;
  margin: 3rem 0 8rem;
  align-items: center;
  justify-content: flex-end;
  font-size: var(--font-size-s);
  gap: 10rem;
`;

export const TableNotice = styled(props => (
  <Table.Row>
    <Table.Cell {...props} />
  </Table.Row>
))`
  pointer-events: none;
  text-align: center;
`;

export const TableControls = assignStyledNodes(
  styled.div`
    display: flex;
    margin: 6rem 0 5rem;
    gap: 3rem;

    > ${SearchInput}:after {
      content: '';
      display: block;
      flex-grow: 1;
    }
  `,
  {
    Actions,
    Filters,
    Counter,
  }
);

export const FluidTableControls = styled(TableControls)`
  display: grid;
  grid-template-areas:
    'search actions'
    'filters counter';
  grid-template-columns: 1fr auto;
  row-gap: 5rem;
  column-gap: 0;

  ${SearchInput} {
    grid-area: search;
  }

  ${TableControls.Actions} {
    grid-area: actions;
  }

  ${TableControls.Filters} {
    grid-area: filters;
  }

  ${TableControls.Counter} {
    grid-area: counter;
    display: flex;
    align-items: center;
    gap: 2rem;
  }
`;
