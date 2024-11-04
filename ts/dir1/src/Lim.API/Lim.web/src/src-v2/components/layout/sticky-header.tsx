import { SpringValue, animated, useSpring } from '@react-spring/web';
import _ from 'lodash';
import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Gutters } from '@src-v2/components/layout/containers';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { EllipsisText, Heading1, Paragraph, SubHeading3 } from '@src-v2/components/typography';
import { useResizeObserver } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { fromRem, toRem } from '@src-v2/utils/style-utils';

type NavLinksMenuStyleType = {
  position?: string;
  top?: SpringValue<string>;
  boxShadow?: SpringValue<string>;
  marginBottom?: SpringValue<string>;
};

type StickyHeaderPropsType = {
  title?: ReactNode;
  isStaticActions?: boolean;
  navigation?: { key?: string; to: string; label: string }[];
  minimized?: boolean;
  style?: any;
  navigationControls?: any;
  children?: ReactNode;
  description?: string | null;
};

export function StickyHeader({
  title = null,
  description = null,
  isStaticActions = false,
  navigation = null,
  minimized = false,
  style = {},
  navigationControls = {},
  children = null,
  ...props
}: StickyHeaderPropsType) {
  const ref = useRef();
  const navRef = useRef();
  const { stickyTop, padding, actionsTransform, boxShadow, navShadow, navMargin } =
    useStickyTransition(ref, navRef, {
      stickyHeight: '21rem',
      minimized,
    });

  const navLinksMenuStyle = {
    top: '0',
    boxShadow: navShadow,
    ...(minimized && { position: 'relative', top: navMargin, marginBottom: navMargin }),
  } as NavLinksMenuStyleType & CSSProperties;

  return (
    <>
      <StickyContainer
        ref={ref}
        {...props}
        as="header"
        style={{
          ...style,
          ...(minimized && { position: 'relative', marginBottom: stickyTop }),
          boxShadow,
          top: stickyTop,
        }}>
        {children && (
          <StickyHeader.Actions
            style={{ height: 0, transform: actionsTransform }}
            data-static={dataAttr(isStaticActions)}>
            {children}
          </StickyHeader.Actions>
        )}
        {title && (
          <StickyHeader.Content style={{ padding }}>
            <Heading1>
              <EllipsisText>{title}</EllipsisText>
            </Heading1>
          </StickyHeader.Content>
        )}
      </StickyContainer>

      {Boolean(description) && (
        <CustomGutters>
          <SubHeading3>{description}</SubHeading3>
        </CustomGutters>
      )}

      {Boolean(navigation) && (
        <CustomGutters style={navLinksMenuStyle}>
          <Tabs tabs={navigation} {...navigationControls} />
        </CustomGutters>
      )}
    </>
  );
}

const StickyContainer = styled(Gutters)`
  position: sticky;
  z-index: 10000;
  background-color: var(--color-blue-gray-10);

  > ${Paragraph} {
    line-height: 4rem;
  }
`;

const CustomGutters = styled(Gutters)`
  position: sticky;
  z-index: 9999;
  padding-top: 2rem;
  background-color: var(--color-blue-gray-10);
  margin-top: 2rem;
  clip-path: inset(0 0 -2rem);
`;

StickyHeader.Content = styled(animated.div)`
  display: grid;
  padding-top: 3rem;
  grid-template-areas: 'title actions';
  grid-template-columns: 1fr auto;
  grid-column-gap: 3rem;

  > ${Heading1} {
    max-width: 80%;
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    gap: 2rem;
  }
`;

StickyHeader.Actions = styled(animated.div)`
  grid-area: actions;
  height: 15rem;
  display: flex;
  position: absolute;
  top: 9rem;
  right: var(--max-resolution-spacing);
  align-items: center;
  gap: 2rem;
  z-index: 10000;

  &[data-static] {
    position: relative;
    inset: 0;
    justify-content: flex-end;
    padding-top: 9rem;
  }
`;

function useStickyTransition(
  headerRef: StubAny,
  navigationRef: StubAny,
  {
    stickyHeight,
    minimized = false,
    parentElement = document.getElementById('main'),
  }: {
    stickyHeight: string | number;
    minimized: boolean;
    parentElement?: StubAny;
  }
) {
  const [{ stuck, navStuck }, setSticky] = useState({ stuck: false, navStuck: false });
  const [styles] = useSpring(() => animations.default);
  const { height, paddingTop } = useStyleObserver(headerRef);
  const mountRef = useRef(false);

  const handleScroll = useCallback(() => {
    const desiredHeight = fromRem(stickyHeight, false);
    setSticky({
      stuck: isStuck(fromRem(height, false), desiredHeight, parentElement),
      navStuck:
        Boolean(navigationRef.current) &&
        isStuck(navigationRef.current.offsetTop, desiredHeight, parentElement),
    });
  }, [height, stickyHeight, parentElement, setSticky]);

  useEffect(() => {
    setSticky(
      minimized
        ? { stuck: true, navStuck: Boolean(navigationRef.current) }
        : { stuck: false, navStuck: false }
    );
  }, [minimized]);

  useEffect(() => {
    if (minimized) {
      setSticky({ stuck: true, navStuck: Boolean(navigationRef.current) });
    } else {
      setSticky({ stuck: false, navStuck: false });
      const handler = _.throttle(handleScroll, 150);
      parentElement?.addEventListener('scroll', handler);
      return () => parentElement?.removeEventListener('scroll', handler);
    }
  }, [minimized, parentElement, handleScroll, setSticky]);

  useEffect(() => {
    if (!height || !paddingTop) {
      return;
    }

    mountRef.current = true;
  }, [minimized, height, paddingTop, stickyHeight, stuck, navStuck]);

  return { height, stickyHeight, ...styles };
}

function useStyleObserver(ref: StubAny): Record<string, string> {
  const [style, setStyle] = useState({});
  useResizeObserver(
    ref,
    useCallback(
      ({ target }: { target: StubAny }) =>
        setStyle({
          height: toRem(target.offsetHeight),
          paddingTop: toRem(getComputedStyle(target).paddingTop),
        }),
      []
    )
  );
  return style;
}

function isStuck(
  height: string | number,
  desiredHeight: string | number,
  { scrollTop }: { scrollTop: StubAny }
) {
  const threshold = Math.max(parseFloat(String(height)) - parseFloat(String(desiredHeight)), 0);
  return scrollTop > 0 && (threshold <= scrollTop || threshold > desiredHeight);
}

const animations = {
  default: {
    stickyTop: '0rem',
    padding: '6rem 0 0rem',
    titleHeight: '15rem',
    fontSize: '9rem',
    actionsTransform: 'translateY(0rem)',
    boxShadow: '0 0rem 0rem 0 var(--new-default-shadow-color)',
    navShadow: '0 0rem 0rem 0 var(--new-default-shadow-color)',
    navMargin: '0rem',
  },
  sticky: {
    padding: '6rem 0 5rem',
    titleHeight: '10rem',
    fontSize: '8rem',
    boxShadow: '0 0.5rem 3rem 0 var(--new-default-shadow-color)',
  },
};
