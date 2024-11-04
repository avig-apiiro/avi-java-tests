import { ReactNode, createContext, useContext } from 'react';
import { useInject, useSuspense } from '@src-v2/hooks';
import { CodeModule } from '@src-v2/types/profiles/code-module';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';

const Context = createContext<{
  module: CodeModule;
  repositoryProfile: LeanConsumableProfile;
  applications: LeanApplication[];
  orgTeams: LeanOrgTeamWithPointsOfContact[];
}>(null);

export function CodeModuleContextProvider({
  repositoryKey,
  moduleKey,
  children,
}: {
  repositoryKey: string;
  moduleKey: string;
  children: ReactNode;
}) {
  const { profiles } = useInject();

  const moduleResponse = useSuspense(profiles.getRepositoryModuleProfile, {
    repositoryKey,
    moduleKey,
  });

  return <Context.Provider value={moduleResponse}>{children}</Context.Provider>;
}

export function useCodeModuleContext() {
  return useContext(Context);
}
