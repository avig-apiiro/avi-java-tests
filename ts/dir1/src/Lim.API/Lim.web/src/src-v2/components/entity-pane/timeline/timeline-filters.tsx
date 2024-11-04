import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import {
  TimelineEventType,
  TimelineFilterOption,
} from '@src-v2/components/entity-pane/timeline/timeline';
import { QuickFilters } from '@src-v2/components/filters/quick-filters';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useQueryParams } from '@src-v2/hooks';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { addInterpunctSeparator, humanize } from '@src-v2/utils/string-utils';

export const TimelineFilters = styled(
  ({
    options,
    onFilterChanged,
    ...props
  }: {
    options: TimelineFilterOption[];
    onFilterChanged: (type?: keyof typeof TimelineEventType) => void;
  }) => {
    const trackAnalytics = useTrackAnalytics();

    const {
      updateQueryParams,
      queryParams: { filter },
    } = useQueryParams();

    const [selectedFilterOption, setSelectedFilterOption] = useState(filter);

    useEffect(() => {
      updateFilters(selectedFilterOption);
      return updateQueryParams({ filter: null });
    }, [selectedFilterOption]);

    const allOption: TimelineFilterOption = { type: undefined, count: _.sumBy(options, 'count') };

    const updateFilters = useCallback(
      type => {
        setSelectedFilterOption(type);
        updateQueryParams({ filter: type });
        onFilterChanged(type);

        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'filter risk pane timeline',
          [AnalyticsDataField.FilterType]: type,
        });
      },
      [setSelectedFilterOption, onFilterChanged, trackAnalytics]
    );
    return (
      <QuickFilters {...props}>
        {[allOption, ...options].map((option, index) => (
          <Button
            key={index}
            data-active={dataAttr(selectedFilterOption === option.type)}
            disabled={!option.count}
            variant={Variant.FILTER}
            onClick={() => updateFilters(option.type)}>
            {addInterpunctSeparator(
              option.type ? pluralFormat(option.count, humanize(option.type)) : 'All',
              String(option.count)
            )}
          </Button>
        ))}
      </QuickFilters>
    );
  }
)`
  flex-wrap: wrap;

  ${Button} {
    min-width: fit-content;
  }
`;
