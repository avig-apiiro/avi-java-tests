import { useMemo } from 'react';
import styled from 'styled-components';
import { SelectedCount } from '@src-v2/containers/data-table/table-controls';
import { formatNumber, pluralFormat } from '@src-v2/utils/number-utils';

export const SimpleTable = ({ items }) =>
  items.map((item, index) => (
    <Row key={index}>
      {item.map((value, index) => (
        <Cell key={index}>{value}</Cell>
      ))}
    </Row>
  ));

const Row = styled.div`
  display: table-row;
`;

const Cell = styled.span`
  display: table-cell;

  &:not(:last-child) {
    padding-right: 2rem;
  }
`;

export const SimpleTableCounter = ({ count, total, itemName }) => {
  const totalCount = useMemo(() => Math.max(count, total), [count, total]);

  return (
    <SelectedCount>
      <>
        {formatNumber(count)} {pluralFormat(count, itemName)}
        {totalCount && count !== totalCount ? ` out of ${formatNumber(totalCount)}` : null}{' '}
      </>
    </SelectedCount>
  );
};
