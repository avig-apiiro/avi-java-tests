import { ReactNode, createContext, useContext } from 'react';
import { useInject, useSuspense } from '@src-v2/hooks';
import { RepositoryProfileResponse } from '@src-v2/types/profiles/repository-profile-response';

const Context = createContext<{ repository: RepositoryProfileResponse }>(null);

export function RepositoryContextProvider({
  repositoryKey,
  children,
}: {
  repositoryKey: string;
  children: ReactNode;
}) {
  const { repositoryProfiles } = useInject();

  const repository = useSuspense(repositoryProfiles.getProfile, {
    key: repositoryKey,
  });

  return <Context.Provider value={{ repository }}>{children}</Context.Provider>;
}

export function useRepositoryContext() {
  return useContext(Context);
}
