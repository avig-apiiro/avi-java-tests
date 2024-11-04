import { animated } from '@react-spring/web';
import { TippyProps } from '@tippyjs/react';
import { ReactNode, useCallback, useMemo } from 'react';
import { FieldError } from 'react-hook-form/dist/types/errors';
import styled from 'styled-components';
import { Tippy } from '@src-v2/components/tooltips/tippy';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { useAnimationPlugin } from './animationPlugin';

export interface PlainTooltipProps extends Omit<TippyProps, 'content'> {
  content: ReactNode | Function | FieldError;
  noArrow?: boolean;
  style?: Record<string, string>;
  plugins?: any[];
  disabled?: boolean;
}

function PlainTooltip(
  {
    content,
    plugins = [],
    className,
    style,
    delay = [200, 100],
    noArrow,
    appendTo = document.body,
    ...props
  }: PlainTooltipProps,
  ref
) {
  const { opacity, animationPlugin } = useAnimationPlugin();
  return (
    <Tippy
      ref={ref}
      delay={delay}
      zIndex={10000}
      {...props}
      appendTo={appendTo}
      render={useCallback(
        (attrs, _, instance) => (
          <Tippy.Container
            {...attrs}
            data-floating-element={dataAttr(true)}
            className={className}
            style={{ ...style, opacity }}
            as={animated.div}>
            {!noArrow && <Arrow data-popper-arrow />}
            {typeof content === 'function' ? content(instance) : content}
          </Tippy.Container>
        ),
        [content, className, style]
      )}
      plugins={useMemo(() => plugins.concat(animationPlugin), [plugins, animationPlugin])}
      animation
    />
  );
}

const _Tooltip = styled(PlainTooltip)`
  max-width: 110rem;
  overflow-wrap: anywhere;
  text-wrap: initial;
  padding: 3rem;
  border-radius: 2rem;
  color: var(--color-white);
  font-size: var(--font-size-s);
  line-height: 1.4;
  background-color: var(--color-blue-gray-65);
  z-index: 1;
`;

const Arrow = styled(Tippy.Arrow)`
  color: var(--color-blue-gray-65);
`;

export const Tooltip = assignStyledNodes(_Tooltip, {
  Arrow,
});
