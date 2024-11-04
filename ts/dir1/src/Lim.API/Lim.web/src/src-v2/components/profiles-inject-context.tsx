import { ReactNode, createContext, useContext } from 'react';
import { BaseConsumableProfilesService } from '@src-v2/services/profiles/base-consumable-profiles-service';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';

const ProfilesServiceContext = createContext<{
  profiles: BaseConsumableProfilesService<CodeProfileResponse>;
}>(null);

export const ProfilesProvider = ({
  value,
  children,
}: {
  value: BaseConsumableProfilesService<CodeProfileResponse>;
  children: ReactNode;
}) => {
  return (
    <ProfilesServiceContext.Provider value={{ profiles: value }}>
      {children}
    </ProfilesServiceContext.Provider>
  );
};

export const useProfilesContext = () => {
  return useContext(ProfilesServiceContext);
};
