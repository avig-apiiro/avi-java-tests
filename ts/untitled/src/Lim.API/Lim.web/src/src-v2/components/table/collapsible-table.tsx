import _ from 'lodash';
import { ReactNode, useRef } from 'react';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { ErrorLayout } from '@src-v2/components/layout';
import { Table } from '@src-v2/components/table/table';
import { TableNotice } from '@src-v2/components/table/table-addons';
import { TableHeader } from '@src-v2/components/table/table-header';
import { useToggle } from '@src-v2/hooks';
import { useCombineCallbacks } from '@src-v2/hooks/use-combine-callbacks';
import { customScrollbar } from '@src-v2/style/mixins';

export function CollapsibleTable<T>({
  onOpen,
  tableModel,
  items = [],
  compactRowsNumber = 10,
  emptyStateLayout = <ErrorLayout.NoResults data-contained />,
}: {
  tableModel: any;
  items: T[];
  onOpen?: () => void;
  compactRowsNumber?: number;
  emptyStateLayout?: ReactNode;
}) {
  const [isOpen, toggleIsOpen] = useToggle(items.length <= compactRowsNumber);

  const tableRef = useRef<HTMLTableElement>();

  const handleClick = useCombineCallbacks(toggleIsOpen, onOpen);

  return (
    <>
      <ScrollContainer>
        <Table ref={tableRef}>
          <TableHeader tableModel={tableModel} />
          <Table.Body>
            {items?.length ? (
              _.take(items, isOpen ? items.length : compactRowsNumber).map((item, index) => (
                <Table.Row key={index}>
                  {tableModel.columns?.map(({ Cell, ...column }) => (
                    <Cell key={column.key} data={item} />
                  ))}
                </Table.Row>
              ))
            ) : (
              <TableNotice colSpan={tableModel.columns?.length}>{emptyStateLayout}</TableNotice>
            )}
          </Table.Body>
        </Table>
      </ScrollContainer>

      {items.length > compactRowsNumber && (
        <ToggleCollapsibleContainer isOpen={isOpen} onClick={handleClick}>
          <TextButton underline onClick={_.noop}>
            Show {isOpen ? 'less' : 'more'}
          </TextButton>
          <SvgIcon name="Chevron" />
        </ToggleCollapsibleContainer>
      )}
    </>
  );
}

const ScrollContainer = styled.div`
  max-width: 100%;
  transition: height 400ms ease-in-out;
  overflow-x: auto;
  overflow-y: hidden;

  ${customScrollbar}
`;

const ToggleCollapsibleContainer = styled.div<{ isOpen: Boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  gap: 1rem;
  cursor: pointer;
  font-size: var(--font-size-s);
  font-weight: 300;

  ${BaseIcon} {
    transform: ${props => `rotate(${props.isOpen ? '-' : ''}90deg)`};
  }
`;
