import { useCallback, useEffect, useMemo } from 'react';
import { IconButton } from '@src-v2/components/buttons';
import { useTrackFilterAnalytics } from '@src-v2/components/filters/hooks/use-track-filter-analytics';
import { FilterSelectorsFactoryProps } from '@src-v2/components/filters/inline-control/containers/filter-controls-factory';
import { SelectMenu } from '@src-v2/components/select-menu';
import { EllipsisText, Strong } from '@src-v2/components/typography';

interface SingleValueFilterProps
  extends Pick<FilterSelectorsFactoryProps, 'data-test-marker' | 'filter' | 'activeValues'> {
  formatValue?: (value: string) => string;
  onClear?: (key: string) => void;
}

export const SingleValueFilter = ({
  filter,
  activeValues,
  onClear,
  formatValue = value => String(value),
  'data-test-marker': dataTestMarker = 'filter',
}: SingleValueFilterProps) => {
  const hasActiveValues = useMemo(
    () => activeValues && activeValues[filter.key]?.values?.length > 0,
    [activeValues]
  );

  const clearFilters = useCallback(() => onClear?.(filter.key), [onClear, filter]);
  const trackAnalyticsData = useTrackFilterAnalytics();

  useEffect(() => {
    if (hasActiveValues && filter?.title) {
      trackAnalyticsData(filter.title);
    }
  }, [hasActiveValues]);

  return (
    hasActiveValues && (
      <div data-test-marker={dataTestMarker}>
        <SelectMenu.Button data-test-marker="filter" filterKey={filter.key} data-active>
          {filter.title}:&nbsp;
          <EllipsisText>
            <Strong>{formatValue(activeValues[filter.key][0])}</Strong>
          </EllipsisText>
          <IconButton name="Close" onClick={clearFilters} />
        </SelectMenu.Button>
      </div>
    )
  );
};
