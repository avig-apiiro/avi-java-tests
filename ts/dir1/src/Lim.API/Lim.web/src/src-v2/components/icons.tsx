import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import styled from 'styled-components';
import { Size } from '@src-v2/components/types/enums/size';
import { getLanguageIconUrl, getSvgIcon, getVendorIconUrl } from '@src-v2/data/icons';
import { StyledProps } from '@src-v2/types/styled';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const BaseIcon = styled.img<{
  size?: Size;
}>`
  --icon-size: 6rem;
  width: var(--icon-size);
  height: var(--icon-size);
  flex-shrink: 0;
  color: var(--default-icon-color, currentColor);
  transform-origin: center center;
  cursor: ${props => (props.onClick && props.onClick !== stopPropagation ? 'pointer' : 'inherit')};

  &[data-size=${Size.XXXSMALL}] {
    --icon-size: 3rem;
  }

  &[data-size=${Size.XXSMALL}] {
    --icon-size: 4rem;
  }

  &[data-size=${Size.XSMALL}] {
    --icon-size: 5rem;
  }

  &[data-size=${Size.SMALL}] {
    --icon-size: 6rem;
  }

  &[data-size=${Size.MEDIUM}] {
    --icon-size: 7rem;
  }

  &[data-size=${Size.LARGE}] {
    --icon-size: 7rem;
  }

  &[data-size=${Size.XLARGE}] {
    --icon-size: 7rem;
  }

  &[data-size=${Size.XXLARGE}] {
    --icon-size: 8rem;
  }
`;

export const SvgIcon = forwardRef<
  HTMLImageElement,
  HTMLAttributes<HTMLImageElement> & StyledProps<{ name: string; size?: Size }>
>(({ name, size = Size.SMALL, ...props }, ref) => (
  <BaseIcon
    as={getSvgIcon(name) ?? 'span'}
    {...props}
    ref={ref}
    data-name={name}
    data-size={size}
  />
));

// To be removed and fix in LIM-16199
const platformIcon = {
  Pypi: 'Pip',
};

export const VendorIcon = forwardRef<
  HTMLImageElement,
  HTMLAttributes<HTMLImageElement> &
    StyledProps<{ name: string; platform?: boolean; size?: Size; fallback?: ReactNode }>
>(({ name, platform, size = Size.SMALL, fallback, ...props }, ref) => {
  const iconSrc = getVendorIconUrl(platform ? platformIcon[name] ?? name : name);

  return iconSrc ? (
    <BaseIcon {...props} ref={ref} src={iconSrc} alt={name} data-size={size} />
  ) : fallback ? (
    <FallbackWrapper ref={ref}>{fallback}</FallbackWrapper>
  ) : null;
});

const FallbackWrapper = styled.div`
  width: fit-content;

  ${BaseIcon} {
    color: var(--color-blue-gray-50);
  }
`;

export const ConditionalProviderIcon = forwardRef<
  HTMLImageElement,
  HTMLAttributes<HTMLImageElement> &
    StyledProps<{ name: string; size?: Size; platform?: boolean; fallback?: ReactNode }>
>(({ fallback = <SvgIcon name="Api" size={Size.SMALL} />, ...props }, ref) => {
  return <VendorIcon ref={ref} {...props} fallback={fallback} />;
});

export const ConditionalPackageIcon = forwardRef<
  HTMLImageElement,
  HTMLAttributes<HTMLImageElement> &
    StyledProps<{ name: string; size?: Size; fallbackName?: string; fallback?: ReactNode }>
>(({ fallback = <SvgIcon name="Package" />, ...props }, ref) => {
  return <VendorIcon ref={ref} {...props} fallback={fallback} />;
});

export const LanguageIcon = forwardRef<
  HTMLImageElement,
  HTMLAttributes<HTMLImageElement> & StyledProps<{ name: string; size?: Size }>
>(({ name, size = Size.SMALL, ...props }, ref) => (
  <BaseIcon {...props} ref={ref} src={getLanguageIconUrl(name)} alt={name} data-size={size} />
));

export const StatusIcon = styled(SvgIcon)`
  fill: var(--color-white);
`;
