import { forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { BaseButton } from '@src-v2/components/button-v2/base-button';
import {
  BaseButtonProps,
  ExternalLinkButtonProps,
  LinkButtonProps,
} from '@src-v2/components/button-v2/types';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export type ButtonProps = (LinkButtonProps | ExternalLinkButtonProps | BaseButtonProps) & {
  size?: Size;
  variant?: Variant;
  startIcon?: string;
  endIcon?: string;
  loading?: boolean;
  disabled?: boolean;
};

export const Button = styled(
  forwardRef<HTMLButtonElement | HTMLAnchorElement, StyledProps<ButtonProps>>(
    (
      {
        children,
        loading,
        startIcon,
        endIcon,
        size = Size.LARGE,
        variant = Variant.PRIMARY,
        disabled,
        ...buttonProps
      },
      ref
    ) => {
      const buttonIconSize = useMemo(
        () => (size === Size.LARGE ? Size.XSMALL : Size.XXSMALL),
        [size]
      );
      return (
        <BaseButton
          {...buttonProps}
          ref={ref}
          data-variant={variant}
          disabled={disabled || loading}
          data-size={size}
          data-disabled={dataAttr(disabled || loading)}>
          {startIcon && (
            <SvgIcon
              name={loading ? 'Spinner' : startIcon}
              data-loading={dataAttr(loading)}
              size={loading ? Size.SMALL : buttonIconSize}
              style={{ marginLeft: '-0.5rem' }}
            />
          )}
          {loading && !startIcon && !endIcon ? (
            <SvgIcon name="Spinner" data-loading={dataAttr(loading)} size={Size.SMALL} />
          ) : (
            <Label>{children}</Label>
          )}
          {endIcon && (
            <SvgIcon
              name={loading && !startIcon ? 'Spinner' : endIcon}
              data-loading={dataAttr(loading && !startIcon)}
              size={loading ? Size.SMALL : buttonIconSize}
              style={{ marginRight: '-0.5rem' }}
            />
          )}
        </BaseButton>
      );
    }
  )
)`
  --button-height: 8rem;
  --button-vertical-padding: 1rem;
  --button-horizontal-padding: 3rem;

  height: var(--button-height);
  min-width: 19rem;
  width: fit-content;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  border-radius: 100vmax;
  color: var(--color-white);
  padding: var(--button-vertical-padding) var(--button-horizontal-padding);
  background-color: var(--color-blue-gray-70);
  font-size: var(--font-size-s);
  font-style: normal;
  font-weight: 400;
  line-height: 5rem;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-80);
  }

  &[data-active] {
    background-color: var(--color-blue-gray-80);
  }

  &[data-disabled] {
    color: var(--color-blue-gray-10);
    background-color: var(--color-blue-gray-35);
    cursor: not-allowed;
    user-select: none;
  }

  ${BaseIcon} {
    &[data-loading] path {
      transform-origin: center center;
      animation: var(--spin) 1s infinite ease-in-out;
    }
  }

  &[data-size=${Size.SMALL}] {
    --button-height: 6rem;
  }

  &[data-size=${Size.MEDIUM}] {
    --button-height: 7rem;
  }

  &[data-size=${Size.LARGE}] {
    --button-height: 8rem;
  }

  &[data-variant=${Variant.SECONDARY}] {
    background-color: var(--color-white);
    color: var(--color-blue-gray-70);
    border: 0.25rem solid var(--color-blue-gray-70);

    &:hover {
      background-color: var(--color-blue-gray-15);
    }

    &[data-active] {
      background-color: var(--color-blue-gray-20);
    }

    &[data-disabled] {
      color: var(--color-blue-gray-35);
      border: 0.25rem solid var(--color-blue-gray-30);

      &:hover {
        background-color: var(--color-white);
      }
    }
  }

  &[data-variant=${Variant.TERTIARY}] {
    background-color: var(--color-white);
    color: var(--color-blue-gray-70);
    border: 0;

    &:hover {
      background-color: var(--color-blue-gray-15);
    }

    &[data-active] {
      background-color: var(--color-blue-gray-20);
    }

    &[data-disabled] {
      color: var(--color-blue-gray-35);

      &:hover {
        background-color: var(--color-white);
      }
    }
  }

  &[data-variant=${Variant.ATTENTION}] {
    background-color: var(--color-red-50);
    color: var(--color-white);
    border: 0;

    &:hover {
      background-color: var(--color-red-60);
    }

    &[data-active] {
      background-color: var(--color-red-65);
    }

    &[data-disabled] {
      color: var(--color-blue-gray-10);
      background-color: var(--color-red-25);
    }
  }

  &[data-variant=${Variant.FILTER}] {
    background-color: var(--color-white);
    color: var(--color-blue-gray-70);
    border: 0.25rem solid var(--color-blue-gray-30);

    &:hover {
      background-color: var(--color-blue-20);
      border-color: var(--color-blue-gray-40);
    }

    &[data-active] {
      background-color: var(--color-blue-25);
      border-color: var(--color-blue-65);

      &:hover {
        background-color: var(--color-blue-35);
      }
    }

    &[data-disabled] {
      color: var(--color-blue-gray-35);
      background-color: var(--color-blue-gray-10);
      border-color: var(--color-blue-gray-25);
    }
  }
`;

const Label = styled.div`
  width: max-content;
  display: flex;
  align-items: center;
`;
