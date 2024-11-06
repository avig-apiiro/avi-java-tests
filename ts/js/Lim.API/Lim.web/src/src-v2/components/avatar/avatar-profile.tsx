import { ReactNode } from 'react';
import styled from 'styled-components';
import { Avatar, AvatarProps } from '@src-v2/components/avatar/avatar';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { DistanceTime } from '@src-v2/components/time';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1, Heading4 } from '@src-v2/components/typography';

interface AvatarProfileProps extends AvatarProps {
  lastActivity?: Date | number;
  activeSince?: Date | number;
  showViewProfile?: boolean;
  children?: ReactNode;
}

export const AvatarProfile = ({
  identityKey,
  username,
  lastActivity = null,
  activeSince = null,
  showViewProfile = true,
  children,
  ...props
}: AvatarProfileProps) => {
  return (
    <AvatarProfilePopover
      placement="top-start"
      content={
        <>
          <Popover.Head>
            <AvatarHeadingContainer>
              <Avatar
                {...props}
                username={username}
                identityKey={identityKey}
                size={Size.XXLARGE}
              />
              <Heading4>{username}</Heading4>
            </AvatarHeadingContainer>
            {showViewProfile && (
              <TextButton
                to={`/users/contributors/${identityKey}`}
                showArrow
                size={Size.XSMALL}
                mode={LinkMode.INTERNAL}>
                View profile
              </TextButton>
            )}
          </Popover.Head>
          <AvatarHeadingContent>
            <Caption1>
              Last activity <DistanceTime date={lastActivity as Date | number} addSuffix strict />{' '}
              &middot; Active since{' '}
              <DistanceTime date={activeSince as Date | number} addSuffix strict />
            </Caption1>
          </AvatarHeadingContent>
        </>
      }
      noArrow>
      <AvatarChildrenContainer>
        <Avatar {...props} username={username} identityKey={identityKey} />
        {children}
      </AvatarChildrenContainer>
    </AvatarProfilePopover>
  );
};

const AvatarChildrenContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;
`;

const AvatarHeadingContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  margin: 2rem 2rem 0 2rem;
`;

const AvatarHeadingContent = styled.div`
  margin: 4rem 0 1rem 2rem;

  ${Caption1} {
    font-weight: 300;
  }
`;
const AvatarProfilePopover = styled(Popover)`
  ${Popover.Head} {
    padding: 2rem 0;
  }

  ${Popover.Content} {
    min-width: 90rem;
    max-width: 100rem;
  }
`;
