import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CalendarDatePickerFilter,
  DATE_CONSTANTS,
} from '@src-v2/components/filters/inline-control/components/calendar-date-picker-filter-control';
import { FilterSelectorsFactoryProps } from '@src-v2/components/filters/inline-control/containers/filter-controls-factory';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Filter } from '@src-v2/hooks/use-filters';
import { formatDateRange } from '@src-v2/utils/datetime-utils';

export interface DateRangeOptionFilter extends Filter {
  preset?: string;
  presetsType: 'past' | 'future';
}

interface FilterDateRangeOptionsProps extends Omit<FilterSelectorsFactoryProps, 'filter'> {
  filter: DateRangeOptionFilter;
  label?: string;
  presetsType?: 'past' | 'future';
}

export const FilterDateRangeOptions = observer(
  ({
    filter,
    activeValues,
    onChange,
    onClose,
    label = filter.title,
    presetsType: filterPresetType,
  }: FilterDateRangeOptionsProps) => {
    const [currentFilter, setCurrentFilter] = useState(filter);

    const dates = useMemo(
      () => activeValues[filter.key]?.values?.map(value => new Date(value)),
      [activeValues, filter]
    );

    useEffect(() => {
      const selectedPresetType =
        new Date(activeValues[currentFilter.key]?.[0]) > new Date() ? 'future' : 'past';
      setCurrentFilter(prev => ({ ...prev, presetsType: filterPresetType ?? selectedPresetType }));

      if (!activeValues[currentFilter.key]) {
        setCurrentFilter(prev => ({ ...prev, preset: null }));
      } else if (!currentFilter.preset) {
        setCurrentFilter(prev => ({ ...prev, preset: DATE_CONSTANTS.CUSTOM }));
      }
    }, [filter.key, filter, activeValues]);

    const dateLabel = useMemo(() => {
      if (!currentFilter.preset || currentFilter.preset === DATE_CONSTANTS.ALL_DATES) {
        return label;
      }
      switch (currentFilter.preset) {
        case DATE_CONSTANTS.CUSTOM:
          return (
            <>
              {label}:{' '}
              <ActiveName>
                {dates?.length === 2 ? formatDateRange(dates[0], dates[1]) : 'Custom'}
              </ActiveName>
            </>
          );
        default:
          return (
            <>
              {label}:{' '}
              <ActiveName>
                {currentFilter.presetsType === 'past' ? 'Last' : 'Next'} {currentFilter.preset} days
              </ActiveName>
            </>
          );
      }
    }, [dates, currentFilter, currentFilter.preset]);

    const handleClose = useCallback(() => {
      onClose?.();
      onChange({ key: currentFilter.key, value: null });
    }, [onClose, onChange, currentFilter]);

    const handleDateValueChange = useCallback(
      ({ value, preset }) => {
        setCurrentFilter(prev => ({ ...prev, preset }));
        onChange?.({ key: currentFilter.key, value });
      },
      [onChange, currentFilter]
    );

    return (
      <SelectMenu
        variant={Variant.FILTER}
        showOnCreate={filter.defaultOpen}
        active={Boolean(activeValues[currentFilter.key])}
        popover={DatePopover}
        maxHeight="100%"
        onClose={onClose ? handleClose : null}
        placeholder={dateLabel}>
        <CalendarDatePickerFilter
          presetsType={currentFilter.presetsType}
          dates={dates}
          filter={currentFilter}
          onChange={handleDateValueChange}
        />
      </SelectMenu>
    );
  }
);

const ActiveName = styled.span`
  font-weight: 600;
`;

const DatePopover = styled(SelectMenu.Popover)`
  ${Popover.Content} {
    height: fit-content;
    max-width: 150rem;
  }
`;
