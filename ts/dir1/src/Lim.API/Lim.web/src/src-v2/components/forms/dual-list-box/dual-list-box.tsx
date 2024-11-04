import { observer } from 'mobx-react';
import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { DragHandle } from '@src-v2/components/drag-handle';
import { ListBoxDisplayContext } from '@src-v2/components/forms/dual-list-box/list-box-display-context';
import { PersistentMainListBox } from '@src-v2/components/forms/dual-list-box/main-list-box';
import { SecondaryListBox } from '@src-v2/components/forms/dual-list-box/secondary-list-box';
import { useCheckedListItems } from '@src-v2/components/forms/dual-list-box/use-checked-list-items';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useMouseDrag } from '@src-v2/hooks/dom-events/use-mouse-drag';
import { SearchParams } from '@src-v2/services';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';

export interface BaseListBoxItem {
  key: string;
}

export type DualListBoxProps<TItem, TSearchParams = Partial<SearchParams>> = Omit<
  StyledProps,
  'children'
> & {
  searchMethod: (
    params: Partial<SearchParams> & TSearchParams
  ) => Promise<AggregationResult<TItem>>;
  defaultValues?: TItem[];
  searchParams?: TSearchParams;
  itemTypeDisplayName: string;
  filterBy: (item: TItem, searchTerm: string) => boolean;
  keyBy?: (item: TItem) => string;
  renderMainItem: FC<{ item: TItem }>;
  renderSecondaryItem?: FC<{ item: TItem }>;
  mainListFooter?: ReactNode;
  secondaryListFooter?: ReactNode;
  onChange: (items: TItem[]) => void;
};

const _DualListBox = observer(
  <TItem extends BaseListBoxItem, TSearchParams>({
    searchMethod,
    searchParams,
    defaultValues = [],
    filterBy,
    keyBy,
    renderMainItem,
    renderSecondaryItem,
    itemTypeDisplayName,
    mainListFooter,
    secondaryListFooter,
    onChange,
    ...props
  }: DualListBoxProps<TItem, TSearchParams>) => {
    const [mainBoxHeight, setMainBoxHeight] = useState<number>(50);
    const onMouseDown = useMouseDrag(moveEvent => {
      setMainBoxHeight(value => value + moveEvent.movementX / 10);
    });

    const [selectedItems, setSelectedItems] = useState(defaultValues);

    const mainCheckedData = useCheckedListItems<TItem>(keyBy);
    const secondaryCheckedData = useCheckedListItems<TItem>(keyBy);

    const handleSelect = useCallback(
      (items: TItem[]) => {
        setSelectedItems(items);
        onChange(items);
      },
      [onChange]
    );

    const moveLeftCheckedItems = useCallback(() => {
      handleSelect([...selectedItems, ...Object.values(mainCheckedData.items)]);
      mainCheckedData.reset();
    }, [handleSelect, mainCheckedData.items, mainCheckedData.reset]);

    const moveRightCheckedItems = useCallback(() => {
      handleSelect(selectedItems.filter(item => !secondaryCheckedData.isChecked(item)));
      secondaryCheckedData.reset();
    }, [handleSelect, secondaryCheckedData.isChecked, secondaryCheckedData.reset]);

    const excludeKeys = useMemo(
      () => selectedItems?.map(item => keyBy?.(item) ?? item.key),
      [keyBy, selectedItems]
    );

    return (
      <DualListBox.Container {...props} mainWidth={mainBoxHeight}>
        <ListBoxDisplayContext
          prefix="available"
          checkedData={mainCheckedData}
          itemTypeDisplayName={itemTypeDisplayName}
          renderItem={renderMainItem}
          footer={mainListFooter}>
          <PersistentMainListBox
            keyBy={keyBy}
            excludeKeys={excludeKeys}
            searchMethod={searchMethod}
            searchParams={searchParams}
          />
        </ListBoxDisplayContext>

        <ButtonsContainer>
          <ListWidthHandle vertical onMouseDown={onMouseDown} />
          <CircleButton
            disabled={!mainCheckedData.hasChecked}
            variant={Variant.PRIMARY}
            size={Size.XLARGE}
            onClick={moveLeftCheckedItems}>
            <SvgIcon name="Chevron" />
          </CircleButton>

          <CircleButton
            disabled={!secondaryCheckedData.hasChecked}
            variant={Variant.PRIMARY}
            size={Size.XLARGE}
            onClick={moveRightCheckedItems}>
            <SvgIcon name="Chevron" />
          </CircleButton>
        </ButtonsContainer>
        <ListBoxDisplayContext
          prefix="selected"
          checkedData={secondaryCheckedData}
          itemTypeDisplayName={itemTypeDisplayName}
          renderItem={renderSecondaryItem ?? renderMainItem}
          footer={secondaryListFooter}>
          <SecondaryListBox items={selectedItems} filterBy={filterBy} />
        </ListBoxDisplayContext>
      </DualListBox.Container>
    );
  }
);

export const DualListBox = assignStyledNodes(_DualListBox, {
  Container: styled.div<{ mainWidth: number }>`
    display: grid;
    grid-template-areas: 'main actions secondary';
    grid-template-columns: calc(${props => Math.min(Math.max(props.mainWidth, 30), 70)}% - 8.5rem) 9rem 1fr;

    flex: 1;
    height: 117rem;
    gap: 4rem;
    justify-content: stretch;
  `,
});

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-area: actions;

  ${CircleButton}:last-of-type {
    margin-top: 3rem;
    transform: rotate(180deg);
  }
`;

const ListWidthHandle = styled(DragHandle)`
  height: 30.5rem;
  margin-bottom: 29rem;
`;
