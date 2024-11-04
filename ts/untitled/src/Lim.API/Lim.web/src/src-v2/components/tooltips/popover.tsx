import { animated } from '@react-spring/web';
import { TippyProps } from '@tippyjs/react';
import _ from 'lodash';
import { ReactNode, forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { Placement } from 'ts/untitled/src/Lim.API/Lim.web/src/src-v2/components/tooltips/tippy.js';
import { Tippy, TippyAttributes } from '@src-v2/components/tooltips/tippy';
import { useGroupProperties } from '@src-v2/hooks';
import { customScrollbar } from '@src-v2/style/mixins';
import { assignStyledNodes } from '@src-v2/types/styled';
import { useAnimationPlugin } from './animationPlugin';

interface PlainPopoverProps extends Omit<TippyProps, 'content' | 'placement'> {
  className?: string;
  style?: Record<string, string>;
  noArrow?: boolean;
  noDelay?: boolean;
  contentAs?: ReactNode;
  plugins?: any[];
  content: ReactNode | Function;
  placement?: Placement | string;
  maxHeight?: string;
}

function PlainPopover(
  {
    content,
    contentAs,
    appendTo = document.body,
    interactive = true,
    className,
    style,
    noArrow,
    placement,
    plugins = [],
    maxHeight,
    noDelay = false,
    disabled = false,
    ...props
  }: PlainPopoverProps,
  ref
) {
  const [tippyProps, contentProps] = useGroupProperties(props, TippyAttributes.concat('children'));
  const { opacity, animationPlugin } = useAnimationPlugin();

  const popperOptions = useMemo(
    () =>
      _.defaults(props.popperOptions, {
        modifiers: [
          { name: 'offset', options: { offset: [0, noArrow ? 4 : 8] } },
          { name: 'arrow', options: { padding: 8 } },
        ],
      }),
    [props.popperOptions]
  );

  return (
    <Tippy
      {...tippyProps}
      placement={placement}
      ref={ref}
      interactive={interactive}
      delay={noDelay ? [0, null] : [300, null]}
      appendTo={appendTo}
      popperOptions={popperOptions}
      plugins={useMemo(() => plugins.concat(animationPlugin), [plugins, animationPlugin])}
      animation
      disabled={disabled}
      render={(attrs, _, instance) => (
        <Tippy.Container
          {...attrs}
          data-floating-element
          className={className}
          style={{
            ...style,
            opacity,
          }}
          as={animated.div}>
          <Content as={contentAs} {...contentProps} style={{ maxHeight: maxHeight ?? '65rem' }}>
            {typeof content === 'function' ? content(instance) : content}
          </Content>
          {!noArrow && <Arrow data-popper-arrow />}
        </Tippy.Container>
      )}
    />
  );
}

const _Popover = styled(forwardRef(PlainPopover))`
  max-width: 35vw;
  color: var(--color-blue-gray-70);
  background-color: var(--color-white);
  box-shadow: var(--elevation-6);
  border-radius: 3rem;
  user-select: text;
  z-index: 100;
`;

const Content = styled.div`
  ${customScrollbar};

  &::-webkit-scrollbar-thumb {
    visibility: visible;
  }

  min-width: 100rem;
  max-width: 200rem;
  padding: 3rem;
  overflow-y: scroll;
  overflow-x: hidden;

  ${customScrollbar};

  &::-webkit-scrollbar-track {
    margin: 1rem 0;
  }
`;

const Head = styled.header`
  position: sticky;
  top: -2rem;
  display: flex;
  font-size: var(--font-size-l);
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.25rem solid var(--color-blue-gray-20);
  background-color: var(--color-white);
  z-index: 10;
  gap: 2rem;

  &:first-child {
    top: 0;
    margin-top: -3rem;
    border-radius: 3rem 3rem 0 0;

    &:not(:only-child) {
      transform: translateY(-3rem);
    }
  }
`;

const Arrow = styled(Tippy.Arrow)`
  color: var(--color-white);

  &:after {
    content: none;
  }

  &:before {
    content: '';
    position: absolute;
    z-index: 1;
    width: 2.5rem;
    height: 2.5rem;
    box-shadow: var(--elevation-6);
    background-color: var(--color-white);
    clip-path: polygon(-100% -100%, -100% 200%, 200% 200%);
  }

  [data-placement^='top'] > &:before {
    transform: translate(25%, 45%) rotate(315deg);
    bottom: 0;
  }

  [data-placement^='bottom'] > &:before {
    transform: translate(25%, -45%) rotate(135deg);
  }

  [data-placement^='left'] > &:before {
    transform: translate(45%, 25%) rotate(225deg);
    right: 0;
  }

  [data-placement^='right'] > &:before {
    transform: translate(-45%, 25%) rotate(45deg);
  }
`;

export const hideOnItemClickPlugin = {
  name: 'hideOnItemClick',
  defaultValue: true,
  fn: instance => ({
    onCreate() {
      instance.popper.addEventListener('click', event => {
        const closestItem = event.target.closest('[data-dropdown="item"]');
        if (closestItem && !event.defaultPrevented && instance.popper.contains(closestItem)) {
          setTimeout(() => instance.state.isMounted && instance.hide());
        }
      });
    },
  }),
};

export const Popover = assignStyledNodes(_Popover, {
  Arrow,
  Head,
  Content,
});
