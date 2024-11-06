import { forwardRef } from 'react';
import styled from 'styled-components';
import { BaseButton } from '@src-v2/components/button-v2/base-button';
import {
  BaseButtonProps,
  ExternalLinkButtonProps,
  LinkButtonProps,
} from '@src-v2/components/button-v2/types';
import { SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export enum LinkMode {
  EXTERNAL = 'external',
  INTERNAL = 'internal',
}

export type TextButtonProps = (LinkButtonProps | ExternalLinkButtonProps | BaseButtonProps) & {
  size?: Size.XSMALL | Size.XXSMALL;
  showArrow?: boolean | 'external' | 'internal';
  mode?: LinkMode;
  underline?: boolean;
  disabled?: boolean;
};

export const TextButton = styled(
  forwardRef<HTMLButtonElement | HTMLAnchorElement, StyledProps<TextButtonProps>>(
    (
      {
        children,
        showArrow,
        mode = LinkMode.INTERNAL,
        underline,
        disabled,
        size = Size.XSMALL,
        ...buttonProps
      },
      ref
    ) => {
      return (
        <BaseButton
          {...buttonProps}
          ref={ref}
          data-mode={mode}
          data-size={size}
          data-underline={dataAttr(underline)}
          data-disabled={dataAttr(disabled)}>
          <>
            <EllipsisText>{children}</EllipsisText>
            {showArrow && (
              <SvgIcon
                name={showArrow === 'external' ? 'External' : 'Arrow'}
                data-disabled={dataAttr(disabled)}
                size={size}
              />
            )}
          </>
        </BaseButton>
      );
    }
  )
)`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  font-size: var(--font-size-s);
  font-style: normal;
  font-weight: 400;
  line-height: 5rem;
  cursor: pointer;

  &[data-disabled] {
    cursor: not-allowed;
    pointer-events: none;
    user-select: none;
  }

  &[data-underline] {
    text-decoration: underline;
  }

  &[data-size=${Size.XXSMALL}] {
    line-height: 4rem;
    font-size: var(--font-size-xs);
  }

  &[data-mode=${LinkMode.INTERNAL}] {
    color: var(--color-blue-gray-60);

    &:hover:not([data-disabled]) {
      color: var(--color-blue-gray-70);
      text-decoration: underline;
    }
  }

  &[data-mode=${LinkMode.EXTERNAL}] {
    color: var(--color-blue-65);

    &:hover:not([data-disabled]) {
      color: var(--color-blue-70);
      text-decoration: underline;
    }
  }

  &[data-mode]&[data-disabled] ${EllipsisText} {
    color: var(--color-blue-gray-35);
  }

  ${Tooltip} & {
    color: var(--color-blue-45);
    opacity: 0.8;

    &:hover:not([data-disabled]) {
      color: var(--color-blue-50);
      text-decoration: underline;
      opacity: 1;
    }
  }
`;
