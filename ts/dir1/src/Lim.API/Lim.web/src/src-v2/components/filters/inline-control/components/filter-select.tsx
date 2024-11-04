import { observer } from 'mobx-react';
import { JSX, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { FilterOperatorSwitch } from '@src-v2/components/filters/inline-control/components/filter-operator-switch';
import { FilterPlaceholder } from '@src-v2/components/filters/inline-control/components/filter-place-holder';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Paragraph } from '@src-v2/components/typography';
import { FilterOption, Operator } from '@src-v2/hooks/use-filters';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { SearchInput } from '@src/src-v2/components/forms/search-input';

export type OperatorData = {
  activeOperator: Operator;
  supportedOperators: Operator[];
  onChange: (operator: Operator) => void;
};

export interface FilterSelectProps {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  'data-test-marker'?: string;
  activeValues?: FilterOption[];
  operatorData?: OperatorData;
  renderItem?: (option: FilterOption) => JSX.Element;
  popover?: ReactNode;
  onClick?: () => void;
  onClear?: () => void;
  onSearch?: (event) => void;
  onHide?: () => void;
  onClose?: () => void;
}

const _FilterSelect = observer(
  ({
    label,
    defaultOpen = false,
    popover = FilterSelect.Popover,
    activeValues,
    operatorData,
    onSearch,
    onClick,
    onClose,
    onClear,
    onHide,
    'data-test-marker': dataTestMarker = 'filter-select',
    children,
    renderItem = option => <>{option?.title}</>,
  }: FilterSelectProps) => {
    const valuesCount = activeValues?.length ?? 0;
    const handleClick = useCallback(() => {
      onClick?.();
    }, [onClick]);

    return (
      <Tooltip
        delay={[500, 0]}
        disabled={valuesCount === 0}
        content={activeValues?.map(option => (
          <Paragraph key={option?.value}>{option?.title}</Paragraph>
        ))}>
        <SelectMenu
          data-test-marker={dataTestMarker}
          appendTo="parent"
          maxHeight="120rem"
          variant={Variant.FILTER}
          showOnCreate={defaultOpen}
          active={valuesCount > 0}
          popover={popover}
          onClick={handleClick}
          onClose={onClose}
          onHide={onHide}
          placeholder={
            <FilterPlaceholder
              renderItem={renderItem}
              activeValues={activeValues}
              label={label}
              valuesCount={valuesCount}
            />
          }>
          {(onSearch || operatorData) && (
            <Popover.Head as="li" data-multiline={dataAttr(Boolean(onSearch && operatorData))}>
              {onSearch && (
                <SearchInput onChange={onSearch} variant={Variant.SECONDARY} autoFocus />
              )}
              {operatorData && <FilterOperatorSwitch {...operatorData} />}
            </Popover.Head>
          )}
          {children}
          {onClear && <SelectMenu.Footer>Clear Selection</SelectMenu.Footer>}
        </SelectMenu>
      </Tooltip>
    );
  }
);

export const FilterSelect = assignStyledNodes(_FilterSelect, {
  Popover: styled(SelectMenu.Popover)`
    ${Popover.Content} ${SearchInput} {
      width: 100%;
    }

    ${Popover.Head} {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 3rem 0 1rem;
      gap: 1rem;

      &[data-multiline] {
        padding-bottom: 1rem;
      }
    }
  `,
});
