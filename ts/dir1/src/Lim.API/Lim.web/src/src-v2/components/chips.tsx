import { HTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { SvgIcon } from '@src-v2/components/icons';
import { ErrorTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

type ChipProps = StyledProps<{
  size?: Size;
  disabled?: boolean;
  selected?: boolean;
  onRemove?: (event) => void;
  onClick?: (event) => void;
  errorMessage?: string;
}>;

const _Chip = styled(
  forwardRef<HTMLSpanElement, ChipProps>(
    (
      {
        size = Size.SMALL,
        disabled = false,
        selected = false,
        onClick = null,
        onRemove = null,
        errorMessage,
        children,
        ...props
      },
      ref
    ) => (
      <span
        {...props}
        ref={ref}
        data-clickable={dataAttr(Boolean(onClick))}
        data-size={size}
        data-disabled={dataAttr(disabled)}
        data-selected={dataAttr(selected)}
        data-error={dataAttr(Boolean(errorMessage))}
        onClick={onClick}>
        <Chip.Content>
          {errorMessage && <ErrorTooltip content={errorMessage} />}
          {typeof children === 'string' ? <ClampText>{children}</ClampText> : children}
        </Chip.Content>
        {Boolean(onRemove) && <Chip.RemoveButton onClick={onRemove} />}
      </span>
    )
  )
)`
  width: fit-content;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-s);
  font-weight: 400;
  background-color: var(--color-blue-25);
  border: 0.25rem solid var(--color-blue-60);
  border-radius: 1rem;

  ${Circle} {
    margin-right: 1rem;
  }

  &[data-size=${Size.SMALL}] {
    height: 6rem;
    padding: ${props => (props.onRemove ? '0 0 0 1rem' : '0 1rem')};

    ${Circle} {
      --circle-size: 4rem;
      width: var(--circle-size);
      height: var(--circle-size);
    }
  }

  &[data-size=${Size.MEDIUM}] {
    height: 7rem;
    padding: ${props => (props.onRemove ? '0 0 0 2rem' : '0 2rem')};

    ${Circle} {
      --circle-size: 5rem;
      width: var(--circle-size);
      height: var(--circle-size);
    }
  }

  &[data-clickable] {
    cursor: pointer;

    &:hover {
      background-color: var(--color-blue-35);
    }

    &:active,
    &[data-selected] {
      background-color: var(--color-blue-40);
    }
  }

  &[data-disabled] {
    color: var(--color-blue-gray-60);
    background-color: var(--color-blue-25);
    border-color: var(--color-blue-50);
    cursor: default;
  }

  &[data-error] {
    border-color: var(--color-red-35);
    background: var(--color-red-10);
  }
`;

export const Chip = assignStyledNodes(_Chip, {
  Content: styled.span`
    max-width: 100rem;
    height: 100%;
    display: flex;
    align-items: center;
    flex-shrink: 1;
    overflow: hidden;
  `,
  RemoveButton: styled((props: HTMLAttributes<HTMLImageElement>) => (
    <SvgIcon {...props} name="Close" />
  ))`
    flex-shrink: 0;
    color: var(--color-blue-gray-50);
    transition: color 200ms;
    cursor: pointer;

    &:hover {
      color: var(--color-blue-gray-60);
    }
  `,
});
