import { FC, ReactNode, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Checkbox } from '@src-v2/components/forms';
import { BaseListBoxItem } from '@src-v2/components/forms/dual-list-box/dual-list-box';
import { useListBoxDisplayContext } from '@src-v2/components/forms/dual-list-box/list-box-display-context';
import {
  SingleBoxDisplay,
  SingleBoxDisplayProps,
} from '@src-v2/components/forms/dual-list-box/single-box-display';
import { InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { ListItem, SubHeading4, UnorderedList } from '@src-v2/components/typography';
import { assignStyledNodes } from '@src-v2/types/styled';
import { humanize } from '@src-v2/utils/string-utils';

type ListBoxDisplayProps = Omit<SingleBoxDisplayProps, 'itemTypeDisplayName' | 'prefix' | 'footer'>;

function _PlainListBox({ children, ...props }: ListBoxDisplayProps) {
  const { itemTypeDisplayName, prefix, footer } = useListBoxDisplayContext();

  return (
    <SingleBoxDisplay
      {...props}
      itemTypeDisplayName={itemTypeDisplayName}
      prefix={prefix}
      footer={footer}>
      {children}
    </SingleBoxDisplay>
  );
}

function _Content<TItem extends BaseListBoxItem>({
  items,
  listElement: ListElement = UnorderedList,
  ...props
}: {
  items: TItem[];
  listElement?: FC<{ scrollParent?: HTMLElement; children: ReactNode }>;
}) {
  const { itemTypeDisplayName, prefix } = useListBoxDisplayContext<TItem>();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div {...props} ref={containerRef}>
      {!items.length ? (
        <SubHeading4 data-empty-label>
          No {humanize(`${prefix} ${itemTypeDisplayName}`).toLowerCase()}
        </SubHeading4>
      ) : (
        <ListElement scrollParent={containerRef.current}>
          {items.map((item, index) => (
            <DualListItem key={index} item={item} />
          ))}
        </ListElement>
      )}
    </div>
  );
}

function DualListItem<TItem extends BaseListBoxItem>({ item }: { item: TItem }) {
  const { renderItem: ItemContent, checkedData } = useListBoxDisplayContext<TItem>();
  const handleClick = useCallback(() => checkedData.toggleItem(item), [item, checkedData]);
  const checked = useMemo(() => checkedData.isChecked(item), [checkedData.isChecked, item]);

  return (
    <ListItem>
      <InputClickableLabel>
        <Checkbox checked={checked} onChange={handleClick} />
        <ItemContent item={item} />
      </InputClickableLabel>
    </ListItem>
  );
}

export const ListBoxDisplay = assignStyledNodes(
  styled(_PlainListBox)`
    display: flex;
    max-height: 100%;
    padding: 3rem;
    flex-direction: column;
    gap: 2rem;
    overflow: hidden;
    box-shadow: var(--elevation-0);
    font-size: var(--font-size-s);
    border-radius: 3rem;

    &[data-main] {
      grid-area: main;
    }

    &[data-secondary] {
      grid-area: secondary;
    }

    ${SearchInput} {
      width: 100%;
      height: 8rem;
    }

    ${UnorderedList} {
      width: 100%;
      padding: 0;

      ${ListItem} {
        padding: 1rem 2rem;
        border-radius: 2rem;

        &:hover {
          background-color: var(--color-blue-gray-15);
        }

        &:not(:last-child) {
          margin-bottom: 1rem;
        }

        ${InputClickableLabel} {
          max-width: 100%;
          display: flex;
          gap: 1rem;
          align-items: center;

          ${Checkbox} {
            margin-right: 1rem;
          }
        }
      }
    }
  `,
  {
    Content: styled(_Content)`
      overflow: auto;
      flex: 1;

      [data-empty-label] {
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: center;
      }
    `,
  }
);
