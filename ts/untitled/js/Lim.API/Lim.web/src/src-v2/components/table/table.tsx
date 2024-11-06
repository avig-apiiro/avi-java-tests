import { forwardRef } from 'react';
import styled from 'styled-components';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { Combobox, Input } from '@src-v2/components/forms';
import { Select } from '@src-v2/components/forms/select';
import { BaseIcon } from '@src-v2/components/icons';
import { Popover } from '@src-v2/components/tooltips/popover';
import { ExternalLink } from '@src-v2/components/typography';
import { useGroupProperties } from '@src-v2/hooks';
import { assignStyledNodes } from '@src-v2/types/styled';

const cellProperties = ['rowSpan', 'headers', 'colSpan'];

const _Table = styled.table`
  position: relative;
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  font-size: var(--font-size-s);

  &[data-disabled]:before {
    content: '';
    position: absolute;
    z-index: 10;
    inset: 0;
    border-radius: var(--table-border-radius, 3rem);
    background-color: var(--overlay-light-color);
  }

  > :first-child > tr:first-child {
    border-top-left-radius: var(--table-border-radius, 3rem);
    border-top-right-radius: var(--table-border-radius, 3rem);

    > :first-child {
      border-top-left-radius: var(--table-border-radius, 3rem);
    }

    > :last-child {
      border-top-right-radius: var(--table-border-radius, 3rem);
    }
  }

  > :last-child > tr:last-child {
    border-bottom-left-radius: var(--table-border-radius, 3rem);
    border-bottom-right-radius: var(--table-border-radius, 3rem);

    > :first-child {
      border-bottom-left-radius: var(--table-border-radius, 3rem);
    }

    > :last-child {
      border-bottom-right-radius: var(--table-border-radius, 3rem);
    }
  }

  [data-pinned-column] {
    position: sticky;
    top: auto;
    left: 0;
    z-index: 5;
    background-color: var(--color-white);

    &[data-action-menu] {
      left: auto;
      right: 0;
    }
  }

  &[data-scrolled] {
    // removes the border of the last pinned element for advantage of box-shadow

    [data-pinned-column='last']:not([data-selection-column]) {
      &:before {
        border-left: none;
      }
    }

    &[data-scrolled='left'],
    &[data-scrolled='both'] {
      [data-pinned-column='last'] {
        &:after {
          content: '';
          width: 2rem;
          height: 100%;
          position: absolute;
          top: 0;
          right: 0;
          box-shadow: var(--elevation-2);
          clip-path: inset(0 -2rem 0 0);
        }

        &:before {
          border-left: none;
        }
      }
    }

    &[data-scrolled='right'],
    &[data-scrolled='none'] {
      [data-pinned-column='last']:not([data-selection-column]) {
        border-right: 0.25rem solid var(--color-blue-gray-25);
      }
    }

    &[data-scrolled='right'],
    &[data-scrolled='both'] {
      [data-action-menu][data-pinned-column] {
        &:after {
          content: '';
          position: absolute;
          width: 2rem;
          height: 100%;
          top: 0;
          left: 0;
          box-shadow: var(--elevation-2);
          clip-path: inset(0 0 0 -2rem);
        }
      }
    }
`;

const Header = styled.th`
  position: relative;
  height: 100%;
  padding: 1.75rem 0 1.75rem 4rem;
  color: var(--color-blue-gray-60);
  border: 0.25rem solid var(--color-blue-gray-30);
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;

  &[data-draggable] {
    cursor: grab;
  }

  &[data-dragging] {
    cursor: grabbing;
  }

  &[data-pinned-column] {
    background-color: var(--color-blue-gray-20);
  }

  &[data-dropzone] {
    &:after {
      content: '';
      width: 2rem;
      height: 11.5rem;
      position: absolute;
      inset: 0;
      background-color: var(--color-blue-gray-40);
      z-index: 9;
    }

    &[data-has-nested]:after {
      height: 17.5rem;
    }

    // align the nested header dropzone-mark to be full length (on both header and nested header rows)

    &[data-nested-header]:after {
      top: -8.75rem;
    }

    &[data-dropzone='false'] {
      &:after {
        background-color: var(--color-red-30);
      }
    }
  }

  &:not(:first-child) {
    border-left: 0;
  }

  &:not(:last-child) {
    border-right: 0;

    &:before {
      content: '';
      position: absolute;
      inset: 2rem 0 2rem auto;
      border-left: 0.25rem solid var(--color-blue-gray-30);
    }
  }
`;

const Cell = styled.td`
  height: 12rem;
  max-width: 40rem;
  position: relative;
  padding: 0 4rem;
  color: var(--color-blue-gray-70);
  border-top: 0.125rem solid var(--color-blue-gray-20);
  border-bottom: 0.125rem solid var(--color-blue-gray-20);

  &:first-child {
    border-left: 0.25rem solid var(--color-blue-gray-30);
  }

  &:last-child {
    border-right: 0.25rem solid var(--color-blue-gray-30);
  }

  ${ExternalLink} {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const FlexCell = styled(props => {
  const [cellProps, elementProps] = useGroupProperties(props, cellProperties);

  return (
    <Cell
      {...cellProps}
      data-pinned-column={props['data-pinned-column']}
      data-action-menu={props['data-action-menu']}
      style={{ left: props.style?.left ?? 'auto' }}>
      <div {...elementProps} data-pinned-column={null} data-action-menu={null} />
    </Cell>
  );
})`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const CenterCell = styled(FlexCell)`
  justify-content: center;
`;

const DropdownCell = styled(
  forwardRef((props, ref) => {
    const [cellProps, elementProps] = useGroupProperties(props, cellProperties);
    return (
      <Cell {...cellProps}>
        <div ref={ref} {...elementProps} />
      </Cell>
    );
  })
)`
  display: flex;
  width: fit-content;
  align-items: center;
  overflow: visible;
  gap: 3rem;

  ${DropdownMenu.Popover} {
    position: absolute;
    z-index: 1010;
    top: -1rem;
    background-color: var(--color-white);
    box-shadow: 0 1rem 2.5rem var(--default-shadow-color);
    border: 0.25rem solid var(--color-blue-gray-20);
    border-radius: 1rem;

    ${Popover.Arrow} {
      display: none;
    }
  }

  ${Combobox} {
    ${BaseIcon}[data-name="Chevron"] {
      display: none;
    }

    > ${Select.SelectIconButton} {
      padding-right: 4rem;

      &:before {
        display: none;
      }
    }
  }

  ${Input} {
    width: 100rem;
    padding: 0;
    border: none;
    cursor: pointer;

    &:disabled {
      background-color: var(--color-white);
    }

    &::placeholder {
      font-size: var(--font-size-s);
      font-weight: 400;
      color: var(--color-blue-gray-50);
    }
  }
`;

const Row = styled.tr`
  height: 12rem;
  cursor: ${props => (props.onClick ? 'pointer' : 'inherit')};

  > :first-child {
    padding-left: 6rem;
  }

  &[data-has-nested] {
    height: 9rem;

    ${Header} {
      border-bottom: 0;
      overflow: unset;

      &[data-pinned-column] {
        z-index: 9;
      }

      &:not(:first-child) {
        padding: 0 0 0 4rem;

        // make sure text is centered for parents of nested cells

        &[data-nested-parent] {
          padding: 0;
        }
      }

      &:last-child {
        padding-right: 4rem;
      }

      &:not(:last-child):before {
        inset: 2rem 0 0 auto;
      }
    }
  }

  &[data-nested-row] {
    height: 9rem;

    ${Header} {
      &:not([data-is-nested]) {
        border-top: none;
      }

      &:not(:last-child):before {
        inset: 0 0 2rem auto;
      }
    }
  }
`;

const Head = styled.thead`
  position: sticky;
  top: 0;
  background-color: var(--color-blue-gray-20);
  z-index: 9998;
`;

const Body = styled.tbody`
  background-color: var(--color-white);

  ${Row} {
    &:hover ${Cell} {
      background-color: var(--color-blue-15);
    }

    &[data-selected] {
      ${Cell} {
        background-color: var(--color-blue-25);
        border-top: 0.25rem solid var(--color-blue-35);
        border-bottom: 0.25rem solid var(--color-blue-35);

        &:first-of-type {
          border-left: 0.25rem solid var(--color-blue-35);
        }

        &:last-of-type {
          border-right: 0.25rem solid var(--color-blue-35);
        }
      }
    }

    &[data-expanded] {
      ${Cell} {
        background-color: var(--color-blue-30);
        border-top: 0.25rem solid var(--color-blue-50);
        border-bottom: 0.25rem solid var(--color-blue-50);

        &:first-of-type {
          border-left: 0.25rem solid var(--color-blue-50);
        }

        &:last-of-type {
          border-right: 0.25rem solid var(--color-blue-50);
        }
      }
    }

    &:last-child ${Cell} {
      border-bottom: 0.25rem solid var(--color-blue-gray-30);
    }
  }
`;

const Foot = styled.tfoot`
  background: var(--color-blue-gray-20);

  ${Row}:last-child ${Cell} {
    border-bottom: 0.25rem solid var(--color-blue-gray-30);
  }
`;

const EmptyMessage = styled(props => (
  <Row>
    <Cell {...props} />
  </Row>
))`
  pointer-events: none;
  text-align: center;
`;

export const Table = assignStyledNodes(_Table, {
  Header,
  Cell,
  FlexCell,
  CenterCell,
  DropdownCell,
  Row,
  Head,
  Body,
  Foot,
  EmptyMessage,
});
