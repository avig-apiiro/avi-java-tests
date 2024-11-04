import { MouseEvent, ReactNode, forwardRef } from 'react';
import styled from 'styled-components';
import { Button as ButtonComponent } from '@src-v2/components/button-v2';
import { Counter } from '@src-v2/components/counter';
import { Dropdown } from '@src-v2/components/dropdown';
import { Checkbox } from '@src-v2/components/forms';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Popover as TooltipPopover } from '@src-v2/components/tooltips/popover';
import { TippyAttributes } from '@src-v2/components/tooltips/tippy';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Strong } from '@src-v2/components/typography';
import { useGroupProperties, useToggle } from '@src-v2/hooks';
import { useCombineCallbacks } from '@src-v2/hooks/use-combine-callbacks';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { DropdownMenu } from './dropdown-menu';

type SelectMenuProps = {
  placeholder: ReactNode;
  leftIconName?: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: Variant;
  popover?: any;
  plugins?: any[];
  onClick?: (event?: MouseEvent) => void;
  onItemClick?: (event?: MouseEvent) => void;
  onClose?: () => void;
  onHide?: () => void;
  onShow?: () => void;
  children: ReactNode;
};

const _SelectMenu = forwardRef<
  HTMLButtonElement | HTMLSpanElement | HTMLAnchorElement,
  SelectMenuProps
>(
  (
    {
      placeholder = 'Select...',
      leftIconName,
      icon = 'Chevron',
      active = false,
      disabled = false,
      readOnly = false,
      variant = Variant.SECONDARY,
      popover: Popover = SelectMenu.Popover,
      plugins,
      onClick,
      onClose,
      onItemClick,
      onHide,
      onShow,
      children,
      ...props
    },
    ref
  ) => {
    const [popoverProps, buttonProps] = useGroupProperties(props, TippyAttributes.concat('rows'));
    const [visible, toggleVisibility] = useToggle();
    const handleHide = useCombineCallbacks(onHide, toggleVisibility);
    const handleShow = useCombineCallbacks(onShow, toggleVisibility);
    return (
      <Popover
        {...popoverProps}
        content={children}
        customPlugins={plugins}
        noDelay
        onClick={onItemClick}
        onHide={!readOnly ? handleHide : null}
        onShow={!readOnly ? handleShow : null}
        noArrow>
        <SelectMenu.Button
          {...buttonProps}
          ref={ref}
          disabled={disabled}
          data-disabled={dataAttr(disabled)}
          data-has-close={dataAttr(Boolean(onClose))}
          data-visible={dataAttr(visible)}
          data-active={dataAttr(active)}
          variant={variant}
          onClick={onClick}>
          <LeftIconPlaceholder>
            {leftIconName && <SvgIcon data-left-icon="true" name={leftIconName} />}
            <SelectMenu.Placeholder>{placeholder}</SelectMenu.Placeholder>
          </LeftIconPlaceholder>
          <CloseChevronContainer>
            {!readOnly && Boolean(onClose) && (
              <Tooltip content="Clear and remove filter">
                <OnCloseButton name="CloseLarge" size={Size.XXSMALL} onClick={onClose} />
              </Tooltip>
            )}
            {!readOnly && <SvgIcon name={icon} />}
          </CloseChevronContainer>
        </SelectMenu.Button>
      </Popover>
    );
  }
);

const LeftIconPlaceholder = styled.div`
  display: flex;
  align-items: center;
`;

const CloseChevronContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 2rem;
`;

const Placeholder = styled.span`
  width: 100%;
  max-width: 65rem;
`;

const Button = styled(ButtonComponent)`
  display: inline-flex;
  max-width: 84rem;
  padding: 0 2rem 0 4rem;
  flex: 0 0 auto;
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
  overflow: hidden;
  cursor: pointer;

  &[data-visible] {
    &[data-variant=${Variant.FILTER}] {
      background-color: var(--color-blue-25);
      border-color: var(--color-blue-65);
    }

    &[data-variant=${Variant.SECONDARY}],
    &[data-variant=${Variant.TERTIARY}] {
      background-color: var(--color-blue-gray-20);
    }
  }

  &[data-variant=${Variant.PRIMARY}] {
    ${BaseIcon}[data-name='Chevron'] {
      color: var(--color-blue-gray-30);
    }

    &:hover ${BaseIcon}[data-name='Chevron'] {
      color: var(--color-blue-gray-10);
    }
  }

  &:hover {
    ${BaseIcon} {
      &[data-name='Chevron'] {
        color: var(--color-blue-gray-70);
      }
    }
  }

  &[data-visible] ${BaseIcon}[data-name='Chevron'] {
    transform: rotateZ(-90deg);
  }

  ${BaseIcon} {
    flex-shrink: 0;
    transition: transform 200ms;

    &:not([data-name='CloseLarge']):not([data-name='Info']) {
      width: 5rem;
      height: 5rem;
    }

    &[data-name='Chevron'] {
      color: var(--color-blue-gray-50);
      transform: rotate(90deg);
      width: 6rem;
      height: 6rem;
    }
  }

  &[data-disabled] {
    border-color: var(--color-blue-gray-25);
    background-color: var(--color-white);
    color: var(--color-blue-gray-35);
    cursor: default;

    ${BaseIcon} {
      &[data-name] {
        color: var(--color-blue-gray-35);
      }
    }
  }

  &[data-has-close] {
    ${Placeholder} {
      margin-right: 0;
    }
  }

  ${Counter} {
    color: var(--color-white);
    background-color: var(--color-blue-60);
  }

  ${BaseIcon}[data-left-icon] {
    margin-right: 2rem;
  }
`;

const OnCloseButton = styled(SvgIcon)`
  position: relative;
  color: var(--color-blue-gray-50);
  cursor: pointer;

  &:hover {
    color: var(--color-blue-gray-60);
  }
`;

const Popover = styled(DropdownMenu.Popover)`
  ${TooltipPopover.Head} {
    margin-bottom: 0;
    padding: 4rem 0;
    border: none;
  }

  ${Dropdown.CheckboxItem} {
    display: flex;
    align-items: center;
    gap: 2rem;

    ${Checkbox} {
      margin-right: 0;
    }
  }
`;

const Label = styled.span`
  max-width: 60rem;
  text-overflow: ellipsis;
  overflow: hidden;

  ${Strong} {
    font-weight: 600;
  }
`;

const Footer = styled.footer`
  position: -webkit-sticky; /* Safari */
  position: sticky;
  bottom: 0;
  padding: 3rem 2rem 1rem 2rem;
  border-top: 0.25rem solid var(--color-blue-gray-20);
  color: var(--color-blue-gray-60);
  font-size: var(--font-size-xs);
  text-decoration: underline;
  text-align: end;
  background-color: var(--color-white);

  &:after {
    content: '';
    position: absolute;
    display: flex;
    width: 100%;
    height: 4rem;
    background-color: var(--color-white);
  }
`;

export const SelectMenu = assignStyledNodes(_SelectMenu, {
  Footer,
  Label,
  Popover,
  Button,
  Placeholder,
});
