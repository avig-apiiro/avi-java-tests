import _ from 'lodash';
import { HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Size } from '@src-v2/components/types/enums/size';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';

export const BusinessImpactIndicator = forwardRef<
  HTMLDivElement,
  { businessImpact: BusinessImpact; size?: Size } & HTMLAttributes<HTMLDivElement>
>(({ businessImpact, size = Size.XXSMALL, ...props }, ref) => {
  const displayImpact = businessImpact.toString();

  return (
    <IndicatorContent
      {...props}
      ref={ref}
      riskLevel={_.camelCase(displayImpact)}
      data-size={size}
      data-risk={displayImpact.toLowerCase()}>
      {displayImpact.charAt(0)}BI
    </IndicatorContent>
  );
});

const IndicatorContent = styled.div<{ riskLevel: string }>`
  width: fit-content;
  height: 5rem;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
  font-size: var(--font-size-xs);
  border-radius: 100vmax;

  &[data-size=${Size.XXSMALL}] {
    height: 4rem;
    padding: 0 1rem;
    font-size: 2.75rem;
  }

  &[data-size=${Size.SMALL}] {
    height: 6rem;
    font-size: var(--font-size-s);
  }

  &[data-size=${Size.MEDIUM}] {
    height: 7rem;
    padding: 0 3rem;
    font-size: var(--font-size-s);
  }

  &[data-size=${Size.LARGE}] {
    height: 8rem;
    padding: 0 4rem;
    font-size: var(--font-size-m);
  }

  &[data-risk='low'] {
    color: var(--color-yellow-60);
    border: 0.25rem solid var(--color-yellow-50);
    background-color: var(--color-yellow-10);
  }

  &[data-risk='medium'] {
    color: var(--color-orange-65);
    border: 0.25rem solid var(--color-orange-50);
    background-color: var(--color-orange-10);
  }

  &[data-risk='high'] {
    color: var(--color-red-60);
    border: 0.25rem solid var(--color-red-35);
    background-color: var(--color-red-10);
  }
`;
