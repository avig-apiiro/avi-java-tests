import { ReactNode, createContext, useContext } from 'react';
import { useInject, useSuspense } from '@src-v2/hooks';
import { CICDServerDependencyInfo } from '@src-v2/types/pipelines/pipelines-types';

const Context = createContext<{ serverDependencyInfo: CICDServerDependencyInfo }>(null);

export function PipelineDependencyContextProvider({
  children,
  name,
  version,
  serverUrl,
}: {
  children: ReactNode;
  version: string;
  name: string;
  serverUrl: string;
}) {
  const { pipelines } = useInject();

  const serverDependencyInfo = useSuspense(pipelines.getServersDependencyInfo, {
    name,
    version,
    serverUrl,
  });

  return <Context.Provider value={{ serverDependencyInfo }}>{children}</Context.Provider>;
}

export function usePipelineDependencyContext() {
  return useContext(Context);
}
