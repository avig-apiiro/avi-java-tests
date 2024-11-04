import { animated, useSpring } from '@react-spring/web';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { classNames } from '@src-v2/utils/style-utils';

type SplitScreenPropsType = {
  asideOpen: boolean;
  defaultWidth?: string;
};

const _SplitScreen = styled(
  ({
    asideOpen,
    defaultWidth = '110rem',
    className,
    style,
    ...props
  }: StyledProps & SplitScreenPropsType) => {
    const [{ asideWidth }, api] = useSpring(() => ({
      asideWidth: asideOpen ? defaultWidth : '0rem',
    }));
    useEffect(() => {
      api.start({ asideWidth: asideOpen ? defaultWidth : '0rem' });
    }, [asideOpen]);
    return (
      <animated.div
        className={classNames(className, { asideOpen })}
        // @ts-ignore
        style={{ ...style, '--split-screen-aside-width': asideWidth }}
        {...props}
      />
    );
  }
)`
  display: grid;
  grid-template-areas: 'main aside';
  grid-template-columns: 1fr var(--split-screen-aside-width, 110rem);
  grid-template-rows: 1fr;
  overflow: hidden;
  flex-grow: 1;
`;

const Main = styled.main`
  grid-area: main;
  position: relative;
`;

const Aside = styled(({ children, ...props }) => (
  <aside {...props}>
    <Pane id="split-aside">
      <>{children}</>
    </Pane>
  </aside>
))`
  grid-area: aside;
  position: relative;

  #split-aside {
    height: 0;
    overflow-y: scroll;
  }
`;

const AsidePortal = ({ children }) =>
  ReactDOM.createPortal(children, document.getElementById('split-aside'));

const Pane = styled.div`
  position: relative;
  width: 100%;
  min-height: 100%;
  background-color: var(--color-white);
  box-shadow: 0 0.5rem 5rem var(--default-shadow-color);
  z-index: 1;
`;

export const SplitScreen = assignStyledNodes(_SplitScreen, {
  Main,
  Aside,
  AsidePortal,
});
