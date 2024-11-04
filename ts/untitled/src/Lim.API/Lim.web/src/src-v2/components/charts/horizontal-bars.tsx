import { CSSProperties } from 'react';
import styled from 'styled-components';
import { ButtonProps, PlainButton } from '@src-v2/components/buttons';
import { Clamp } from '@src-v2/components/clamp-text';
import { BaseIcon } from '@src-v2/components/icons';
import { abbreviate } from '@src-v2/utils/number-utils';

export const HorizontalBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const RepositoryBarHeader = styled.div`
  display: flex;
  line-height: 5rem;
  align-items: center;
  gap: 1rem;

  ${Clamp} {
    width: unset;
  }

  ${BaseIcon} {
    width: 4rem;
    height: 4rem;
  }
`;

export const HorizontalBar = styled(
  ({
    value,
    total,
    barStyle,
    lineContainerStyle,
    showNumericValue = true,
    children,
    ...props
  }: {
    value: number;
    total: number;
    barStyle: CSSProperties;
    showNumericValue?: boolean;
    lineContainerStyle?: CSSProperties;
  } & ButtonProps) => {
    return (
      <PlainButton {...props}>
        {children}
        <LineContainer style={lineContainerStyle}>
          {/*@ts-ignore*/}
          <HorizontalBar.Line style={barStyle} percentage={(value / total) * 100} />
          {showNumericValue ? abbreviate(value) : ''}
        </LineContainer>
      </PlainButton>
    );
  }
)`
  height: 12rem;
  padding: 0 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 3rem;
  font-size: var(--font-size-s);
  transition: box-shadow 200ms ease-in-out;
  pointer-events: ${props => (props.onClick ?? props.href ?? props.to ? 'unset' : 'none')};

  &:hover {
    box-shadow: var(--elevation-2);
  }
`;

// @ts-ignore
HorizontalBar.Line = styled.div<{ percentage: number; color: string }>`
  width: ${props => `${props.percentage}%`};
  height: 3rem;
  border-radius: 3rem;
  background-color: ${props => props.color};
`;

const LineContainer = styled.div`
  display: flex;
  border-radius: 100vmax;
  align-items: center;
  margin-top: -0.5rem;
  gap: 1rem;
  font-weight: 600;
`;
