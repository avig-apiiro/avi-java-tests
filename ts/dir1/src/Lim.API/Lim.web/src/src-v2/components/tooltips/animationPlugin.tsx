import { useSpring } from '@react-spring/web';
import { useMemo } from 'react';

export function useAnimationPlugin() {
  const [{ opacity }, api] = useSpring(() => ({
    config: { friction: 20 },
    opacity: 0,
  }));

  return {
    opacity,
    animationPlugin: useMemo(
      () => ({
        fn: () => ({
          onMount: () => api.start({ opacity: 1 }),
          onHide: event =>
            api.start({
              opacity: 0,
              onRest: animation => animation.finished && event.unmount(),
            }),
        }),
      }),
      [api]
    ),
  };
}
