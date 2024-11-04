import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AnalyticsLayer, useAnalyticsData } from '@src-v2/components/analytics-layer';
import { customScrollbar } from '@src-v2/style/mixins';

interface PaneContextType {
  pushPane: (element: ReactNode) => void;
  popPane: () => void;
  closePane: () => void;
  hasPanes: boolean;
}

const PaneContext = createContext<PaneContextType>(null!);

export function usePaneState() {
  const analyticsData = useAnalyticsData();
  const context = useContext(PaneContext);

  return useMemo(
    () => ({
      ...context,
      pushPane: (element: ReactNode) =>
        context.pushPane(<AnalyticsLayer analyticsData={analyticsData}>{element}</AnalyticsLayer>),
    }),
    [context, analyticsData]
  );
}

export function PaneContextProvider({ children }: { children: ReactNode }) {
  const [paneStack, setPaneStack] = useState<ReactNode[]>([]);

  const pushPane = useCallback(
    (element: ReactNode) => setPaneStack(prevStack => [...prevStack, element]),
    []
  );

  const popPane = useCallback(() => setPaneStack(stack => stack.slice(0, -1)), []);

  const closePane = useCallback(() => setPaneStack([]), []);
  const hasPanes = useMemo(() => paneStack.length >= 2, [paneStack.length]);

  return (
    <PaneContext.Provider value={{ pushPane, popPane, closePane, hasPanes }}>
      {children}
      <PaneContainer id="pane">{paneStack[paneStack.length - 1]}</PaneContainer>
    </PaneContext.Provider>
  );
}

const PaneContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2;
  overflow: auto;
  background-color: var(--overlay-dark-color);
  transition: opacity 400ms;

  --scrollbar-color: var(--color-blue-gray-35);
  --scrollbar-border-color: var(--color-blue-gray-20);
  ${customScrollbar};

  &:empty {
    visibility: hidden;
    opacity: 0;
  }
`;
