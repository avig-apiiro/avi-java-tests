import { ReactNode, useRef } from 'react';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useControlledHorizontalScroll } from '@src-v2/hooks/use-controlled-scroll';
import { HideScrollBar } from '@src/style/common';

interface ControlledScrollProps {
  scrollGap?: number;
  scrollOffset?: number;
  controllerButtonPosition?: 'top' | 'center';
  children: ReactNode;
}

export const ControlledScroll = styled(
  ({
    children,
    scrollGap,
    scrollOffset,
    controllerButtonPosition = 'top',
    ...props
  }: ControlledScrollProps) => {
    const scrollRef = useRef<HTMLDivElement>();

    const { scrollLeft, scrollRight, showLeftScroll, showRightScroll } =
      useControlledHorizontalScroll(scrollRef, scrollGap, scrollOffset);

    return (
      <div {...props}>
        {showLeftScroll && (
          <ScrollIconContainer controllerButtonPosition={controllerButtonPosition} data-prev>
            <CircleButton variant={Variant.FLOATING} size={Size.SMALL} onClick={scrollLeft}>
              <SvgIcon name="Chevron" size={Size.XXSMALL} />
            </CircleButton>
          </ScrollIconContainer>
        )}

        <ContentContainer ref={scrollRef}> {children} </ContentContainer>
        {showRightScroll && (
          <ScrollIconContainer controllerButtonPosition={controllerButtonPosition} data-next>
            <CircleButton variant={Variant.FLOATING} size={Size.SMALL} onClick={scrollRight}>
              <SvgIcon name="Chevron" size={Size.XXSMALL} />
            </CircleButton>
          </ScrollIconContainer>
        )}
      </div>
    );
  }
)`
  position: relative;
  padding: 4rem 0 2rem 0;
  flex-shrink: 1;
`;

export const ScrollIconContainer = styled.div<{ controllerButtonPosition: 'top' | 'center' }>`
  position: absolute;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  top: ${props => (props.controllerButtonPosition === 'center' ? 'calc(50% - 4rem)' : 'unset')};
  z-index: 99;

  ${CircleButton} {
    background-color: white;
  }

  &[data-prev] {
    left: 0;

    ${BaseIcon} {
      transform: rotate(180deg);
    }
  }

  &[data-next] {
    right: 0;
  }
`;

const ContentContainer = styled.div`
  max-width: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;

  ${HideScrollBar}
`;
