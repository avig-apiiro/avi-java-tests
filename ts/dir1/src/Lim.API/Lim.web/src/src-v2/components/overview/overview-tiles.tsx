import React, { ReactNode, forwardRef, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { Card, CardTiles } from '@src-v2/components/cards';
import { Chart } from '@src-v2/components/charts';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { useOverviewTilesOrderContext } from '@src-v2/components/overview/overview-tiles-order-context';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading, Paragraph, UnorderedList } from '@src-v2/components/typography';
import { useDrag, useDrop } from '@src-v2/hooks/drag-and-drop';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const OverviewTile = styled(
  ({
    title,
    badge,
    timeFilterInsensitive = false,
    children,
    tileContainer: TileContainer = DefaultTileContainer,
    infoTooltipContent,
    interactiveTooltip = false,
    ...props
  }: StyledProps<{
    // Do not change type or contents of title
    // TODO change dropId to use key prop instead of title https://apiiro.atlassian.net/browse/LIM-18724.
    title: string;
    timeFilterInsensitive?: boolean;
    infoTooltipContent?: ReactNode;
    interactiveTooltip?: boolean;
    tileContainer?: React.FC<{ children: React.ReactNode }>;
    badge?: { label: string; color: BadgeColors; iconName: string };
  }>) => {
    const tileKey = title;
    const shouldDisplayTooltip = Boolean(infoTooltipContent || timeFilterInsensitive);
    const overviewRef = useRef<HTMLElement>();
    const { register, getItemLocation, onHover, onDrop } = useOverviewTilesOrderContext();
    const [dragRef, dragState, previewRef] = useDrag({
      item: { key: tileKey },
      canDrag: Boolean(tileKey),
      type: 'overview-tile',
    });

    const [dropRef] = useDrop({
      type: 'overview-tile',
      hover: item => onHover(item.key, tileKey),
      onDrop: () => onDrop(),
      canDrop: item => Boolean(item?.key) && Boolean(tileKey),
    });

    useLayoutEffect(() => {
      const overviewNode = overviewRef?.current;
      if (!overviewNode) {
        return;
      }

      const overviewContainer = overviewNode.parentNode;
      register(tileKey, Array.from(overviewContainer.children).indexOf(overviewNode));
    }, []);

    dropRef(previewRef(overviewRef));

    return (
      <AnalyticsLayer analyticsData={{ [AnalyticsDataField.TileName]: title }}>
        <Card
          {...props}
          ref={overviewRef}
          data-dragged={dataAttr(dragState?.draggedItem?.key === tileKey)}
          style={{ order: getItemLocation(tileKey) }}>
          <HeadingContainer>
            <DragHandle ref={dragRef} />
            <Heading>{title}</Heading>
            {shouldDisplayTooltip && (
              <InfoTooltip
                interactive={interactiveTooltip}
                content={
                  <>
                    {infoTooltipContent}
                    {timeFilterInsensitive && <Paragraph>Not affected by time filter</Paragraph>}
                  </>
                }
              />
            )}
            {!shouldDisplayTooltip && Boolean(badge) && (
              <Badge color={badge.color}>
                {badge.iconName ? <SvgIcon name={badge.iconName} /> : '-'}
                &nbsp;
                {badge.label}
              </Badge>
            )}
          </HeadingContainer>
          <TileContainer>
            <AsyncBoundary>{children}</AsyncBoundary>
          </TileContainer>
        </Card>
      </AnalyticsLayer>
    );
  }
)<{ size?: number }>`
  grid-column: span ${props => props.size ?? 1};
  display: flex;
  min-width: ${props => `calc((${props.size ?? 1} * var(--card-min-width)) - 6rem)`};
  height: 95.5rem;
  flex-direction: column;
  padding-bottom: 4rem;

  &[data-dragged] {
    opacity: 0.4;
    cursor: grabbing;
  }
`;

export const DefaultTileContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;

  > ${Chart} {
    flex-grow: 1;
    max-height: 66rem;
  }

  > ${UnorderedList} {
    padding: 0;
  }
`;

const HeadingContainer = styled.div`
  display: flex;
  gap: 1rem;

  > ${Heading} {
    font-size: var(--font-size-m);
    font-weight: 600;
    margin-bottom: 5rem;
  }

  > ${BaseIcon}[data-name="Info"] {
    margin-left: auto;
  }

  > ${Badge} {
    margin-left: auto;
  }
`;

export const DragHandle = styled(
  forwardRef<HTMLImageElement, StyledProps>((props, ref) => (
    <div ref={ref}>
      <SvgIcon {...props} ref={ref} name="Drag" size={Size.XSMALL} />
    </div>
  ))
)`
  margin: 0.5rem 0;
  cursor: grab;
  color: var(--color-blue-gray-50);

  &:hover {
    color: var(--color-blue-gray-60);
  }

  &:active {
    cursor: grabbing;
    color: var(--color-blue-gray-60);
  }
`;

export const OverviewTilesGrid = styled(CardTiles)`
  --card-tiles-min-width: calc(95.5rem - 1.5rem);

  width: 100%;
  gap: 6rem;

  @media (min-width: 3840px) {
    --repeat-tiles-by: 6;
  }
`;
