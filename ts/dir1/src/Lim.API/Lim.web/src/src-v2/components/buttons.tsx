import { HTMLAttributes, HTMLProps, MouseEvent, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles/circle';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { SvgArrow } from '@src-v2/components/svg/svg-arrow';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { classNames } from '@src-v2/utils/style-utils';

export interface ButtonProps
  extends Partial<
    HTMLAttributes<HTMLElement> &
      StyledProps<{
        to: string;
        href: string;
        target: string;
        type: 'button' | 'submit' | 'reset';
        disabled: boolean;
        onClick: (event?: MouseEvent) => void;
        size?: Size;
      }>
  > {}

export interface IconButtonProps extends ButtonProps {
  name: string;
}

/**
 * @deprecated since version 1.2031.0 use <Button/> instead
 */
export const PlainButton = forwardRef<
  HTMLButtonElement | HTMLSpanElement | HTMLAnchorElement,
  ButtonProps
>(({ target, disabled, className, children, ...props }, ref) => {
  const Container = props.to ? Link : props.href ? 'a' : props.type ? 'button' : 'span';

  return (
    <Container
      {...props}
      // @ts-ignore
      target={target ?? (props.href ? '_blank' : null)}
      ref={ref as any}
      className={classNames(className, { disabled })}>
      {children}
    </Container>
  );
});

/**
 * @deprecated since version 1.2031.0 use <Button/> instead
 */
export const DynamicButton = styled(PlainButton)`
  position: relative;
  display: inline-flex;
  padding: 0 4rem;
  color: var(--color-blue-gray-70);
  font-weight: 400;
  line-height: 2.5;
  white-space: nowrap;
  align-items: center;
  justify-content: center;
  border-radius: 2rem;
  border: 0.25rem solid var(--color-blue-gray-70);
  background-color: var(--color-white);
  transition:
    color 200ms,
    border-color 200ms,
    background-color 200ms;
  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-20);
  }

  &.disabled {
    color: var(--color-blue-gray-35);
    background-color: var(--color-white);
    border-color: var(--color-blue-gray-35);

    &:active {
      pointer-events: none;
    }
  }

  &[data-label]:after {
    content: attr(data-label);
    position: absolute;
    top: -2.25rem;
    right: -2.25rem;
    padding: 0 1.5rem;
    color: var(--color-blue-gray-70);
    font-size: 2.5rem;
    font-weight: 500;
    line-height: 4rem;
    border-radius: 100vmax;
    border: 0.25rem solid var(--color-blue-gray-75);
    background-color: var(--color-white);
  }
`;

/**
 * @deprecated since version 1.2031.0 use <Button/> instead
 */
export const InlineButton = styled(DynamicButton)`
  height: 8rem;
  padding: 0 3rem;
  font-size: var(--font-size-s);
  color: var(--default-text-color);
  border-color: var(--color-blue-gray-70);
  border-radius: 100vmax;

  &:hover {
    background-color: var(--color-blue-20);
  }

  &.disabled {
    color: var(--color-blue-gray-40);
    border-color: var(--color-blue-gray-40);
    background-color: var(--color-white);
    cursor: default;
    &:active {
      pointer-events: none;
    }
  }

  &[data-active] {
    border-color: var(--color-blue-65);
    background-color: var(--color-blue-25);

    &:hover {
      background-color: var(--color-blue-30);
    }
  }

  &[data-status='primary'] {
    color: var(--color-white);
    background-color: var(--color-blue-gray-70);
    border-color: transparent;

    &:hover,
    &[data-active] {
      background-color: var(--color-blue-gray-80);
    }

    &.disabled {
      background-color: var(--color-blue-gray-35);
    }
  }

  &[data-status='failure'] {
    color: var(--color-white);
    background-color: var(--color-red-45);
    border-color: transparent;

    &:hover {
      background-color: var(--color-red-50);
    }

    &.disabled {
      background-color: var(--color-red-20);
    }
  }

  &[data-status='light']:not([data-active]):not([data-disabled]):hover {
    background-color: var(--color-blue-20);
    border-color: var(--color-blue-gray-40);
  }

  &[data-status='light']:not([data-active]):not([data-disabled])[data-visible] {
    background-color: var(--color-blue-25);
    border-color: var(--color-blue-65);
  }

  &[data-status='light']:not([data-active][data-disabled])[data-visible]:hover {
    background-color: var(--color-blue-30);
    border-color: var(--color-blue-65);
  }

  &[data-status='light'][data-active]:not([data-disabled]) {
    background-color: var(--color-blue-25);
    border-color: var(--color-blue-65);
  }

  &[data-status='light'][data-active]:not([data-disabled]):hover {
    background-color: var(--color-blue-30);
    border-color: var(--color-blue-65);
  }
`;

/**
 * @deprecated since version 1.2031.0 use <CircleButton/> instead
 */
export const CircleButton = styled(
  forwardRef<HTMLButtonElement | HTMLSpanElement | HTMLAnchorElement, ButtonProps>(
    ({ children, size, ...props }, ref) => (
      <PlainButton ref={ref} {...props}>
        <Circle size={size} />
      </PlainButton>
    )
  )
)`
  ${Circle} {
    box-shadow: var(--elevation-1);
    background-color: var(--color-white);
    border: 0.25rem transparent solid;

    &:hover {
      background-color: var(--color-blue-gray-20);
      border-color: var(--color-blue-gray-30);
    }

    &:active {
      background-color: var(--color-blue-gray-25);
      border-color: var(--color-blue-gray-40);
    }
  }
`;

/**
 * @deprecated since version 1.2031.0 use <CircleButton/> instead
 */
export const InsertAction = styled(
  forwardRef<HTMLSpanElement, HTMLProps<HTMLSpanElement> & StyledProps<{ icon?: string }>>(
    ({ icon = 'Plus', children, ...props }, ref) => (
      <span ref={ref} {...props}>
        <SvgIcon name={icon} />
        {children}
      </span>
    )
  )
)`
  display: inline-flex;
  padding-right: 4rem;
  font-size: var(--font-size-s);
  font-weight: 300;
  line-height: 9rem;
  align-items: center;
  cursor: pointer;
  gap: 1rem;

  &:hover > ${BaseIcon} {
    fill: var(--color-green-50);
  }

  > ${BaseIcon} {
    width: 8rem;
    height: 8rem;
    fill: var(--color-green-40);
    color: var(--color-white);
  }
`;

/**
 * @deprecated since version 1.2031.0 use <CircleButton/> instead
 */
export const ArrowButton = styled(
  forwardRef<HTMLButtonElement | HTMLSpanElement | HTMLAnchorElement, ButtonProps>(
    ({ children, ...props }, ref) => (
      <DynamicButton ref={ref} {...props}>
        {children}
        <ArrowIcon />
      </DynamicButton>
    )
  )
)`
  height: 15rem;
  padding: 0 4rem;
  font-size: var(--font-size-l);
`;

export const ArrowIcon = styled(props => <SvgArrow width={20} {...props} />)`
  width: 0;
  margin-left: 0;
  flex-shrink: 0;
  transition: all 200ms;

  ${ArrowButton}:hover & {
    width: 6rem;
    margin-left: 2rem;
  }
`;

export const IconButton = styled(
  forwardRef<HTMLImageElement, IconButtonProps>(({ disabled, ...props }, ref) => (
    <SvgIcon ref={ref} data-disabled={dataAttr(disabled)} {...props} />
  ))
)`
  color: var(--color-blue-gray-50);
  transition: color 120ms;

  &:hover {
    color: var(--color-blue-gray-60);
  }

  &[data-disabled] {
    color: var(--color-blue-gray-35);
    cursor: default;

    ${BaseIcon} {
      opacity: 30%;
    }

    &:active {
      pointer-events: none;
    }
  }
`;

export const DeleteButton = styled(
  forwardRef<HTMLImageElement, ButtonProps>((props, ref) => (
    <IconButton ref={ref} {...props} name="Trash" />
  ))
)`
  &:hover {
    color: var(--color-red-45);

    .to-animate {
      transform: rotate(10deg);
    }
  }

  .to-animate {
    transition: transform 200ms;
    transform-origin: right;
  }
`;

export const TextIconButton = styled(
  ({
    button: Button = InlineButton,
    status,
    loading,
    disabled,
    iconName,
    onClick,
    onIconClick,
    children,
    ...props
  }) => (
    <Button {...props} data-status={status} disabled={disabled || loading} onClick={onClick}>
      <SvgIcon
        name={loading ? 'Spinner' : iconName}
        data-loading={dataAttr(loading)}
        onClick={onIconClick}
      />
      {children}
    </Button>
  )
)`
  display: flex;
  gap: 2rem;

  ${BaseIcon} {
    &[data-loading] path {
      animation: var(--spin) 1s infinite ease-in-out;
    }
  }
`;

/**
 * @deprecated since version 1.2031.0 use <TextButton/> instead
 */
export const UnderlineButton = styled.span`
  color: var(--color-blue-gray-60);
  cursor: pointer;
  transition: color 200ms ease-in-out;

  &:hover {
    color: var(--color-blue-gray-70);
    text-decoration: underline;
  }

  &[data-disabled] {
    color: var(--color-blue-gray-40);

    &:active {
      pointer-events: none;
    }
  }
`;

export const ChevronPagingButton = styled(({ ...props }) => <SvgIcon {...props} name="Chevron" />)`
  color: var(--color-white);
  background-color: var(--color-blue-gray-50);
  border-radius: 100vmax;

  &:hover {
    background-color: var(--color-blue-gray-60);
  }

  &[data-prev] {
    transform: scaleX(-1);
  }

  &[disabled] {
    background-color: var(--color-blue-gray-30);
  }
`;
