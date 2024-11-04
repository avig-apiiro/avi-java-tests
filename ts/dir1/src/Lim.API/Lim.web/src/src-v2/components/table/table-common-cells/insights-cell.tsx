import { observer } from 'mobx-react';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Counter } from '@src-v2/components/counter';
import { Table } from '@src-v2/components/table/table';
import { InsightTag, Tag } from '@src-v2/components/tags';
import { Popover } from '@src-v2/components/tooltips/popover';
import { useFilters } from '@src-v2/hooks/use-filters';
import { Insight } from '@src-v2/types/risks/insight';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export interface InsightsCellProps {
  insights: Insight[];
  disableFilter?: boolean;
  filterKey?: 'RiskInsights' | 'Insights';
}

export const InsightsCell = ({
  insights,
  disableFilter,
  filterKey,
  ...props
}: InsightsCellProps) => {
  const [extraLength, setExtraLength] = useState(0);
  const containerRef = useRef<HTMLDivElement>();
  const containerDimensions = containerRef.current?.getBoundingClientRect();
  const containerY = (containerDimensions?.y ?? 0) + (containerDimensions?.height ?? 0);

  useEffect(() => {
    const childrenList = Array.from(containerRef.current?.children ?? []);
    const extra = childrenList.filter(element => {
      const dimensions = element?.getBoundingClientRect();
      return (dimensions.y ?? 0) + (dimensions?.height ?? 0) > containerY;
    });

    setExtraLength(extra.length);
  }, [containerRef.current, containerDimensions]);

  return (
    <Table.FlexCell {...props}>
      <InsightsWrapper ref={containerRef}>
        {insights?.map(insight => (
          <FilterableInsightTag
            key={insight.badge}
            filterKey={filterKey}
            insight={insight}
            disableFilter={disableFilter}
          />
        ))}
      </InsightsWrapper>
      {insights?.length > insights?.length - extraLength && (
        <InsightsTooltip
          content={
            <TooltipInsightsContent>
              {insights
                ?.slice(insights?.length - extraLength)
                .map(insight => <InsightTag insight={insight} key={insight.badge} />)}
            </TooltipInsightsContent>
          }>
          <Counter>+{extraLength}</Counter>
        </InsightsTooltip>
      )}
    </Table.FlexCell>
  );
};

const InsightsWrapper = styled.div`
  height: 11rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  overflow: hidden;
`;

const FilterableInsightTag = styled(
  observer(({ insight, disableFilter, filterKey, ...props }) => {
    const {
      updateFilters,
      activeFilters: { RiskInsights: { values: activeInsights = [] } = {} },
    } = useFilters();
    const isActiveFilter = activeInsights.includes(insight.badge);
    const allowFilter = !isActiveFilter && !disableFilter && filterKey;

    const addInsightFilter = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        stopPropagation(event);
        updateFilters({
          key: filterKey,
          value: [...activeInsights, insight.badge],
          checked: true,
        });
      },
      [updateFilters, insight, activeInsights]
    );

    return (
      <InsightTag
        {...props}
        insight={insight}
        onClick={allowFilter ? addInsightFilter : null}
        hint={allowFilter && 'Click tag to filter by it'}
      />
    );
  })
)`
  max-width: 54rem;
  height: 4.5rem;
  line-height: 4.5rem;
`;

const InsightsTooltip = styled(Popover)`
  background-color: var(--color-blue-gray-10);
  display: flex;
  width: auto;

  ${Popover.Content} {
    min-width: 0;
  }

  ${Popover.Arrow}:before {
    background-color: var(--color-blue-gray-10);
  }
}
`;

const TooltipInsightsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  background-color: var(--color-blue-gray-10);

  ${Tag} {
    width: fit-content;
  }
`;
