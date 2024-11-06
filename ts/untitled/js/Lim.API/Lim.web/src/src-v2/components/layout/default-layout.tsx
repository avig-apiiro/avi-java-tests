import { animated, useSpring } from '@react-spring/web';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ApiiroLogoHalf from '@src-v2/assets/apiiro-logo-half.svg';
import { DefaultActiveFiltersDataProvider } from '@src-v2/components/filters/default-active-filters-data-context';
import { PageModalPresenter } from '@src-v2/components/modals/page-modal-presenter';
import { PaneContextProvider } from '@src-v2/components/panes/pane-context-provider';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { SidebarMenu } from '@src-v2/containers/sidebar/sidebar-menu';
import { TopbarMenu } from '@src-v2/containers/topbar/topbar-menu';
import { useLocalStorage } from '@src-v2/hooks';
import { customScrollbar } from '@src-v2/style/mixins';
import { dataAttr } from '@src-v2/utils/dom-utils';

export function DefaultLayout({ children, ...props }) {
  const { pathname } = useLocation();
  const mainRef = useRef();

  useLayoutEffect(() => {
    // @ts-ignore
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const [isDocked, setMenuDocked] = useLocalStorage('layout.menu.dock', false);
  const [{ width, right, transform }, api] = useSpring(() =>
    isDocked ? menuAnimation.dock : menuAnimation.open
  );

  const handleToggle = useCallback(() => {
    setMenuDocked(!isDocked);
    api.start(!isDocked ? menuAnimation.dock : menuAnimation.open);
  }, [isDocked, setMenuDocked]);

  return (
    <PaneContextProvider>
      {/* @ts-expect-error */}
      <Container style={{ '--sidebar-menu-width': width }}>
        <SideContainer>
          <SidebarMenu isDocked={isDocked} />
          <Tooltip content={isDocked ? 'Open' : 'Collapse'} placement="right" delay={[200, 0]}>
            <ToggleCollapse
              data-test-marker="sidebar-toggle"
              onClick={handleToggle}
              data-docked={dataAttr(isDocked)}>
              <ToggleIcon style={{ right, transform }} />
            </ToggleCollapse>
          </Tooltip>
        </SideContainer>
        <Header>
          <TopbarMenu />
        </Header>
        <MainContainer ref={mainRef} id="main" data-scrollbar-gutters>
          <PageModalPresenter>
            <Content {...props}>
              <DefaultActiveFiltersDataProvider>{children}</DefaultActiveFiltersDataProvider>
            </Content>
          </PageModalPresenter>
        </MainContainer>
      </Container>
    </PaneContextProvider>
  );
}

const Container = styled(animated.div)`
  display: grid;
  min-height: 100vh;
  grid-template-areas:
    'sidebar header'
    'sidebar content';
  grid-template-columns: var(--sidebar-menu-width) 1fr;
  grid-template-rows: var(--top-bar-height) 1fr;
  background-color: var(--color-blue-gray-10);
`;

const Header = styled.header`
  grid-area: header;
  position: relative;
  z-index: 0;
`;

const MainContainer = styled.main`
  grid-area: content;
  position: relative;
  z-index: 0;

  ${customScrollbar};
  transform: none;
`;

const Content = styled.div`
  position: absolute;
  width: 100%;
  min-width: 100%;
`;

export const ToggleIcon = styled(animated(ApiiroLogoHalf))`
  position: relative;
  width: 2.5rem;
  height: 5rem;
  color: var(--color-blue-gray-45);
`;

export const ToggleCollapse = styled.span`
  position: absolute;
  top: 3.25rem;
  right: 4.5rem;
  display: flex;
  width: 7rem;
  padding: 1rem;
  justify-content: center;
  background-color: transparent;
  border: 0.5rem solid var(--color-blue-gray-10);
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    background: var(--color-blue-gray-80);

    ${ToggleIcon} {
      color: var(--color-blue-gray-10);
    }
  }

  &[data-docked] {
    right: 9rem;
  }

  ${ToggleIcon} {
    width: 2rem;
    height: 4rem;
    color: var(--color-blue-gray-25);
  }
`;

const SideContainer = styled.aside`
  grid-area: sidebar;
  position: relative;
  z-index: 1;
  width: var(--sidebar-menu-width);
  color: var(--color-black);
  background-color: var(--color-white);
  border-right: 0.25rem solid var(--color-blue-gray-25);
  box-sizing: content-box;
`;

const menuAnimation = {
  open: {
    width: '63rem',
    right: '0.25rem',
    transform: 'scaleX(1)',
  },
  oldOpen: {
    width: '60rem',
    right: '0.25rem',
    transform: 'scaleX(1)',
  },
  dock: {
    width: '24rem',
    right: '-0.25rem',
    transform: 'scaleX(-1)',
  },
  oldDock: {
    width: '17rem',
    right: '-0.25rem',
    transform: 'scaleX(-1)',
  },
};
