import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { FunnelChart, Segment } from '@src-v2/components/charts/funnel-chart/funnel-chart';
import { FunnelFilterLabel } from '@src-v2/components/charts/funnel-chart/funnel-filter-label';
import { useFunnelFiltersData } from '@src-v2/components/charts/funnel-chart/funnel-filters-data-context';
import { Circle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';
import { useInject, useLoading } from '@src-v2/hooks';
import { ActiveFiltersData } from '@src-v2/hooks/use-filters';
import {
  FunnelDynamicFilterDefinition,
  FunnelFilterDefinition,
  SearchParams,
  transformLegacyFilters,
} from '@src-v2/services';
import { isTypeOf } from '@src-v2/utils/ts-utils';

type DataFetcher = ({
  controlledFilters,
  globalFilters,
}: {
  controlledFilters: FunnelFilterDefinition[];
  globalFilters: Partial<SearchParams>;
}) => Promise<Record<string, number>[]>;

export type DataFunnelProps = {
  defaultItemLabel: string;
  dataFetcher: DataFetcher;
  activeFilters: ActiveFiltersData;
  colorsMapper: (key: string, index: number) => string;
  readOnly?: boolean;
  onLegendClick?: (legend: string) => void;
  onSegmentClick?: (
    index: number,
    filter: FunnelFilterDefinition,
    visibleFilters: FunnelFilterDefinition[]
  ) => void;
  onPopoverClick?: (index: number, filter: FunnelFilterDefinition, legend: string) => void;
  onSegmentRemoved?: (
    filter: FunnelFilterDefinition,
    visibleFilters: FunnelFilterDefinition[]
  ) => void;
};

export function DataFunnel({
  defaultItemLabel,
  readOnly,
  dataFetcher,
  activeFilters,
  colorsMapper,
  onLegendClick,
  onSegmentClick,
  onPopoverClick,
  onSegmentRemoved,
}: DataFunnelProps) {
  const { asyncCache } = useInject();
  const trackAnalytics = useTrackAnalytics();
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const [funnelData, setFunnelData] = useState<Record<string, number>[]>();

  useEffect(
    () => _.isEmpty(activeFilters) && selectedSegmentIndex !== 0 && setSelectedSegmentIndex(0),
    [activeFilters]
  );

  const [searchData, loading] = useLoading(dataFetcher, [dataFetcher]);
  const { visibleFunnelFilters, toggleItemVisibility, getItemLocation, onHover, onDrop } =
    useFunnelFiltersData();

  useEffect(() => {
    void fetch();

    async function fetch() {
      const globalFilters = transformLegacyFilters(
        _.omit(activeFilters, [
          ...visibleFunnelFilters.map(f => f.tableFilterGroup ?? f.tableFilter),
          'DashboardDateRange',
        ])
      );

      const controlledFilters = visibleFunnelFilters.map(filter =>
        isTypeOf<FunnelDynamicFilterDefinition>(filter, 'isDynamic')
          ? {
              ...filter,
              values: activeFilters[filter.tableFilter]?.values ?? filter.values,
            }
          : filter
      );

      setFunnelData(
        await asyncCache.suspend(searchData, {
          globalFilters,
          controlledFilters,
        })
      );
    }
  }, [activeFilters, searchData, visibleFunnelFilters]);

  const colors = useMemo(
    () => (funnelData ? Object.keys(funnelData[0]).map(colorsMapper) : []),
    [funnelData]
  );

  const segments = useMemo<Segment[]>(() => {
    return funnelData?.length
      ? [
          {
            key: '__defaultFunnelFilterKey',
            draggable: false,
            data: funnelData[0],
            label: defaultItemLabel,
            type: null,
          },
          ...visibleFunnelFilters.map((filter, index) => ({
            key: filter.key,
            draggable: !readOnly,
            data: funnelData[index + 1],
            label: <FunnelFilterLabel showDescription filter={filter} />,
            popoverLabel: <FunnelFilterLabel filter={filter} />,
            type: filter.type,
          })),
        ]
      : [];
  }, [funnelData, defaultItemLabel]);

  const handleClick = useCallback(
    (segmentIndex: number, segment: Segment) => {
      setSelectedSegmentIndex(segmentIndex);
      const selectedFilter = visibleFunnelFilters.find(filter => filter.key === segment.key);

      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.FunnelBarKey]: selectedFilter?.key,
      });

      onSegmentClick?.(segmentIndex, selectedFilter, visibleFunnelFilters);
    },
    [onSegmentClick, visibleFunnelFilters, trackAnalytics]
  );

  const handlePopoverClick = useCallback(
    (segmentIndex: number, legend: string) => {
      const selectedFilter = visibleFunnelFilters[segmentIndex - 1];
      onPopoverClick?.(segmentIndex, selectedFilter, legend);
    },
    [visibleFunnelFilters]
  );

  const handleRemove = useCallback(
    (segmentIndex: number) => {
      setSelectedSegmentIndex(0);
      const filterToRemove = visibleFunnelFilters[segmentIndex - 1];
      toggleItemVisibility(filterToRemove.key);
      onSegmentRemoved?.(filterToRemove, visibleFunnelFilters);
    },
    [toggleItemVisibility, visibleFunnelFilters]
  );

  return (
    <>
      <FunnelChart
        selectedSegmentIndex={selectedSegmentIndex}
        getSegmentLocation={getItemLocation}
        segments={segments}
        colors={colors}
        isLoading={loading}
        readOnly={readOnly}
        onSegmentClick={handleClick}
        onPopoverClick={onPopoverClick ? handlePopoverClick : undefined}
        onSegmentDragged={!readOnly ? onHover : null}
        onSegmentDropped={!readOnly ? onDrop : null}
        onSegmentRemoved={!readOnly ? handleRemove : null}
      />
      {Boolean(funnelData?.length) && (
        <FunnelLegend
          funnelDataKeys={Object.keys(funnelData[0])}
          colors={colors}
          onLegendClick={onLegendClick}
        />
      )}
    </>
  );
}

const FunnelLegend = styled(
  ({
    funnelDataKeys,
    colors,
    onLegendClick,
    ...props
  }: {
    funnelDataKeys: string[];
    colors: string[];
    onLegendClick?: (legend: string) => void;
  }) => {
    return (
      <div {...props}>
        {funnelDataKeys.map((dataKey, index) => (
          <LegendItem key={dataKey} onClick={onLegendClick ? () => onLegendClick(dataKey) : null}>
            <Circle style={{ background: colors[index] }} size={Size.XXXSMALL} /> {dataKey}
          </LegendItem>
        ))}
      </div>
    );
  }
)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;

const LegendItem = styled.div`
  font-size: var(--font-size-xs);
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'unset')};

  ${Circle} {
    border: none;
  }
`;
