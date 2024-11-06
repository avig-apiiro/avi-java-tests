import _ from 'lodash';
import { MouseEvent, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { followCursor } from 'tippy.js';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Segment } from '@src-v2/components/charts/funnel-chart/funnel-chart';
import { Circle } from '@src-v2/components/circles';
import { PlainTooltipProps, Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading4, ListItem, Small, UnorderedList } from '@src-v2/components/typography';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { entries } from '@src-v2/utils/ts-utils';

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5rem;
  margin-bottom: 3rem;
`;

export const SegmentTooltip = styled(({ interactive, ...props }: PlainTooltipProps) => (
  <Tooltip
    {...props}
    noArrow
    interactive={interactive}
    followCursor={!interactive}
    placement={!interactive ? 'bottom-start' : undefined}
    offset={!interactive ? [-50, 25] : undefined}
    plugins={[followCursor]}
  />
))`
  min-width: 40rem;
  background-color: var(--color-white);
  color: var(--default-text-color);
  box-shadow: var(--elevation-2);

  ${UnorderedList} {
    padding: 0;

    ${ListItem} {
      display: flex;
      align-items: center;

      &[data-clickable]:hover {
        cursor: pointer;

        ${Small} {
          text-decoration: underline;
        }
      }

      ${Circle} {
        margin-right: 2rem;
      }

      ${Small} {
        font-size: var(--font-size-s);
        font-weight: 400;

        &:not(:last-child) {
          flex-grow: 1;
        }

        &:last-child {
          margin-left: 5rem;
        }
      }
    }
  }
`;

export function SegmentPopoverContent({
  segment,
  colors,
  onPopoverClick,
  sIndex,
}: {
  segment: Segment;
  colors: string[];
  sIndex?: number;
  onPopoverClick: (segmentIndex: number, value: string) => void;
}) {
  const segmentMax = _.sum(Object.values(segment.data));
  const segmentDataItems = useMemo(
    () =>
      entries(segment.data).map(([key, value], index) => ({
        key,
        value,
        color: colors[index],
      })),
    [segment.data]
  );
  const trackAnalytics = useTrackAnalytics();

  const handleClick = useCallback(
    (riskLevel: string, event: MouseEvent<HTMLLIElement>) => {
      event.stopPropagation();

      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Funnel popover link click',
      });

      onPopoverClick?.(sIndex, riskLevel);
    },
    [trackAnalytics, onPopoverClick]
  );

  return (
    <>
      <TitleContainer>
        <Heading4>{segment.popoverLabel ?? segment.label}</Heading4>
        <Heading4>{segmentMax.toLocaleString()}</Heading4>
      </TitleContainer>
      <UnorderedList>
        {segmentDataItems.map(({ key, value, color }) => (
          <ListItem
            key={key}
            data-clickable={dataAttr(Boolean(onPopoverClick))}
            onClick={onPopoverClick ? event => handleClick(key, event) : undefined}>
            <Circle size={Size.XXXSMALL} style={{ background: color }} />
            <Small>{key}</Small>
            <Small>{value.toLocaleString()}</Small>
          </ListItem>
        ))}
      </UnorderedList>
    </>
  );
}
