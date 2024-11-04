import { Children, FC, ReactNode, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { CollapsibleCard } from '@src-v2/components/cards/cards';
import { Collapsible } from '@src-v2/components/collapsible';
import { CollapsibleLite, CollapsibleLiteAttributes } from '@src-v2/components/collapsible-lite';
import { PaneTableControls } from '@src-v2/components/panes/plain-pane-table';
import { useGroupProperties, useToggle, useUniqueId } from '@src-v2/hooks';
import { dataAttr } from '@src-v2/utils/dom-utils';

export type ControlledCardProps = {
  title?: string | ReactNode;
  triggerOpenState: { isOpen: boolean };
  onToggle?: (cardId: string, value: boolean) => void;
  footer?: ReactNode;
  defaultOpen?: boolean;
};

export function ControlledCard({
  defaultOpen = true,
  triggerOpenState,
  onToggle,
  children,
  nestedContent: NestedContent,
  ...props
}: {
  defaultOpen?: boolean;
  children: ReactNode;
  nestedContent?: ReactNode | FC<{ visible: boolean }>;
} & ControlledCardProps) {
  const [isNestedOpen, toggleIsNestedOpen] = useToggle();
  const [collapsibleProps, cardProps] = useGroupProperties(props, CollapsibleLiteAttributes);
  const { isOpen, handleToggle } = useControlledCard({ triggerOpenState, onToggle, defaultOpen });

  const handleToggleNestedOpen = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        toggleIsNestedOpen(isOpen);
      } else {
        setTimeout(() => toggleIsNestedOpen(isOpen), 400);
      }
    },
    [toggleIsNestedOpen]
  );

  const isNestedComponent = typeof NestedContent === 'function';

  return (
    <Card
      {...cardProps}
      defaultOpen={defaultOpen}
      open={isOpen}
      onToggle={handleToggle}
      data-is-nested={dataAttr(Boolean(NestedContent))}>
      {children}
      {Boolean(isNestedComponent ? NestedContent : Children.count(NestedContent)) && (
        <CollapsibleLite {...collapsibleProps} onToggle={handleToggleNestedOpen} showChevron>
          {isNestedComponent ? <NestedContent visible={isNestedOpen} /> : NestedContent}
        </CollapsibleLite>
      )}
    </Card>
  );
}

const Card = styled(CollapsibleCard)`
  --card-padding: 0;
  padding: var(--card-vertical-padding, 4rem) var(--card-horizontal-padding, 5rem);

  &[data-open] {
    &[data-is-nested] {
      padding-bottom: 2rem;
    }

    & > ${Collapsible.Head} {
      margin-bottom: var(--card-vertical-padding, 4rem);
    }
  }

  ${Collapsible.Head} {
    transition: margin-bottom 400ms ease-in-out;
  }

  ${CollapsibleLite} {
    display: flex;
    flex-direction: column-reverse;
  }

  ${PaneTableControls} {
    margin-top: 0;
  }
`;

function useControlledCard({
  triggerOpenState,
  onToggle,
  defaultOpen,
}: Partial<ControlledCardProps>) {
  const [isOpen, setIsOpen] = useToggle(Boolean(defaultOpen));
  const cardId = useUniqueId('entity-pane-card-');

  useEffect(() => {
    onToggle?.(cardId, true);
  }, [cardId]);

  const handleToggle = useCallback(
    isOpen => {
      setIsOpen(isOpen);
      return onToggle?.(cardId, isOpen);
    },
    [onToggle, cardId]
  );

  useEffect(() => {
    if (triggerOpenState?.isOpen !== isOpen) {
      setIsOpen(triggerOpenState?.isOpen);
    }
  }, [triggerOpenState]);

  useEffect(() => {
    if (!defaultOpen) {
      setIsOpen(false);
      onToggle?.(cardId, false);
    }
  }, []);

  return {
    isOpen,
    handleToggle,
  };
}
