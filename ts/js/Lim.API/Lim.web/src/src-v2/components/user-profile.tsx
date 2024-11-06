import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { Avatar } from '@src-v2/components/avatar';
import { Size } from '@src-v2/components/types/enums/size';
import { useInject } from '@src-v2/hooks';

export const SidebarUserMenu = ({
  subtitle,
  ...props
}: {
  subtitle: string;
  username: string;
  as?: FC<{ children?: ReactNode }>;
}) => {
  const { session } = useInject();
  return (
    <Container {...props}>
      <Avatar username={session.username} size={Size.LARGE} />
      <UserDetails>
        <Username>{session.username}</Username>
        <Subtitle>{subtitle}</Subtitle>
      </UserDetails>
    </Container>
  );
};

export const UserStripLegacy = ({
  username,
  subtitle,
  children,
  ...props
}: {
  username: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <ContainerLegacy {...props}>
    <Avatar username={username} size={Size.LARGE} />
    <UserDetailsLegacy>
      <UsernameLegacy>{username}</UsernameLegacy>
      <SubtitleLegacy>{subtitle}</SubtitleLegacy>
    </UserDetailsLegacy>
    {children}
  </ContainerLegacy>
);

const ContainerLegacy = styled.div`
  display: flex;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
`;

const UserDetailsLegacy = styled.div`
  width: fit-content;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UsernameLegacy = styled.span`
  font-size: var(--font-size-xl);
  font-weight: 500;
`;

const Username = styled.span`
  font-size: var(--font-size-s);
  font-weight: 300;
`;

const SubtitleLegacy = styled.p`
  color: var(--color-blue-gray-70);
  font-size: var(--font-size-s);
  font-weight: 400;
`;

const Subtitle = styled.span`
  font-size: var(--font-size-xs);
  font-weight: 300;
  color: var(--color-blue-gray-50);
`;
