import {
  CSSProperties,
  Children,
  DetailedHTMLProps,
  HTMLAttributes,
  HTMLProps,
  ReactNode,
  forwardRef,
} from 'react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Clamp, ClampText } from '@src-v2/components/clamp-text';
import { ContentLimiter } from '@src-v2/components/content-limiter';
import { Checkbox } from '@src-v2/components/forms/checkbox';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Heading6 } from '@src-v2/components/typography';
import { useDetectOverflowRight, useForwardRef } from '@src-v2/hooks';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { customScrollbar } from '@src-v2/style/mixins';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

type DropdownGroupProps = {
  title?: string;
  children: ReactNode;
};

type DropdownCollapsibleGroupProps = {
  title: string;
  open: boolean;
  icon?: string;
  onToggle?: () => void;
  children: ReactNode;
};

type DropdownItemProps = {
  selected?: boolean;
  highlight?: boolean;
  disabled?: boolean;
  creatable?: boolean;
} & HTMLProps<HTMLLIElement>;

const List = styled(
  forwardRef<
    HTMLUListElement,
    DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement> & {
      style: CSSProperties;
      rows: number;
    }
  >(({ style, ...props }, ref) => {
    const innerRef = useForwardRef(ref);
    const overflowDetected = useDetectOverflowRight(innerRef, 20);
    return (
      <ul ref={innerRef} style={{ ...style, right: overflowDetected ? 0 : undefined }} {...props} />
    );
  })
)`
  position: relative;
  z-index: 1010;
  top: 0;
  min-width: 100%;
  max-width: 35vw;
  max-height: ${({ rows = 10 }) => rows * 10}rem;
  background-color: var(--color-white);
  box-shadow: 0 1rem 2.5rem var(--default-shadow-color);
  border: 0.25rem solid var(--color-blue-gray-20);
  border-radius: 1rem;

  ${customScrollbar};

  &:empty {
    display: none;
  }
`;

const Title = styled(Heading6)`
  padding: 1rem 2rem;
  color: var(--color-blue-gray-55);
`;

const Group = styled(({ title, children, ...props }: DropdownGroupProps) => {
  return Children.count(children) ? (
    <li data-dropdown="group" {...props}>
      {title && <Dropdown.Title>{title}</Dropdown.Title>}
      <ul>{children}</ul>
    </li>
  ) : null;
})`
  &:not([data-no-separator]):not(:last-of-type) {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 0.25rem solid var(--color-blue-gray-30);
  }
`;

const CollapsibleGroup = styled(
  ({
    title,
    open,
    icon = 'Chevron',
    onToggle,
    children,
    ...props
  }: DropdownCollapsibleGroupProps) => {
    const { isOpen, shouldRender, getTriggerProps, getContentProps } =
      useCollapsible<HTMLUListElement>({
        open,
        onToggle,
      });
    return (
      <li data-dropdown="collapsible-group" {...props} data-open={dataAttr(isOpen)}>
        <Dropdown.Title {...getTriggerProps()}>
          <ClampText>{title}</ClampText> <SvgIcon name={icon} />
        </Dropdown.Title>
        <ul {...getContentProps()}>{shouldRender && children}</ul>
      </li>
    );
  }
)`
  margin-bottom: 1rem;

  &:not(:last-of-type):after {
    content: '';
    display: block;
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: 0 solid var(--color-blue-gray-20);
    transition: all 400ms;
  }

  &[data-open] {
    &:after {
      margin-bottom: 5rem;
      padding-bottom: 4rem;
      border-bottom-width: 0.25rem;
    }

    > ${Title} ${BaseIcon}[data-name="Chevron"] {
      transform: rotate(90deg);
    }
  }

  // eslint-disable-next-line no-use-before-define

  > ${Title} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
    cursor: pointer;
    gap: 4rem;

    ${BaseIcon} {
      color: var(--color-blue-gray-50);
      transition: transform 400ms;
    }
  }
`;

const Item = styled(
  forwardRef<HTMLLIElement, DropdownItemProps>(
    ({ selected, highlight, disabled, creatable, ...props }: DropdownItemProps, ref) => (
      <li
        ref={ref}
        data-dropdown="item"
        data-disabled={dataAttr(disabled)}
        data-selected={dataAttr(selected)}
        data-highlight={dataAttr(highlight)}
        {...props}
      />
    )
  )
)`
  display: block;
  padding: 0 3rem;
  font-weight: 400;
  line-height: 8rem;
  border-radius: 2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;

  &:hover:not([data-disabled]),
  &[data-highlight] {
    background-color: var(--color-blue-gray-15);
  }

  &[data-selected] {
    font-weight: 500;
    background-color: var(--color-blue-gray-20);
  }

  &[data-disabled] {
    color: var(--color-blue-gray-35);
    cursor: default;
    pointer-events: none;

    & > ${BaseIcon} {
      color: inherit;
    }

    &:active {
      pointer-events: none;
    }
  }

  &[data-dropdown='checkbox-item'] {
    padding: 0 3rem 0 2rem;
  }

  &[data-limit]:after {
    content: 'Premium';
    padding: 0 2rem;
    color: var(--color-purple-60);
    font-size: var(--font-size-s);
    font-weight: 600;
    line-height: 2;
    border-radius: 1rem;
    background-color: var(--color-purple-10);
    cursor: pointer;
  }
`;

const CheckboxItem = styled(({ className, style, children, ...props }) => (
  <Item data-dropdown="checkbox-item">
    <label className={className} style={style}>
      <Checkbox {...props} />
      {children}
    </label>
  </Item>
))`
  display: block;
  flex: 1 0 auto;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;

  ${Checkbox} {
    margin-right: 2rem;
  }

  ${Clamp} {
    max-width: 80rem;
  }
`;

const LoadingItem = styled(props => (
  <Dropdown.Item {...props}>
    <LogoSpinner />
  </Dropdown.Item>
))`
  align-items: center;

  ${LogoSpinner} {
    width: 6rem;
    height: 6rem;
  }
`;

const Limiter = styled(props => <ContentLimiter as="li" limit={5} {...props} />)`
  display: block;
  padding: 0 3rem;
  color: var(--color-blue-gray-60);
  font-size: var(--font-size-xs);
`;

const IconItem = styled(
  forwardRef<
    HTMLLIElement,
    HTMLAttributes<HTMLLIElement> &
      StyledProps<{ item: { label: string; value: { icon: Element } } }>
  >(({ item, children, ...props }, ref) => {
    return (
      <Dropdown.Item ref={ref} {...props}>
        {item.value.icon}
        {item.label}
      </Dropdown.Item>
    );
  })
)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Dropdown = assignStyledNodes(
  styled.div`
    display: flex;
    position: relative;
    align-content: stretch;
    white-space: nowrap;
  `,
  {
    List,
    Title,
    Group,
    CollapsibleGroup,
    Item,
    Limiter,
    LoadingItem,
    CheckboxItem,
    IconItem,
  }
);
