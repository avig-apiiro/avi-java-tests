import { ReactNode, createContext, useContext } from 'react';
import { useInject, useSuspense } from '@src-v2/hooks';
import { PullRequestScanResponse } from '@src-v2/types/pull-request/pull-request-response';

const Context = createContext<{ pullRequestScan: PullRequestScanResponse }>(null);

export function PrScanContextProvider({
  scanKey,
  children,
}: {
  scanKey: string;
  children: ReactNode;
}) {
  const { pullRequestScan } = useInject();
  const prScan = useSuspense(pullRequestScan.getPullRequest, { key: scanKey });

  return <Context.Provider value={{ pullRequestScan: prScan }}>{children}</Context.Provider>;
}

export function usePullRequestScanContext() {
  return useContext(Context);
}
