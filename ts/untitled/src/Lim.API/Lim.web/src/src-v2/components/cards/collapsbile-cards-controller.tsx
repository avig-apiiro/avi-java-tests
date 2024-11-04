import _ from 'lodash';
import { FC, useCallback, useState } from 'react';
import styled from 'styled-components';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { Size } from '@src-v2/components/types/enums/size';

export function CollapsibleCardsController({
  onToggle,
  children,
}: {
  onToggle?: (state: boolean) => void;
  children: FC<ControlledCardProps>;
}) {
  const {
    triggerOpenState,
    handleCardToggle,
    handleCollapseAll,
    handleExpandAll,
    collapseAllDisabled,
    expandAllDisabled,
  } = useCardsController(onToggle);

  return (
    <>
      <CollapsibleControls>
        <TextButton
          disabled={collapseAllDisabled}
          onClick={handleCollapseAll}
          size={Size.XXSMALL}
          mode={LinkMode.INTERNAL}>
          Collapse All
        </TextButton>
        <TextButton
          disabled={expandAllDisabled}
          onClick={handleExpandAll}
          size={Size.XXSMALL}
          mode={LinkMode.INTERNAL}>
          Expand All
        </TextButton>
      </CollapsibleControls>

      {children({ triggerOpenState, onToggle: handleCardToggle })}
    </>
  );
}

const CollapsibleControls = styled.div`
  display: flex;
  margin-bottom: 2rem;
  justify-content: flex-end;
  align-items: center;
  gap: 5rem;
`;

function useCardsController(onToggle?: (state: boolean) => void) {
  const [triggerOpenState, setTriggerOpenState] = useState({ isOpen: true });
  const [collapsedCardsMap, setCollapsedCardsMap] = useState({});

  const handleCardToggle = useCallback(
    (cardId: string, value: boolean) =>
      setCollapsedCardsMap(state => ({ ...state, [cardId]: value })),
    [setCollapsedCardsMap]
  );

  const handleForceChanged = useCallback(
    forceValue => {
      setTriggerOpenState({ isOpen: forceValue });
      setCollapsedCardsMap(cardsMap =>
        Object.keys(cardsMap).reduce(
          (newCardsMap, cardId) => ({ ...newCardsMap, [cardId]: forceValue }),
          {}
        )
      );
      onToggle?.(forceValue);
    },
    [setTriggerOpenState, setCollapsedCardsMap]
  );

  return {
    triggerOpenState,
    handleCardToggle,
    handleCollapseAll: () => handleForceChanged(false),
    handleExpandAll: () => handleForceChanged(true),
    collapseAllDisabled: _.every(Object.values(collapsedCardsMap), isOpen => !isOpen),
    expandAllDisabled: _.every(Object.values(collapsedCardsMap), isOpen => isOpen),
  };
}
