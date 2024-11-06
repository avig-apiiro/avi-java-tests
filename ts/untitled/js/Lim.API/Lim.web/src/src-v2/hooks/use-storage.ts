import { isEmpty } from 'lodash';
import { useCallback, useState } from 'react';
import { useInject } from '@src-v2/hooks/use-inject';
import { localStorage, sessionStorage } from '@src-v2/utils/storage';

export const useLocalStorage = createStorageHook(localStorage);
export const useSessionStorage = createStorageHook(sessionStorage);

function createStorageHook(storage: any) {
  return function useStorage<T>(itemKey: string, defaultValue: T = null) {
    const { session } = useInject();
    if (!isEmpty(session.data.environmentId)) {
      itemKey = `${session.data.environmentId}.${itemKey}`;
    }

    const [value, set] = useState<T>(() => storage.get(itemKey) ?? defaultValue);
    return [
      value,
      useCallback(
        (newValue: ((val: T) => T) | T) => {
          if (typeof newValue === 'function') {
            set((value: T) => {
              const nextValue = (newValue as Function)(value);
              storage.set(itemKey, nextValue);
              return nextValue;
            });
          } else {
            storage.set(itemKey, newValue);
            set(newValue);
          }
        },
        [set]
      ),
      // reset
      useCallback(() => {
        storage.remove(itemKey);
        set(defaultValue);
      }, [set]),
    ] as const;
  };
}
