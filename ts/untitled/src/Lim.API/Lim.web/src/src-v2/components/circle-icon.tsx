import { HTMLAttributes, forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

interface CircleIconProps {
  icon: string;
  size?: Size;
  active?: boolean;
  variant?: Variant;
  disabled?: boolean;
}

export const CircleIcon = styled(
  forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & StyledProps<CircleIconProps>>(
    ({ icon, size, active, variant, disabled, onClick, ...props }, ref) => {
      const iconSize = useMemo(
        () => ([Size.XLARGE, Size.LARGE, Size.XXLARGE].includes(size) ? Size.SMALL : Size.XSMALL),
        [size]
      );
      return (
        <Circle
          {...props}
          ref={ref}
          size={size}
          data-variant={variant}
          data-active={dataAttr(active)}
          data-disabled={dataAttr(disabled)}
          onClick={onClick}>
          <SvgIcon name={icon} size={iconSize} />
        </Circle>
      );
    }
  )
)`
  background-color: var(--color-blue-gray-70);
  border-radius: 100vmax;
  cursor: pointer;

  ${BaseIcon} {
    color: var(--color-white);
  }

  &:not([data-disabled]) {
    &:hover {
      background-color: var(--color-blue-gray-75);
    }

    &[data-active] {
      background-color: var(--color-blue-gray-80);
    }
  }

  &[data-disabled] {
    color: var(--color-blue-gray-10);
    background-color: var(--color-blue-gray-35);
    cursor: default;

    &[data-active] {
      pointer-events: none;
    }
  }

  &[data-variant=${Variant.SECONDARY}] {
    background-color: var(--color-white);
    border: 0.25rem solid var(--color-blue-gray-70);

    ${BaseIcon} {
      color: var(--color-blue-gray-70);
    }

    &:not([data-disabled]) {
      &:hover {
        background-color: var(--color-blue-gray-15);
      }

      &[data-active] {
        background-color: var(--color-blue-gray-20);
      }
    }

    &[data-disabled] {
      color: var(--color-blue-gray-35);
      border: 0.25rem solid var(--color-blue-gray-30);

      ${BaseIcon} {
        color: var(--color-blue-gray-35);
      }
    }
  }

  &[data-variant=${Variant.TERTIARY}] {
    background-color: transparent;
    border: 0;

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }

    &:not([data-disabled]) {
      &:hover {
        background-color: var(--color-blue-gray-20);

        ${BaseIcon} {
          color: var(--color-blue-gray-70);
        }
      }

      &[data-active] {
        background-color: var(--color-blue-gray-25);

        ${BaseIcon} {
          color: var(--color-blue-gray-70);
        }
      }
    }

    &[data-disabled] {
      ${BaseIcon} {
        color: var(--color-blue-gray-35);
      }
    }
  }
`;
