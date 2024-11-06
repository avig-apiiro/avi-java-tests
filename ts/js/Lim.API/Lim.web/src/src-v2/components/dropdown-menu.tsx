import { ReactNode, forwardRef } from 'react';
import styled from 'styled-components';
import { CircleIcon } from '@src-v2/components/circle-icon';
import { BaseIcon } from '@src-v2/components/icons';
import {
  Popover as PlainPopover,
  hideOnItemClickPlugin,
} from '@src-v2/components/tooltips/popover';
import { TippyAttributes } from '@src-v2/components/tooltips/tippy';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useGroupProperties, useToggle } from '@src-v2/hooks';
import { useCombineCallbacks } from '@src-v2/hooks/use-combine-callbacks';
import { assignStyledNodes } from '@src-v2/types/styled';
import { Dropdown } from './dropdown';

type DropdownMenuProps = {
  icon?: string;
  disabled?: boolean;
  rows?: number;
  label?: ReactNode;
  onClick?: (event) => void;
  onItemClick?: (event) => void;
  onShow?: () => void;
  onHide?: () => void;
  size?: Size;
  variant?: Variant;
  children: ReactNode;
  placement?: string;
  noArrow?: boolean;
  maxHeight?: string;
  plugins?: {
    name: string;
    defaultValue: boolean;
    fn: (instance: any) => {
      onCreate(): void;
    };
  }[];
};

const _DropdownMenu = styled(
  forwardRef<HTMLImageElement, DropdownMenuProps>(
    (
      {
        icon = 'Dots',
        disabled,
        rows = 15,
        label,
        onClick,
        onItemClick,
        onShow,
        onHide,
        noArrow = false,
        variant = Variant.TERTIARY,
        size = Size.LARGE,
        children,
        plugins,
        maxHeight,
        ...props
      },
      ref
    ) => {
      const [popoverProps, circleIconProps] = useGroupProperties(props, TippyAttributes);
      const [visible, toggleVisibility] = useToggle();

      return (
        <DropdownMenu.Popover
          {...popoverProps}
          rows={rows}
          maxHeight={maxHeight}
          content={children}
          onClick={onItemClick}
          onHide={useCombineCallbacks(toggleVisibility, onHide)}
          onShow={useCombineCallbacks(toggleVisibility, onShow)}
          customPlugins={plugins}
          disabled={disabled}
          noArrow={noArrow}>
          <IconButtonWrapper type="button" disabled={disabled} onClick={onClick}>
            <CircleIcon
              {...circleIconProps}
              ref={ref}
              size={size}
              icon={icon}
              active={visible}
              variant={variant}
              disabled={disabled}
            />
            {label}
          </IconButtonWrapper>
        </DropdownMenu.Popover>
      );
    }
  )
)``;

const IconButtonWrapper = styled.button`
  display: flex;
  width: fit-content;
  gap: 2rem;
  align-items: center;

  &:not(:disabled) {
    cursor: pointer;
  }
`;

const Popover = styled(({ customPlugins, ...props }) => (
  <PlainPopover
    noDelay
    contentAs="ul"
    trigger="click"
    placement="bottom-start"
    plugins={[hideOnItemClickPlugin, ...(customPlugins ?? [])]}
    {...props}
  />
))`
  user-select: none;

  ${PlainPopover.Content} {
    min-width: 40rem;
    max-width: 130rem;
    padding: 3rem;
  }

  ${Dropdown.Item} {
    display: flex;
    align-items: center;
    font-size: var(--font-size-s);
    gap: 2rem;

    &:not(:last-of-type) {
      margin-bottom: 1rem;
    }

    > ${BaseIcon} {
      color: var(--color-blue-gray-50);
    }

    &[data-disabled] > ${BaseIcon} {
      color: var(--color-blue-gray-35);
    }

    &:hover > ${BaseIcon} {
      color: var(--color-blue-gray-60);
    }
  }
`;

export const DropdownMenu = assignStyledNodes(_DropdownMenu, {
  Popover,
});
