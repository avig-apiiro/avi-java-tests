import { observer } from 'mobx-react';
import { MutableRefObject, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { SidebarUserMenu } from '@src-v2/components/user-profile';
import { useDetectClickOutside, useInject } from '@src-v2/hooks';
import { makeUrl } from '@src-v2/utils/history-utils';
import { addInterpunctSeparator } from '@src-v2/utils/string-utils';

type UserMenuPropsType = {
  parentRef: MutableRefObject<HTMLElement>;
  onClickOutside?: () => void;
};

export const UserMenu = observer(
  ({ parentRef, onClickOutside = () => null }: UserMenuPropsType) => {
    const { application, session, subscription, toaster } = useInject();
    const ref = useRef();

    useDetectClickOutside([ref, parentRef], onClickOutside);

    const handleUpgrade = useCallback(async () => {
      try {
        await application.applyUpdates();
      } catch (error) {
        toaster.error('Failed to apply version update');
        console.error(error);
      }
    }, [application, toaster]);

    const stripSubtitle = addInterpunctSeparator(
      ...(session.data.isSaas ? [session.data.environmentName] : []).concat(
        session.roles.includes('Admin') ? 'Admin' : session.roles
      )
    );

    return (
      <Container ref={ref}>
        <SidebarUserMenu as={HeaderNew} username={session.username} subtitle={stripSubtitle} />
        <OptionsContainer>
          <SmallLabel>Account</SmallLabel>
          {subscription.canManageAccount && (
            <Option as="a" href="/accounts">
              <SvgIcon name="Switch" />
              <OptionLabel>Switch Environment</OptionLabel>
            </Option>
          )}
          {session.data.provisionedByAccountService && (
            <Option
              as="a"
              href={makeUrl('/accounts/environments', { invite: session.data.environmentId })}>
              <SvgIcon name="Users" />
              <OptionLabel>Invite Members</OptionLabel>
            </Option>
          )}
          <Option onClick={() => session.logout()}>
            <SvgIcon name="Logout" />
            <OptionLabel>Log out</OptionLabel>
          </Option>
        </OptionsContainer>
        <OptionsContainer>
          <SmallLabel>Apiiro {application.version}</SmallLabel>
          {(!session.data.provisionedByAccountService || session.data.consoleUser.isInternal) &&
            application.canUpgrade && (
              <Option>
                <OptionLabel onClick={handleUpgrade}>Apply latest updates</OptionLabel>
              </Option>
            )}
          <Option as="a" href="/notice" target="_blank">
            <OptionLabel>Notice File</OptionLabel>
          </Option>
        </OptionsContainer>
      </Container>
    );
  }
);

const Container = styled.div`
  font-weight: 350;
`;

const SmallLabel = styled.span`
  font-size: var(--font-size-xs);
  font-weight: 300;
  color: var(--color-blue-gray-50);
  padding: 0 2rem;
`;

const Header = styled.header`
  padding-bottom: 4rem;
  margin-bottom: 4rem;
  border-bottom: 0.25rem solid var(--color-blue-gray-30);
`;

const HeaderNew = styled(Header)`
  margin-bottom: 0rem;
  border-bottom: 0.25rem solid var(--color-blue-gray-25);
`;

const Option = styled.span`
  display: flex;
  align-items: center;
  gap: 2rem;
  cursor: pointer;
  border-radius: 2rem;
  padding: 1rem 2rem;

  &:hover {
    color: var(--color-blue-gray-80);
    background-color: var(--color-blue-gray-20);
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 3rem 0;
  border-bottom: 0.25rem solid var(--color-blue-gray-25);
  gap: 1rem;

  &:last-of-type {
    padding-bottom: 0;
    border-bottom: none;
  }

  ${BaseIcon} {
    width: 5rem;
    height: 5rem;
  }
`;

const OptionLabel = styled.span`
  font-size: var(--font-size-s);

  &:hover {
    color: var(--color-blue-gray-80);
  }
`;
