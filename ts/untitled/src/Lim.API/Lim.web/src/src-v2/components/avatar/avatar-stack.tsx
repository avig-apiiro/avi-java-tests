import { forwardRef } from 'react';
import styled from 'styled-components';
import { Avatar } from '@src-v2/components/avatar/avatar';
import { Circle, CircleGroup } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps } from '@src-v2/types/styled';

export interface Identity {
  identityKey?: string;
  avatarUrl?: string;
  username?: string;
  email?: string;
}

export const AvatarStack = styled(
  forwardRef<
    HTMLDivElement,
    StyledProps<{
      identities: Identity[];
      maxSize?: number;
      size?: Size;
      onClick?: (event) => void;
    }>
  >(({ identities, maxSize = 3, size = Size.LARGE, children, ...props }, ref) => {
    const displayedIdentities = maxSize > 0 ? identities.slice(0, maxSize) : identities;

    return (
      <CircleGroup size={size} ref={ref} {...props}>
        {identities?.length ? (
          <>
            {displayedIdentities.map((identity, index) => (
              <Avatar
                {...props}
                username={identity.username}
                identityKey={identity.identityKey}
                key={identity.identityKey}
                zIndex={identities.length - index}
              />
            ))}
          </>
        ) : (
          <EmptyCircle>–</EmptyCircle>
        )}
        {children}
      </CircleGroup>
    );
  })
)`
  ${Avatar} {
    border: 0.4rem solid var(--color-white);
    position: inherit;
  }
`;

const EmptyCircle = styled(Circle)`
  background-color: var(--color-blue-30);
  border: 0.4rem solid var(--color-white);
`;
