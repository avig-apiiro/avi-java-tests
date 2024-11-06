import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@src-v2/hooks/use-storage';

export interface DraggableCollectionOrderResult {
  visibleItems: string[];
  isDirty: boolean;
  toggleItemVisibility: (key: string) => void;
  getItemLocation: (key: string) => number;
  changeItemLocation: ([targetItemKey, insertAfterItemKey]: [string, string]) => void;
  onHover: (dragItemKey: string, hoverItemKey: string) => void;
  onDrop: () => void;
  resetOrder: () => void;
}

export function useDraggableCollectionOrder(
  storagePrefix: string | null,
  defaultOrder: string[],
  onOrderChanged?: (keys: string[]) => void,
  onToggleVisibility?: (key: string, isVisible: boolean) => void
): DraggableCollectionOrderResult {
  const [storedOrder, setStoredOrder] = useLocalStorage(`${storagePrefix}_order`, defaultOrder);
  const [activeOrder, setActiveOrder] = useState<string[]>(storedOrder);

  useEffect(() => {
    setActiveOrder(activeOrder =>
      _.isEqual(storedOrder, activeOrder) ? activeOrder : storedOrder
    );
  }, [storedOrder]);

  const getItemLocation = useCallback((key: string) => activeOrder.indexOf(key), [activeOrder]);

  const onHover = useCallback(
    (dragItemKey: string, hoverItemKey: string) => {
      if (dragItemKey === hoverItemKey) {
        return;
      }

      const dragLocation = getItemLocation(dragItemKey) ?? 0;
      const hoverLocation = getItemLocation(hoverItemKey) ?? 0;

      const minLocation = Math.min(dragLocation, hoverLocation);
      const maxLocation = Math.max(dragLocation, hoverLocation);

      const direction = dragLocation < hoverLocation ? -1 : 1;

      const keysToUpdate = activeOrder.filter(
        (key, location) => key !== dragItemKey && location >= minLocation && location <= maxLocation
      );

      const oldOrder = activeOrder.reduce(
        (result, key) => ({ ...result, [key]: activeOrder.indexOf(key) + direction }),
        {}
      );
      const newOrder = keysToUpdate.reduce(
        (result, key) => ({ ...result, [key]: activeOrder.indexOf(key) + direction }),
        { ...oldOrder, [dragItemKey]: hoverLocation }
      );

      setActiveOrder(
        _.orderBy(Object.entries(newOrder), ([, location]) => location).map(([key]) => key)
      );
    },
    [activeOrder, getItemLocation]
  );

  const handleDrop = useCallback(() => {
    onOrderChanged?.(activeOrder);
    setStoredOrder(activeOrder);
  }, [activeOrder, setStoredOrder]);

  const changeItemLocation = useCallback(
    ([targetItemKey, insertAfterItemKey]: [string, string]) => {
      const prevLocation = getItemLocation(targetItemKey);
      const newLocation = getItemLocation(insertAfterItemKey);

      const orderedKeys = _.orderBy(activeOrder, key => getItemLocation(key));

      const [movedKey] = orderedKeys.splice(prevLocation, 1);
      orderedKeys.splice(newLocation - (prevLocation < newLocation ? 0 : 0), 0, movedKey);

      setStoredOrder(orderedKeys);
    },
    [activeOrder, getItemLocation, setStoredOrder]
  );

  const toggleItemVisibility = useCallback(
    (key: string) => {
      const isVisible = storedOrder.includes(key);
      setStoredOrder(newOrder =>
        isVisible ? newOrder.filter(item => item !== key) : [...newOrder, key]
      );
      onToggleVisibility?.(key, !isVisible);
    },
    [storedOrder, setStoredOrder]
  );

  const resetOrder = useCallback(() => setStoredOrder(defaultOrder), [defaultOrder]);

  return {
    visibleItems: storedOrder,
    isDirty: useMemo(() => !_.isEqual(defaultOrder, storedOrder), [defaultOrder, storedOrder]),
    getItemLocation,
    changeItemLocation,
    toggleItemVisibility,
    onHover,
    onDrop: handleDrop,
    resetOrder,
  };
}

export function reduceToOrderedDictionary(keys: string[]) {
  return keys.reduce((result, key, index) => ({ ...result, [key]: index }), {});
}
