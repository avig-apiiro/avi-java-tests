import { ReactNode, createContext, useContext } from 'react';
import { useInject, useSuspense } from '@src-v2/hooks';
import { DeveloperProfileResponse } from '@src-v2/types/profiles/developer-profile-response';

const Context = createContext<{ developer: DeveloperProfileResponse }>(null);

export function DeveloperContextProvider({
  developerProfileKey,
  children,
}: {
  developerProfileKey: string;
  children: ReactNode;
}) {
  const { developers } = useInject();

  const developer = useSuspense(developers.getDeveloperProfileResponse, {
    key: developerProfileKey,
  });

  return <Context.Provider value={{ developer }}>{children}</Context.Provider>;
}

export function useDeveloperContext() {
  return useContext(Context);
}
