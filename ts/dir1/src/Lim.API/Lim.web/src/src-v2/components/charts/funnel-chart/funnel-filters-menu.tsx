import _ from 'lodash';
import { useRef } from 'react';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { FunnelFilterLabel } from '@src-v2/components/charts/funnel-chart/funnel-filter-label';
import { useFunnelFiltersData } from '@src-v2/components/charts/funnel-chart/funnel-filters-data-context';
import { Divider as BaseDivider } from '@src-v2/components/divider';
import { Checkbox } from '@src-v2/components/forms';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Markdown } from '@src-v2/components/markdown';
import { DragHandle } from '@src-v2/components/overview/overview-tiles';
import { SelectMenu } from '@src-v2/components/select-menu';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Light, ListItem } from '@src-v2/components/typography';
import { useDrag, useDrop } from '@src-v2/hooks/drag-and-drop';
import { FunnelFilterDefinition } from '@src-v2/services';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

const MAX_ACTIVE_FILTERS_COUNT = 8;

export function FunnelFiltersMenu({ defaultItemLabel }: { defaultItemLabel: string }) {
  const { visibleFunnelFilters, hiddenFunnelFilters, toggleItemVisibility, isDirty, resetOrder } =
    useFunnelFiltersData();

  const addFiltersDisabled = visibleFunnelFilters.length >= MAX_ACTIVE_FILTERS_COUNT;

  return (
    <SelectMenu
      appendTo="parent"
      variant={Variant.FILTER}
      placeholder="Customize segments"
      popover={ContentPopover}
      onClick={stopPropagation}
      onItemClick={stopPropagation}>
      <ListItem>
        <Light>Drag to order</Light>
        <Tooltip
          content={isDirty ? 'Reset to default' : "You're already viewing the default order"}>
          <CircleButton
            variant={Variant.TERTIARY}
            disabled={!isDirty}
            size={Size.SMALL}
            onClick={resetOrder}>
            <SvgIcon name="Reset" />
          </CircleButton>
        </Tooltip>
      </ListItem>
      <ListItem>
        <Label data-disabled>
          <Checkbox checked disabled onChange={_.noop} /> {defaultItemLabel}
        </Label>
      </ListItem>
      {visibleFunnelFilters.map(filter => (
        <DraggableFunnelFilterItem key={filter.key} filter={filter} />
      ))}
      {Boolean(hiddenFunnelFilters.length) && (
        <>
          <Divider />
          <ListItem>
            <Light>Select to add</Light>
          </ListItem>
          {hiddenFunnelFilters.map(filter => (
            <HiddenFunnelFilterItem
              key={filter.key}
              filter={filter}
              disabled={addFiltersDisabled}
              onChange={toggleItemVisibility}
            />
          ))}
        </>
      )}
    </SelectMenu>
  );
}

const ContentPopover = styled(SelectMenu.Popover)`
  ${Popover.Content} {
    min-width: 81rem;
    cursor: default;
    font-size: var(--font-size-s);
    padding: 3rem 2rem;

    ${ListItem} {
      display: flex;
      margin: 0;
      padding: 0 1rem;
      align-items: center;

      ${Light} {
        flex-grow: 1;
        line-height: 8rem;
      }
    }
  }
`;

const Divider = styled(BaseDivider)`
  margin: 1rem 0;
`;

function DraggableFunnelFilterItem({ filter }: { filter: FunnelFilterDefinition }) {
  const containerRef = useRef<HTMLLIElement>();
  const { toggleItemVisibility, changeItemLocation } = useFunnelFiltersData();

  const [dragRef, , previewRef] = useDrag({
    item: filter,
    type: 'funnel-filter-item',
    canDrag: true,
  });

  const [dropRef, dropState] = useDrop({
    type: 'funnel-filter-item',
    onDrop: (dropItem: FunnelFilterDefinition) => changeItemLocation([dropItem.key, filter.key]),
    canDrop: (item: FunnelFilterDefinition) => filter.key !== item.key,
  });

  dropRef(previewRef(containerRef));

  return (
    <DraggableListItem
      ref={containerRef}
      data-dropzone={dataAttr(dropState.isOver && dropState.canDrop)}>
      <Label>
        <Checkbox checked onChange={() => toggleItemVisibility(filter.key)} />
        <DragHandle ref={dragRef} />
        <FunnelFilterLabel filter={filter} showDescription />
      </Label>
    </DraggableListItem>
  );
}

const DraggableListItem = styled(ListItem)`
  border-radius: 1rem;
  padding: 0;

  &[data-dropzone] {
    background-color: var(--color-blue-gray-20);
  }
`;

const Label = styled.label`
  display: flex;
  height: 8rem;
  padding: 0 1rem;
  flex-grow: 1;
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  border-radius: 1rem;

  &[data-disabled] {
    color: var(--color-blue-gray-40);
  }

  &:not([data-disabled]) {
    cursor: pointer;

    &:hover {
      background-color: var(--color-blue-gray-15);
    }
  }

  ${Checkbox} {
    margin-right: 1rem;

    :checked + & {
      &:before {
        border: none;
      }

      ${BaseIcon} {
        stroke: var(--color-white) !important;
      }
    }
  }

  ${FunnelFilterLabel} {
    flex-grow: 1;
  }
}`;

function HiddenFunnelFilterItem({
  filter,
  disabled,
  onChange,
}: {
  filter: FunnelFilterDefinition;
  disabled?: boolean;
  onChange: (filterKey: string) => void;
}) {
  const isItemDisabled = disabled || Boolean(filter.disabledReasonMarkdown);

  return (
    <ListItem>
      <Label data-disabled={dataAttr(isItemDisabled)}>
        <Checkbox disabled={isItemDisabled} checked={false} onChange={() => onChange(filter.key)} />
        <Tooltip
          appendTo={document.body}
          interactive
          content={
            filter.disabledReasonMarkdown ? (
              <Markdown>{filter.disabledReasonMarkdown}</Markdown>
            ) : (
              <>
                Max. number of displayed bars is {MAX_ACTIVE_FILTERS_COUNT}.
                <br />
                Please remove a selected bar first
              </>
            )
          }
          disabled={!isItemDisabled}>
          <FunnelFilterLabel
            isDisabled={Boolean(filter.disabledReasonMarkdown)}
            showDescription
            filter={filter}
          />
        </Tooltip>
      </Label>
    </ListItem>
  );
}

export function FilterInfoTooltip({ filter }: { filter: FunnelFilterDefinition }) {
  return (
    <InfoTooltip
      interactive
      appendTo={document.body}
      size={Size.XXXSMALL}
      content={<Markdown>{filter.description}</Markdown>}
    />
  );
}
