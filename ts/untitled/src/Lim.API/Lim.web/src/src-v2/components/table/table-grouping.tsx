import { observer } from 'mobx-react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { ErrorLayout } from '@src-v2/components/layout';
import { Table } from '@src-v2/components/table/table';
import { TableGroupingRow } from '@src-v2/components/table/table-grouping-row';
import { customScrollbar } from '@src-v2/style/mixins';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

type TableGroupingProps = {
  dataGroupingModel: any;
};

export const TableGrouping = assignStyledNodes(
  observer(({ dataGroupingModel, ...props }: TableGroupingProps) => (
    <Container {...props} data-loading={dataAttr(dataGroupingModel.searchState.loading)}>
      <GroupingContainer>
        <ScrollContainer>
          <Header>
            {/* this cell stands for the chevron first cell in a row */}
            <TableGrouping.Cell data-chevron />
            {dataGroupingModel.columns.map(column => (
              <TableGrouping.Cell key={column.key}>{column.label}</TableGrouping.Cell>
            ))}
          </Header>
          {dataGroupingModel.searchState.items.map(item => (
            <TableGroupingRow
              key={item.groupValue}
              item={item}
              dataGroupingModel={dataGroupingModel}
            />
          ))}
          {dataGroupingModel.searchState?.items?.length === 0 && (
            <NoResults>
              {!dataGroupingModel.searchState.loading && <ErrorLayout.NoResults data-contained />}
            </NoResults>
          )}
        </ScrollContainer>
      </GroupingContainer>
      {dataGroupingModel.searchState.loading && <TableGroupingLoadingSpinner />}
    </Container>
  )),
  {
    Cell: styled.span`
      display: flex;
      align-items: center;
      padding: 0 4rem;
      font-size: var(--font-size-s);
      gap: 2rem;

      &[data-center] {
        justify-content: center;
      }
    `,
  }
);

const Container = styled.div`
  height: 100%;
  position: relative;

  &[data-loading]:before {
    content: '';
    position: absolute;
    z-index: 10;
    inset: 0;
    border-radius: var(--table-border-radius, 3rem);
    background-color: var(--overlay-light-color);
  }

  ${Table.Head} {
    box-shadow: none;
  }
`;

const TableGroupingLoadingSpinner = styled(LogoSpinner)`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
`;

const ScrollContainer = styled.div`
  --default-grid-template-columns: 15rem calc(100% - 115rem) 73rem 27rem;
  border-radius: 3rem;
  border: 0.25rem solid var(--color-blue-gray-25);
  border-top: none;
`;

const GroupingContainer = styled.div`
  ${customScrollbar};

  max-height: calc(100vh - 65rem);
  position: relative;
  overflow-y: scroll;
  border-radius: 3rem;
`;

const Header = styled(TableGroupingRow.Layout)`
  position: sticky;
  top: 0;
  border-top: 0.25rem solid var(--color-blue-gray-25);
  border-bottom: 0.25rem solid var(--color-blue-gray-25);
  border-top-right-radius: 3rem;
  border-top-left-radius: 3rem;

  background-color: var(--color-blue-gray-20);
  z-index: 9;

  ${TableGrouping.Cell} {
    &:not(:last-of-type):not([data-chevron]) {
      border-right: 0.25rem solid var(--color-blue-gray-25);
    }

    &:last-of-type {
      padding-right: 0;
    }
  }
`;

const NoResults = styled.div`
  height: 30rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-white);
  border-radius: 3rem;
`;
