import { createContext, useContext, useState } from 'react';
import { TABS } from '@src-v2/containers/applications/application-form-advanced-definitions';

export const ApplicationFormContext = createContext(null);

export function useApplicationFormContext() {
  return useContext(ApplicationFormContext);
}

export function ApplicationFormContextProvider({ children }) {
  const [advancedDefinitionsTab, setAdvancedDefinitionsTab] = useState(TABS.GENERAL);

  return (
    <ApplicationFormContext.Provider
      value={{
        advancedDefinitionsTab,
        setAdvancedDefinitionsTab,
      }}>
      {children}
    </ApplicationFormContext.Provider>
  );
}
