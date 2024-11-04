import { animated } from '@react-spring/web';
import { observer } from 'mobx-react';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Avatar } from '@src-v2/components/avatar';
import { Breadcrumbs } from '@src-v2/components/breadcrumbs';
import { IconButton } from '@src-v2/components/buttons';
import { CircleIcon } from '@src-v2/components/circle-icon';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { TrialBanner } from '@src-v2/components/marketing/trial-banner';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink, NavLink } from '@src-v2/components/typography';
import { HelpModal } from '@src-v2/containers/modals/help-modal';
import { UserMenu } from '@src-v2/containers/user-menu';
import { useInject, useToggle } from '@src-v2/hooks';
import { BreadcrumbProps } from '@src-v2/hooks/use-breadcrumbs';
import { StubAny } from '@src-v2/types/stub-any';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const TopbarMenu = styled(
  observer(({ ...props }) => {
    const { session, application, subscription } = useInject();
    const [showHelpModal, toggleHelpModal] = useToggle();
    const location = useLocation();

    const handleBreadcrumbClick = useCallback(
      ({
        breadcrumbs,
        index,
        event,
      }: {
        breadcrumbs: BreadcrumbProps[];
        index: number;
        event: React.MouseEvent;
      }) => {
        // Invoke pop handlers for breadcrumbs that we're popping, from right to left
        breadcrumbs
          .slice(index + 1)
          .reverse()
          .forEach(breadcrumb => breadcrumb.onPop?.(event));

        const targetBreadcrumb = breadcrumbs[index];

        if (targetBreadcrumb.to === '#') {
          event.preventDefault();
          event.stopPropagation();
        } else if (targetBreadcrumb.forceRefresh && location.pathname === targetBreadcrumb.to) {
          window.location.reload();
        }

        application.setBreadcrumbs(application.breadcrumbs.slice(0, index + 1));
      },
      [application.breadcrumbs]
    );

    const breadcrumbs = application.breadcrumbs as BreadcrumbProps[];

    return (
      <>
        <div {...props}>
          <Breadcrumbs>
            {breadcrumbs
              .filter(Boolean)
              .map(({ label, icon, isPinned, to, forceRefresh, onPop, ...breadcrumb }, index) => (
                <NavLink
                  data-test-marker="breadcrumbs"
                  key={index}
                  {...breadcrumb}
                  to={typeof to === 'string' ? to : to[0]}
                  onClick={event => handleBreadcrumbClick({ breadcrumbs, index, event })}>
                  {index === 0 && <SvgIcon name={icon} />}
                  {label}
                </NavLink>
              ))}
          </Breadcrumbs>
          <ButtonsContainer>
            {subscription.isTrial && <TrialBanner />}
            <DropdownMenu
              icon="Help"
              onClick={stopPropagation}
              onItemClick={stopPropagation}
              size={Size.XLARGE}>
              {session.data.jiraServiceDeskEnabled && (
                <HelpMenuItem onClick={toggleHelpModal}>
                  <IconButton name="Help" />
                  Help center
                </HelpMenuItem>
              )}
              <HelpMenuItem>
                <IconButton name="Ticketing" />
                <ExternalLink href="https://docs.apiiro.com">Documentation</ExternalLink>
              </HelpMenuItem>
            </DropdownMenu>
            <CircleIcon
              id="beamerButton"
              icon="Announce"
              variant={Variant.TERTIARY}
              size={Size.XLARGE}
            />
            <CustomPopover
              trigger="click"
              placement="bottom"
              maxHeight="100%"
              content={({ reference: avatarRef }: { reference: StubAny }) => (
                <UserMenu parentRef={{ current: avatarRef }} />
              )}>
              <AvatarButton
                username={session.username}
                data-value={session.username}
                data-test-marker="userAvatar"
              />
            </CustomPopover>
          </ButtonsContainer>
        </div>
        {showHelpModal && <HelpModal onClose={toggleHelpModal} />}
      </>
    );
  })
)`
  width: 100%;
  height: var(--top-bar-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10rem;
  background-color: var(--color-white);
  border-bottom: 0.25rem solid var(--color-blue-gray-25);
  gap: 2rem;
  z-index: 999999;

  ${IconButton} {
    width: 9rem;
    height: 9rem;
    padding: 1rem;
    color: var(--color-blue-gray-60);
  }

  ${Breadcrumbs} {
    ${NavLink}:first-of-type {
      display: flex;
      align-items: center;
      color: var(--color-blue-gray-65);
      font-weight: 600;
      gap: 1rem;
    }

    ${BaseIcon} {
      color: var(--color-blue-gray-65);
    }
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const CustomPopover = styled(Popover)`
  ${(Popover as any).Content} {
    width: 52.5rem;
    min-width: 52.5rem;
    max-width: 52.5rem;
  }
`;

const AvatarButton = styled(animated(Avatar))`
  width: 8rem;
  height: 8rem;
  cursor: pointer;
  font-size: var(--font-size-s);
`;

const HelpMenuItem = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--font-size-s);
  padding: 1rem 2rem;
  border-radius: 2rem;
  gap: 2rem;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-20);
  }

  ${ExternalLink} {
    color: var(--color-blue-gray-70);
    text-decoration: unset;
  }
`;
