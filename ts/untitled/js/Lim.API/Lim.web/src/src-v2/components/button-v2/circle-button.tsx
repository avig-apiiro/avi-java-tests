import { forwardRef } from 'react';
import styled from 'styled-components';
import { BaseButton } from '@src-v2/components/button-v2/base-button';
import {
  BaseButtonProps,
  ExternalLinkButtonProps,
  LinkButtonProps,
} from '@src-v2/components/button-v2/types';
import { Circle } from '@src-v2/components/circles';
import { BaseIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export type CircleButtonProps = (LinkButtonProps | ExternalLinkButtonProps | BaseButtonProps) & {
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  testMarker?: string;
};

export const CircleButton = styled(
  forwardRef<HTMLButtonElement | HTMLAnchorElement, StyledProps<CircleButtonProps>>(
    ({ children, size, testMarker, variant, disabled, ...buttonProps }, ref) => (
      <BaseButton
        ref={ref}
        {...buttonProps}
        data-variant={variant}
        data-disabled={dataAttr(disabled)}
        data-test-marker={dataAttr(Boolean(testMarker))}>
        <Circle size={size}>{children}</Circle>
      </BaseButton>
    )
  )
)`
  width: fit-content;
  display: inline-flex;
  background-color: var(--color-blue-gray-70);
  border-radius: 100vmax;
  cursor: pointer;

  ${BaseIcon} {
    color: var(--color-blue-gray-10);
  }

  &:not([data-disabled]) {
    &:hover {
      background-color: var(--color-blue-gray-75);
    }

    &:active {
      background-color: var(--color-blue-gray-80);
    }
  }

  &[data-disabled] {
    color: var(--color-blue-gray-10);
    background-color: var(--color-blue-gray-35);
    cursor: default;

    &:active {
      pointer-events: none;
    }
  }

  &[data-variant=${Variant.SECONDARY}] {
    background-color: transparent;

    ${Circle} {
      border: 0.25rem solid var(--color-blue-gray-30);
    }

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }

    &:not([data-disabled]) {
      &:hover {
        background-color: var(--color-blue-gray-15);

        ${Circle} {
          border-color: var(--color-blue-gray-40);
        }

        ${BaseIcon} {
          color: var(--color-blue-gray-60);
        }
      }

      &:active {
        background-color: var(--color-blue-gray-20);

        ${Circle} {
          border-color: var(--color-blue-gray-50);
        }

        ${BaseIcon} {
          color: var(--color-blue-gray-70);
        }
      }
    }

    &[data-disabled] {
      color: var(--color-blue-gray-35);

      ${Circle} {
        border: 0.25rem solid var(--color-blue-gray-20);
      }

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
          color: var(--color-blue-gray-60);
        }
      }

      &:active {
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

  &[data-variant=${Variant.ATTENTION}] {
    background-color: var(--color-red-50);

    ${BaseIcon} {
      color: var(--color-white);
    }

    &:not([data-disabled]) {
      &:hover {
        background-color: var(--color-red-60);
      }

      &:active {
        background-color: var(--color-red-65);
      }
    }

    &[data-disabled] {
      background-color: var(--color-red-25);

      ${BaseIcon} {
        color: var(--color-blue-gray-10);
        background-color: var(--color-red-25);
      }
    }
  }

  &[data-variant=${Variant.FLOATING}] {
    background-color: transparent;
    box-shadow: var(--elevation-1);

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }

    &:not([data-disabled]) {
      &:hover {
        background-color: var(--color-blue-gray-15);
        box-shadow: var(--elevation-2);

        ${BaseIcon} {
          color: var(--color-blue-gray-60);
        }
      }

      &:active {
        background-color: var(--color-blue-gray-20);

        ${BaseIcon} {
          color: var(--color-blue-gray-70);
        }
      }
    }

    &[data-disabled] {
      box-shadow: none;

      ${BaseIcon} {
        color: var(--color-blue-gray-35);
      }
    }
  }
`;
