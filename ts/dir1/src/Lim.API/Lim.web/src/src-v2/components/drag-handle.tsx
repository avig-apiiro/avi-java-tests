import { HTMLProps } from 'react';
import styled from 'styled-components';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useMouseDrag } from '@src-v2/hooks/dom-events/use-mouse-drag';
import { useCombineCallbacks } from '@src-v2/hooks/use-combine-callbacks';
import { dataAttr } from '@src-v2/utils/dom-utils';

const Bar = styled.div`
  height: 0.25rem;
  width: 100%;
  background-color: var(--color-blue-gray-20);
  border-radius: 100vmax;

  transition: border 0.25s;

  [data-vertical] > & {
    height: 100%;
    width: 0.25rem;
  }
`;

export const DragHandle = styled(
  ({
    vertical,
    variant,
    onMouseDown,
    ...props
  }: {
    vertical?: boolean;
    variant?: Variant.PRIMARY | Variant.SECONDARY;
  } & HTMLProps<HTMLDivElement>) => {
    const handleMouseDown = useMouseDrag<HTMLDivElement>(
      () => document.body.classList.add('dragging'),
      [onMouseDown],
      () => setTimeout(() => document.body.classList.remove('dragging'))
    );

    return (
      <div
        {...props}
        data-vertical={dataAttr(vertical)}
        onMouseDown={useCombineCallbacks(handleMouseDown, onMouseDown)}>
        {variant !== Variant.SECONDARY && <Bar />}
      </div>
    );
  }
)`
  --thumb-height: 0.75rem;
  --thumb-width: 7rem;

  position: relative;
  user-select: none;
  cursor: grab;

  :not([data-vertical]) {
    height: 0.75rem;
  }

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    height: var(--thumb-height);
    width: var(--thumb-width);
    transform: translate(-50%, -75%);

    border-radius: 100vmax;
    background: var(--color-blue-gray-30);

    transition:
      background 0.25s,
      height 0.25s,
      width 0.25s;
  }

  &[data-vertical]:after {
    width: var(--thumb-height);
    height: var(--thumb-width);

    transform: translate(0, -0.5px) translate(-50%, -50%);
  }

  &:active {
    cursor: grabbing;
  }

  &:hover,
  &:active {
    &:after {
      --thumb-height: 1.25rem;
      background-color: var(--color-blue-gray-50);
    }

    ${Bar} {
      background-color: var(--color-blue-gray-30);
    }
  }
`;
