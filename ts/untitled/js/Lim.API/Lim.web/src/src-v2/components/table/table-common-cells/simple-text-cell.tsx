import { Children, HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { Table } from '@src-v2/components/table/table';
import { Small } from '@src-v2/components/typography';

export const SimpleTextCell = forwardRef<
  HTMLTableCellElement,
  {
    children: string;
  } & Omit<HTMLAttributes<HTMLTableCellElement>, 'children'>
>(({ children, ...props }, ref) => {
  return (
    <Table.Cell {...props} ref={ref}>
      <ClampText>{children}</ClampText>
    </Table.Cell>
  );
});

const Main = styled.div`
  font-size: var(--font-size-s);
`;

export function DoubleLinedCell({ children, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  const childrenAsArray = Children.toArray(children);
  if (childrenAsArray.length !== 2) {
    throw new RangeError('DoubleLinedCell must have exactly 2 children');
  }

  return (
    <Table.Cell {...props}>
      <Small>{childrenAsArray[0]}</Small>
      <Main>{childrenAsArray[1]}</Main>
    </Table.Cell>
  );
}
