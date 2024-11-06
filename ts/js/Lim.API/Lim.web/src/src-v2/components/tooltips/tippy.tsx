import { TippyProps } from '@tippyjs/react';
import HeadlessTippy from '@tippyjs/react/headless';
import { ForwardedRef, forwardRef, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { assignStyledNodes } from '@src-v2/types/styled';

const _Tippy = forwardRef(
  ({ render, plugins = [], ...props }: TippyProps, ref: ForwardedRef<any>) => {
    const { mounted, lazyPlugin } = useLazyMount();
    return (
      <HeadlessTippy
        ref={ref}
        {...props}
        render={useCallback((...args) => mounted && render(...args), [mounted, render])}
        plugins={useMemo(() => plugins.concat(lazyPlugin), [plugins, lazyPlugin])}
      />
    );
  }
);

const Container = styled.div`
  position: relative;
  border-radius: 1rem;
  transition-property: transform, visibility, opacity;

  :global() [data-tippy-root] {
    max-width: calc(100vw - 3rem);
  }

  &[data-animation='fade'][data-state='hidden'] {
    opacity: 0;
  }

  &[data-inertia][data-state='visible'] {
    transition-timing-function: cubic-bezier(0.54, 1.5, 0.38, 1.11);
  }
`;

const Arrow = styled.span`
  width: 4rem;
  height: 4rem;

  &:after {
    content: '';
    position: absolute;
    border-color: transparent;
    border-style: solid;
  }

  [data-placement^='top'] > & {
    bottom: 0;

    &:after {
      bottom: -1.75rem;
      left: 0;
      border-width: 2rem 2rem 0;
      border-top-color: initial;
    }
  }

  [data-placement^='bottom'] > & {
    top: 0;

    &:after {
      top: -1.75rem;
      left: 0;
      border-width: 0 2rem 2rem;
      border-bottom-color: initial;
    }
  }

  [data-placement^='left'] > & {
    right: 0;

    &:after {
      right: -1.75rem;
      border-width: 2rem 0 2rem 2rem;
      border-left-color: initial;
    }
  }

  [data-placement^='right'] > & {
    left: 0;

    &:after {
      left: -1.75rem;
      border-width: 2rem 2rem 2rem 0;
      border-right-color: initial;
    }
  }
`;

function useLazyMount() {
  const [mounted, setMounted] = useState(false);

  return {
    mounted,
    lazyPlugin: useMemo(
      () => ({
        fn: () => ({
          onMount: () => setMounted(true),
          onHidden: () => setMounted(false),
        }),
      }),
      [setMounted]
    ),
  };
}

export const TippyAttributes = [
  'allowHTML',
  'animateFill',
  'animation',
  'appendTo',
  'aria',
  'arrow',
  'content',
  'delay',
  'disabled',
  'duration',
  'followCursor',
  'getReferenceClientRect',
  'hideOnClick',
  'ignoreAttributes',
  'inertia',
  'inlinePositioning',
  'interactive',
  'interactiveBorder',
  'interactiveDebounce',
  'maxWidth',
  'moveTransition',
  'offset',
  'onAfterUpdate',
  'onBeforeUpdate',
  'onClickOutside',
  'onCreate',
  'onDestroy',
  'onHidden',
  'onHide',
  'onMount',
  'onShow',
  'onShown',
  'onTrigger',
  'onUntrigger',
  'placement',
  'plugins',
  'popperOptions',
  'reference',
  'role',
  'showOnCreate',
  'singleton',
  'sticky',
  'theme',
  'touch',
  'trigger',
  'triggerTarget',
  'visible',
  'zIndex',
  'maxHeight',
];

export const Tippy = assignStyledNodes(_Tippy, {
  Arrow,
  Container,
});
