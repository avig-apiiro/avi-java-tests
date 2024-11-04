import _ from 'lodash';
import { MouseEvent, forwardRef, useCallback } from 'react';
import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { Segment } from '@src-v2/components/charts/funnel-chart/funnel-chart';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { DragHandle } from '@src-v2/components/overview/overview-tiles';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading3, Small } from '@src-v2/components/typography';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

export const SegmentHeader = styled(
  forwardRef<
    HTMLImageElement,
    {
      draggable: boolean;
      segmentIndex: number;
      segment: Segment;
      totalMax: number;
      onSegmentRemoved?: (segmentIndex: number) => void;
    }
  >(({ segmentIndex, segment, totalMax, onSegmentRemoved, draggable, ...props }, ref) => {
    const segmentMax = _.sum(Object.values(segment.data));
    const percentageOutOfTotal = totalMax > 0 ? Math.round((100 * segmentMax) / totalMax) : 0;

    const handleRemove = useCallback(
      (event: MouseEvent<HTMLImageElement>) => {
        stopPropagation(event);
        onSegmentRemoved?.(segmentIndex);
      },
      [onSegmentRemoved]
    );

    return (
      <Heading3 {...props} data-empty={dataAttr(!segment.type)}>
        {segmentMax.toLocaleString()} <Small>({percentageOutOfTotal}%)</Small>
        <LabelContainer>{segment.label}</LabelContainer>
        {segment.type && <Badge size={Size.XSMALL}>{segment.type}</Badge>}
        {draggable && onSegmentRemoved && <SvgIcon name="Close" onClick={handleRemove} />}
        {draggable && <DragHandle ref={ref} />}
      </Heading3>
    );
  })
)`
  position: relative;
  font-weight: 500;

  &[data-empty] {
    margin-bottom: 5rem;
  }

  ${Small} {
    margin-bottom: 1rem;
    font-size: var(--font-size-s);
    font-weight: 200;
    line-height: 5rem;
  }

  ${BaseIcon}[data-name='Close'], ${DragHandle} {
    position: absolute;
    right: 0;
    top: 0;

    &:not(:last-child) {
      right: 4rem;
    }
  }

  ${BaseIcon}[data-name='Close'] {
    opacity: 0;
    color: var(--color-blue-gray-60);
    transition: opacity 200ms;
  }
`;

const LabelContainer = styled(Small)`
  display: flex;
`;
