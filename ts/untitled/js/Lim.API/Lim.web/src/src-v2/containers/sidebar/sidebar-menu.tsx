import { animated, useSprings } from '@react-spring/web';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import ApiiroLogoSvg from '@src-v2/assets/apiiro-logo.svg';
import { Collapsible } from '@src-v2/components/collapsible';
import { BaseIcon } from '@src-v2/components/icons';
import { NavigationItem } from '@src-v2/containers/sidebar/navigation-items';
import menuItems from '@src-v2/data/sidebar-menu-items';
import sidebarMenuItemsNewLayout from '@src-v2/data/sidebar-menu-items-new-layout';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { classNames } from '@src-v2/utils/style-utils';
import { SidebarNavigation } from './sidebar-navigation';

const Container = styled(animated.div)`
  position: relative;
  display: flex;
  height: 100vh;
  padding: 4rem 0 5rem;
  flex-direction: column;
  transition: right 2s;
  user-select: none;
  background-color: var(--color-blue-gray-70);

  &.is-docked {
    ${NavigationItem} > ${BaseIcon} {
      opacity: 1;
    }

    ${Collapsible.Head} {
      pointer-events: none;
      cursor: default;
    }

    ${Collapsible.Chevron} {
      opacity: 0;
    }
  }
`;

export const SidebarMenu = assignStyledNodes(
  observer(({ isDocked, className, ...props }: StyledProps<{ isDocked: boolean }>) => {
    const { application } = useInject();
    const [[logoStyle], api] = useSprings(3, index =>
      isDocked ? animation.dock[index] : animation.open[index]
    );

    useEffect(() => {
      api.start(index => (isDocked ? animation.dock[index] : animation.open[index]));
    }, [isDocked]);

    return (
      <SidebarMenu.Container {...props} className={classNames(className, { isDocked })}>
        {/*@ts-expect-error*/}
        <LogoLink to="/" style={logoStyle}>
          <ApiiroLogo />
        </LogoLink>
        <SidebarNavigation
          items={
            application.isFeatureEnabled(FeatureFlag.SettingsNewLayout)
              ? sidebarMenuItemsNewLayout
              : menuItems
          }
          isDocked={isDocked}
        />
      </SidebarMenu.Container>
    );
  }),
  { Container }
);

const LogoLink = styled(animated(NavLink))`
  position: relative;
  top: -2rem;
  display: block;
  height: 10.5rem;
  color: var(--color-blue-gray-10);
  margin: 0 auto -1rem 5rem;
`;

const ApiiroLogo = styled(ApiiroLogoSvg)`
  width: 24rem;
`;

const animation = {
  open: [
    // logo
    {
      opacity: 1,
      transform: 'translateX(0%) scale(1)',
    },
    // avatar
    {
      width: '13rem',
      height: '13rem',
      fontSize: '5rem',
    },
    // trail banner
    {
      bottom: '0rem',
      height: '10rem',
      margin: '5rem 0 -5rem',
    },
  ],
  dock: [
    // logo
    {
      opacity: 0,
      transform: 'translateX(-75%) scale(0)',
    },
    // avatar
    {
      width: '10rem',
      height: '10rem',
      fontSize: '4rem',
    },
    // trail banner
    {
      bottom: '-5rem',
      height: '0rem',
      margin: '0rem 0 0rem',
    },
  ],
};
