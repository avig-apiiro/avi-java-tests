import { forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { Circle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps } from '@src-v2/types/styled';
import { extractInitials } from '@src-v2/utils/string-utils';
import { hashString } from '@src-v2/utils/style-utils';

const avatarColors: string[] = [
  'var(--color-purple-45)',
  'var(--color-green-65)',
  'var(--color-pink-45)',
  `var(--color-orange-45)`,
  `var(--color-red-45)`,
  `var(--color-yellow-45)`,
  `var(--color-blue-60)`,
  `var(--color-blue-65)`,
  `var(--color-blue-70)`,
  `var(--color-pink-50)`,
  `var(--color-red-70)`,
  `var(--color-purple-60)`,
];

export interface AvatarProps {
  username?: string;
  identityKey?: string;
  size?: Exclude<Size, Size.XXSMALL>;
  active?: boolean;
}

export const Avatar = styled(
  forwardRef<HTMLSpanElement, StyledProps<AvatarProps>>(
    ({ username, identityKey, size, active, style, ...props }, ref) => {
      const { style: avatarStyle } = useUserAvatar(username ?? identityKey);

      const activityIndicatorSize = useMemo(
        () =>
          [Size.XLARGE, Size.LARGE, Size.XXLARGE, Size.XXXLARGE].includes(size)
            ? Size.SMALL
            : Size.XSMALL,
        [size]
      );

      // User display name is not supported in SAML authentication at the moment
      return (
        <Circle ref={ref} style={{ ...style, ...avatarStyle }} {...props} size={size}>
          {username && extractInitials(username)}
          {typeof active === 'boolean' && (
            <ActivityIndicator active={active} size={activityIndicatorSize} />
          )}
        </Circle>
      );
    }
  )
)`
  position: relative;
  color: var(--color-white);
  font-weight: 600;
  text-transform: uppercase;
  background-size: contain;

  > ${ActivityIndicator}[data-size=${Size.SMALL}] {
    position: absolute;
    bottom: 0;
    right: 0.25rem;
  }

  > ${ActivityIndicator}[data-size=${Size.XSMALL}] {
    position: absolute;
    bottom: 0;
    right: 0.25rem;
  }
}
`;

const useUserAvatar = seed => {
  const style = useMemo(
    () => ({
      backgroundColor: avatarColors[Math.abs(hashString(seed)) % avatarColors.length],
    }),
    [seed]
  );
  return { style };
};
