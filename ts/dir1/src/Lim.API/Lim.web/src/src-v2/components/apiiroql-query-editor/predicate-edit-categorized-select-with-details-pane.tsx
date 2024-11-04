import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { PredicateSelectMenu } from '@src-v2/components/apiiroql-query-editor/predicate-edit-inputs';
import { Dropdown } from '@src-v2/components/dropdown';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { defaultItemToString } from '@src-v2/hooks';
import { dataAttr } from '@src-v2/utils/dom-utils';

type PredicateCategorizedType = {
  categorizedItems: any;
  onItemSelected: (item: any) => void;
  value: any;
  dontShowValue?: boolean;
  readOnly?: boolean;
  minHeight?: string;
  highlighted?: boolean;
  placeholder?: string;
  itemToIcon?: (item: any) => string;
  itemToString?: (item: any) => string;
  itemMatchesSearch?: (item: any, searchString: string) => boolean;
  noResultsMessage?: string;
  itemToDescriptionPane: (item: any) => ReactNode;
};

export const PredicateCategorizedSelectWithDetailsPane = function ({
  categorizedItems,
  onItemSelected,
  value,
  dontShowValue = false,
  readOnly = false,
  minHeight = '0',
  highlighted = false,
  placeholder = null,
  itemToIcon = null,
  itemToString = defaultItemToString,
  itemMatchesSearch = (item, searchString) =>
    itemToString(item).toLowerCase().indexOf(searchString.toLowerCase()) >= 0,
  noResultsMessage = 'No items found',
  itemToDescriptionPane: itemToDetailsPane = null,
}: PredicateCategorizedType) {
  return (
    <PredicateSelectMenu
      variant={Variant.FILTER}
      maxHeight="100%"
      data-highlighted={highlighted}
      popover={WideSelectMenuPopover}
      readOnly={readOnly}
      placeholder={
        !dontShowValue && value ? (
          <HorizontalStack>
            {itemToIcon && itemToIcon(value)}
            {itemToString(value)}
          </HorizontalStack>
        ) : (
          placeholder || <>&nbsp;</>
        )
      }>
      <CategorizedSelectionMenu
        categorizedItems={categorizedItems}
        itemToString={itemToString}
        itemToIcon={itemToIcon}
        itemToDetailsPane={itemToDetailsPane}
        noResultsMessage={noResultsMessage}
        itemMatchesSearch={itemMatchesSearch}
        onItemSelected={onItemSelected}
        value={value}
        minHeight={minHeight}
      />
    </PredicateSelectMenu>
  );
};

export function CategorizedSelectionMenu({
  categorizedItems,
  itemToIcon = null,
  minHeight = '0',
  itemToDetailsPane = null,
  value,
  itemToString = defaultItemToString,
  itemMatchesSearch = (item, searchString) =>
    itemToString(item).toLowerCase().indexOf(searchString.toLowerCase()) >= 0,
  noResultsMessage = 'No items found',
  onItemSelected,
  className = null,
}) {
  const itemListRef = useRef<HTMLDivElement>();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showCategories = categorizedItems.length > 1;
  const showCategoryLabels = showCategories;

  const filteredCategorizedItems = useMemo(
    () =>
      categorizedItems
        .map(category => ({
          ...category,
          items: category.items.filter(item => itemMatchesSearch(item, searchTerm)),
        }))
        .filter(category => category.items.length),
    [searchTerm, categorizedItems]
  );

  useEffect(() => {
    if (searchTerm && filteredCategorizedItems.length) {
      if (filteredCategorizedItems.find(category => category.items.find(item => item === value))) {
        setHoveredItem(value);
      } else {
        setHoveredItem(filteredCategorizedItems[0].items[0]);
      }
    }
  }, [filteredCategorizedItems]);

  const [visibleCategoryLabel, setVisibleCategoryLabel] = useState(
    filteredCategorizedItems[0]?.label
  );

  const categoriesList = useMemo(
    () =>
      filteredCategorizedItems.map(category => (
        <Dropdown.Item
          data-dropdown="category"
          data-selected={dataAttr(visibleCategoryLabel === category.label)}
          key={category.label}
          onClick={event => handleCategoryClick(event, category.label)}>
          {category.label}
        </Dropdown.Item>
      )),
    [filteredCategorizedItems, visibleCategoryLabel]
  );

  const handleCategoryClick = useCallback((event, categoryLabel) => {
    event.preventDefault();
    if (itemListRef.current) {
      const categoryGroup = itemListRef.current.querySelector(
        `[data-category-label="${categoryLabel}"]`
      );
      itemListRef.current.scrollTo({
        // @ts-expect-error
        top: categoryGroup.offsetTop - itemListRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  }, []);

  const itemsList = useMemo(
    () =>
      filteredCategorizedItems.flatMap((category, categoryIndex) => {
        const categoryItems = category.items.map((item, itemIndex) => (
          <Dropdown.Item
            key={`${categoryIndex}-${itemIndex}`}
            data-selected={dataAttr(item === value)}
            onClick={() => onItemSelected(item)}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}>
            <HorizontalStack>
              {itemToIcon && itemToIcon(item)}
              {itemToString(item)}
            </HorizontalStack>
          </Dropdown.Item>
        ));

        return showCategoryLabels
          ? [
              <Dropdown.Group
                data-no-separator="true"
                data-category-label={category.label}
                key={String(categoryIndex)}
                title={category.label}>
                {categoryItems}
              </Dropdown.Group>,
            ]
          : categoryItems;
      }),
    [filteredCategorizedItems, onItemSelected]
  );

  const handleItemListScroll = useCallback(() => {
    if (itemListRef.current) {
      for (const categoryControl of itemListRef.current.querySelectorAll('[data-category-label]')) {
        if (
          // @ts-ignore
          categoryControl.offsetTop + categoryControl.offsetHeight >
            itemListRef.current.scrollTop + itemListRef.current.offsetTop &&
          // @ts-ignore
          categoryControl.offsetTop <
            itemListRef.current.scrollTop +
              itemListRef.current.offsetTop +
              itemListRef.current.clientHeight
        ) {
          setVisibleCategoryLabel(categoryControl.getAttribute('data-category-label'));
          break;
        }
      }
    }
  }, []);

  const handleSearchChange = useCallback(
    ({ target }) => {
      setSearchTerm(target?.value);
      setHoveredItem(null);
    },
    [setSearchTerm, setHoveredItem]
  );

  useEffect(() => {
    setVisibleCategoryLabel(filteredCategorizedItems[0]?.label);
    setSearchTerm('');
    setHoveredItem(value);
  }, []);

  return (
    <VerticalStack spacing="5rem" minHeight={minHeight} className={className}>
      <StyledSearchInput autoFocus placeholder="Search" onChange={handleSearchChange} />
      <SelectMenuPopoverSections>
        {showCategories && (
          <SelectMenuPopoverSectionsSection data-scrollable="true">
            {categoriesList}
          </SelectMenuPopoverSectionsSection>
        )}

        <SelectMenuPopoverSectionsSection
          ref={itemListRef}
          data-scrollable="true"
          onScroll={handleItemListScroll}>
          {itemsList}
          {showCategories && <SelectMenuPopoverSectionsSectionPadder />}
        </SelectMenuPopoverSectionsSection>

        {itemToDetailsPane && (
          <SelectMenuPopoverSectionsSection data-wide>
            {itemToDetailsPane(hoveredItem)}
          </SelectMenuPopoverSectionsSection>
        )}
      </SelectMenuPopoverSections>
      {!itemsList.length && noResultsMessage}
    </VerticalStack>
  );
}

const WideSelectMenuPopover = styled(SelectMenu.Popover)`
  max-width: 250rem;
  border-radius: 3rem;

  ${Popover.Content} {
    max-width: 250rem;
    width: 60vw;
    padding: 6rem;
    position: relative;
  }
`;

const StyledSearchInput = styled(SearchInput)`
  width: 100%;

  input {
    background: var(--color-blue-gray-10);
  }
`;

const SelectMenuPopoverSections = styled.div`
  display: flex;
  flex-direction: row;
  max-height: 64rem;
  flex-grow: 1;

  ${Dropdown.Item} {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 0;
    line-height: 6rem;
    padding: 1rem 2rem;
    margin-bottom: 1rem;
  }

  ${Dropdown.Title} {
    text-transform: uppercase;
    font-weight: 400;
    color: var(--color-blue-gray-50);
  }

  ${Dropdown.Group}:not(:first-child) {
    margin-top: 3rem;
  }
`;

const SelectMenuPopoverSectionsSection = styled.div`
  min-width: 52rem;
  white-space: pre-line;

  &:not(:last-of-type) {
    padding-right: 3rem;
    margin-right: 3rem;
    border-right: solid 1px;
    border-color: var(--color-blue-gray-20);
  }

  &[data-scrollable='true'] {
    overflow-y: auto;
  }
`;

const SelectMenuPopoverSectionsSectionPadder = styled.div`
  height: calc(100% - 10rem);
`;

export const DetailsPane = styled(({ titleIcon, title, children, ...props }) => {
  return (
    <div {...props}>
      {(title || children) && (
        <VerticalStack>
          <HorizontalStack>
            {titleIcon}
            <h1>{title}</h1>
          </HorizontalStack>
          {children}
        </VerticalStack>
      )}
    </div>
  );
})`
  height: 100%;
  max-width: 85rem;

  color: var(--color-blue-gray-70);
  font-size: 3.5rem;
  line-height: 5rem;

  overflow-x: scroll;

  h1 {
    font-size: 4rem;
    line-height: 6rem;
    font-weight: 500;
  }
`;

const HorizontalStack = styled.div`
  display: flex;
  text-align: left;
  align-items: center;
  gap: 10px;
`;

const VerticalStack = styled.div<{ spacing?: string; minHeight?: string }>`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${props => props.spacing ?? '3rem'};
  min-height: ${props => props.minHeight};
`;
