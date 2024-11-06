import { animated, useSpring } from '@react-spring/web';
import { useCallback, useRef } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { ControlledScroll } from '@src-v2/components/controlled-scroll';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useResizeObserver } from '@src-v2/hooks';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

type Action = (m: any) => void;

type TabProps = {
  tabs: {
    key?: string;
    label: string;
    to?: string;
    isActive?: (_: any, location: any) => boolean;
    condition?: boolean | Action;
  }[];
  selected?: string;
  onChange?: (key: string) => void;
  variant?: Variant;
};

export const Tabs = styled(
  ({ tabs, onChange, selected, variant, ...props }: StyledProps & TabProps) => {
    const { url: baseUrl } = useRouteMatch();
    const [style, api] = useSpring(() => ({ left: 0, width: 0 }));
    const mountRef = useRef(false);
    const containerRef = useRef(null);

    useResizeObserver(containerRef, applyAnimation, 'border-box');

    function applyAnimation() {
      const activeLink =
        containerRef.current?.querySelector('.active') ??
        containerRef.current?.querySelector('[data-tab-selected]');
      if (activeLink) {
        api.start({
          left: activeLink.offsetLeft,
          width: activeLink.scrollWidth,
          immediate: !mountRef.current,
        });
        mountRef.current = true;
      }
    }

    const handleTransitionEnd = useCallback(() => {
      const activeLink =
        containerRef.current?.querySelector('.active') ??
        containerRef.current?.querySelector('[data-tab-selected]');
      if (activeLink) {
        api.update({ left: activeLink.offsetLeft, width: activeLink.scrollWidth });
        api.start();
      }
    }, [containerRef.current]);

    return (
      <ScrollableTabsRow scrollGap={500} scrollOffset={10} key={tabs.length} data-variant={variant}>
        <TabsContainer {...props} ref={containerRef} onTransitionEnd={handleTransitionEnd}>
          {tabs.map(tab => (
            <TabLabel
              {...tab}
              as={tab.to ? NavLink : null}
              to={getLink(tab.to, baseUrl)}
              key={tab.key ?? tab.label}
              data-tab-selected={dataAttr(selected === (tab.key ?? tab.label))}
              data-variant={variant}
              onClick={() => onChange?.(tab.key ?? tab.label)}>
              {tab.label}
            </TabLabel>
          ))}
          <Underline style={style} />
        </TabsContainer>
      </ScrollableTabsRow>
    );
  }
)``;

const Underline = styled(animated.span)`
  position: absolute;
  bottom: 0;
  height: 0.5rem;
  border-radius: 100vmax;
  background-color: var(--color-blue-75);
`;

const ScrollableTabsRow = styled(ControlledScroll)`
  width: 100%;
  padding: 0;

  &[data-variant=${Variant.TERTIARY}] {
    ${Underline} {
      display: none;
    }
  }
`;

const TabsContainer = styled(animated.nav)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 3rem;
`;

const TabLabel = styled.label`
  font-size: var(--font-size-l);
  font-weight: 300;
  white-space: nowrap;
  color: var(--color-blue-gray-55);
  padding: 0 1rem 1rem;
  cursor: pointer;

  &:hover {
    color: var(--color-blue-gray-70);
  }

  &[data-tab-selected],
  &.active {
    color: var(--color-blue-gray-70);
    font-weight: 600;
  }

  &[data-variant=${Variant.SECONDARY}],
  &[data-variant=${Variant.TERTIARY}] {
    font-size: var(--font-size-m);
  }
`;

const getLink = (to: string, baseUrl: string) => {
  if (to) {
    return to.startsWith('/') ? to : `${baseUrl}/${to}`;
  }
  return baseUrl;
};
