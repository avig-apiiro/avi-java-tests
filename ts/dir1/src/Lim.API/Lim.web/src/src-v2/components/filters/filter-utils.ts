import _ from 'lodash';
import { DATE_CONSTANTS } from '@src-v2/components/filters/inline-control/components/calendar-date-picker-filter-control';
import { RemoteOptionsGroup } from '@src-v2/components/filters/types';
import { ActiveFiltersData, Filter } from '@src-v2/hooks/use-filters';

export const formatRemoteFilterOptions = (filter): RemoteOptionsGroup[] =>
  filter.map(option => ({
    key: option.key,
    title: option.label,
    type: 'remote',
    options: option.results.map(result => ({
      key: result.key,
      title: result.label,
      value: result.label,
      provider: result.provider,
    })),
  }));

export const formatFilterOption = option => ({
  key: option.key,
  title: option.label,
  value: option.label,
  provider: option.provider,
});

export function getDefaultFilterValueData(filterOptions: Filter[] = []): ActiveFiltersData {
  return filterOptions
    .filter(option => Boolean(option.defaultValue ?? option.defaultValues?.length))
    .map(initFilterOption)
    .reduce(
      (result, filter) => ({ ...result, [filter.key]: generateFilterDefaultValue(filter) }),
      {}
    ) as ActiveFiltersData;
}

function initFilterOption(filterOption: Filter) {
  switch (filterOption.type) {
    case 'dateRange':
      if (filterOption.defaultValue) {
        // @ts-expect-error
        filterOption.preset = _.isArray(filterOption.defaultValue)
          ? DATE_CONSTANTS.CUSTOM
          : filterOption.defaultValue;
      }
      break;
    // no default
  }

  return filterOption;
}

function generateFilterDefaultValue(filterOption: Filter) {
  switch (filterOption.type) {
    case 'dateRange':
      return generateDateFilterDefaultValue(filterOption);
    case 'checkbox':
      return filterOption.defaultValue ? [filterOption.defaultValue] : filterOption.defaultValues;
    default:
      throw new Error(`Cannot generate default value for filter type ${filterOption.type}`);
  }

  function generateDateFilterDefaultValue(filterOption: Filter) {
    if (filterOption.defaultValues?.length) {
      if (filterOption.defaultValues.length !== 2) {
        console.error(
          `Datetime filter's default values must contain 2 items, but received: ${filterOption.defaultValues.length}`
        );
        return;
      }

      return filterOption.defaultValues;
    }

    const preset = parseInt(filterOption.defaultValue);

    if (!isNaN(preset)) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - preset);

      return [start.toISOString(), end.toISOString()];
    }
  }
}
