import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import {
  DraggableCollectionOrderResult,
  useDraggableCollectionOrder,
} from '@src-v2/hooks/use-draggable-collection-order';

const Context = createContext<
  {
    register: (id: string, index: number) => void;
  } & Omit<DraggableCollectionOrderResult, 'visibleItems' | 'toggleItemVisibility'>
>(null);

export function useOverviewTilesOrderContext() {
  return useContext(Context);
}

export function OverviewTilesOrderProvider({
  storagePrefix,
  ...props
}: {
  storagePrefix: string;
  children: ReactNode;
}) {
  const [registeredTiles, setRegisteredTiles] = useState<string[]>([]);
  const { toggleItemVisibility, visibleItems, ...draggableCollectionOrderProps } =
    useDraggableCollectionOrder(storagePrefix, registeredTiles);

  const register = useCallback(
    (key: string) => {
      setRegisteredTiles(tiles => [...tiles, key]);
      if (!visibleItems.includes(key)) {
        toggleItemVisibility(key);
      }
    },
    [visibleItems]
  );

  return (
    <Context.Provider
      {...props}
      value={{
        register,
        ...draggableCollectionOrderProps,
      }}
    />
  );
}
