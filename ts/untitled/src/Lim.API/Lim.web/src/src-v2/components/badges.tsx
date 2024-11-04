import { ReactNode, forwardRef } from 'react';
import styled, { StyledProps } from 'styled-components';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { dataAttr } from '@src-v2/utils/dom-utils';

export enum BadgeColors {
  Blue = 'blue',
  Glue = 'glue',
  Red = 'red',
  Yellow = 'yellow',
  Green = 'green',
  Purple = 'purple',
}

export type BadgeProps = {
  icon?: string;
  size?: Size.XXSMALL | Size.XSMALL | Size.SMALL | Size.MEDIUM | Size.LARGE;
  color?: BadgeColors;
  onClick?: () => void;
  children: ReactNode;
};

export const Badge = styled(
  forwardRef<HTMLDivElement, StyledProps<BadgeProps>>(
    ({ size = Size.SMALL, color = BadgeColors.Glue, icon, onClick, children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        data-size={size}
        data-color={color}
        data-icon={dataAttr(Boolean(icon))}
        data-clickable={dataAttr(Boolean(onClick))}>
        {icon && <SvgIcon name={icon} />}
        {children}
      </div>
    )
  )
)`
  // Default size is SMALL and color glue
  width: fit-content;
  max-width: 100%;
  display: flex;
  align-items: center;
  font-weight: 400;
  border-radius: 1rem;

  &[data-clickable] {
    cursor: pointer;
  }

  &[data-size=${Size.XXSMALL}] {
    height: 4rem;
    padding: 0 1.5rem;
    font-size: var(--font-size-xs);
  }

  &[data-size=${Size.XSMALL}] {
    height: 5rem;
    padding: 0 2rem;
    font-size: var(--font-size-xs);
  }

  &[data-size=${Size.SMALL}] {
    height: 6rem;
    padding: 0 2rem;
    font-size: var(--font-size-s);
  }

  &[data-size=${Size.MEDIUM}] {
    height: 7rem;
    padding: 0 2rem;
    font-size: var(--font-size-s);
  }

  &[data-size=${Size.LARGE}] {
    height: 8rem;
    padding: 0 3rem;
    font-size: var(--font-size-s);

    > ${BaseIcon} {
      width: 5rem;
      height: 5rem;
    }
  }

  &[data-icon] {
    padding-left: 1rem;
  }

  > ${BaseIcon} {
    width: 4rem;
    height: 4rem;
  }

  &[data-color=${BadgeColors.Glue}] {
    color: var(--color-blue-gray-70);
    border: 1px solid var(--color-blue-gray-35);
    background-color: var(--color-blue-gray-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-blue-gray-15);
      }

      &:active {
        background-color: var(--color-blue-gray-25);
      }
    }
  }

  &[data-color=${BadgeColors.Blue}] {
    color: var(--color-blue-70);
    border: 1px solid var(--color-blue-60);
    background-color: var(--color-blue-25);

    &[data-clickable] {
      &:hover {
        border-color: var(--color-blue-65);
        background-color: var(--color-blue-30);
      }

      &:active {
        background-color: var(--color-blue-35);
      }
    }
  }

  &[data-color=${BadgeColors.Red}] {
    color: var(--color-red-60);
    border: 0.25rem solid var(--color-red-35);
    background-color: var(--color-red-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-red-15);
      }

      &:active {
        background-color: var(--color-red-20);
      }
    }
  }

  &[data-color=${BadgeColors.Yellow}] {
    color: var(--color-yellow-60);
    border: 0.25rem solid var(--color-yellow-50);
    background-color: var(--color-yellow-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-yellow-15);
      }

      &:active {
        background-color: var(--color-yellow-20);
      }
    }
  }

  &[data-color=${BadgeColors.Green}] {
    color: var(--color-green-65);
    border: 0.25rem solid var(--color-green-45);
    background-color: var(--color-green-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-green-15);
      }

      &:active {
        background-color: var(--color-green-20);
      }
    }
  }

  &[data-color=${BadgeColors.Purple}] {
    color: var(--color-purple-70);
    border: 0.25rem solid var(--color-purple-45);
    background-color: var(--color-purple-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-purple-15);
      }

      &:active {
        background-color: var(--color-purple-20);
      }
    }
  }
`;

export const CodeBadge = styled(Badge)`
  font-family: 'Courier Prime';

  &[data-size=${Size.XXSMALL}] {
    padding: 0.5rem 1.5rem 0;
  }

  &[data-size=${Size.XSMALL}] {
    padding: 0.5rem 2rem 0;
  }

  &[data-size=${Size.SMALL}] {
    padding: 0.75rem 2rem 0;
  }

  &[data-size=${Size.MEDIUM}] {
    padding: 0.75rem 2rem 0;
  }

  &[data-size=${Size.LARGE}] {
    padding: 0.75rem 3rem 0;
  }

  ${BaseIcon} {
    margin-top: -0.5rem;
  }
`;
