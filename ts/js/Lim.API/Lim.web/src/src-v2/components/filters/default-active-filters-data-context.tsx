import _ from 'lodash';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { ActiveFiltersData } from '@src-v2/hooks/use-filters';

export type DefaultActiveFiltersDataContext = {
  defaultActiveFiltersData: ActiveFiltersData;
  initDefaultFilterValues: (data: ActiveFiltersData) => void;
  clearDefaultFilterValues: () => void;
};

const context = createContext<DefaultActiveFiltersDataContext>(null);

export function DefaultActiveFiltersDataProvider({ children }: { children: ReactNode }) {
  const [defaultActiveFiltersData, setDefaultFilterValues] = useState<ActiveFiltersData>(null);

  return (
    <context.Provider
      value={{
        defaultActiveFiltersData,
        initDefaultFilterValues: setDefaultFilterValues,
        clearDefaultFilterValues: useCallback(() => setDefaultFilterValues(null), []),
      }}>
      {children}
    </context.Provider>
  );
}

export function useDefaultActiveFiltersData(): DefaultActiveFiltersDataContext {
  return (
    useContext(context) ?? {
      defaultActiveFiltersData: {} as ActiveFiltersData,
      initDefaultFilterValues: _.noop,
      clearDefaultFilterValues: _.noop,
    }
  );
}
