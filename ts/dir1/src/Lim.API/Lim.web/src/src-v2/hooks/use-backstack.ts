import { useInject } from '@src-v2/hooks/use-inject';

export function useBackStack() {
  const {
    application: { backStack },
  } = useInject();

  const lastBackStack = backStack.length === 1 ? backStack[0] : backStack[backStack.length - 2];

  return { backStack, lastBackStack };
}
