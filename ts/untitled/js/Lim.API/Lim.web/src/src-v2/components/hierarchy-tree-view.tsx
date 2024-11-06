import _ from 'lodash';
import { observer } from 'mobx-react';
import { MouseEvent, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { Collapsible } from '@src-v2/components/collapsible';
import { Divider } from '@src-v2/components/divider';
import { Checkbox } from '@src-v2/components/forms';
import { InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { BaseIcon } from '@src-v2/components/icons';
import { useToggle } from '@src-v2/hooks';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { useCombineCallbacks } from '@src-v2/hooks/use-combine-callbacks';
import { TreeNode } from '@src-v2/models/hierarchy-nodes-tree';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

const nodeChildrenLimit = 5;

type HierarchyTreeViewProps = {
  node: TreeNode;
  defaultOpen?: boolean;
  hideChildren?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onChange: (node: TreeNode, checked: boolean) => void;
};

export const HierarchyTreeView = observer(
  ({
    node,
    defaultOpen,
    hideChildren,
    onChange,
    onMouseEnter,
    onMouseLeave,
  }: HierarchyTreeViewProps) => {
    const [controlledIsOpen, toggleControlledIsOpen] = useToggle(
      node.hasActiveChildren || defaultOpen
    );
    const { isOpen, getContentProps } = useCollapsible({
      open: controlledIsOpen,
      disabled: !node.children.length,
      overflow: 'visible',
    });
    const checkboxRef = useRef<HTMLInputElement>(null);
    const [limited, toggleLimit] = useToggle(true);
    const [highlightDivider, toggleHighlightDivider] = useToggle();

    const handleLabelClick = useCallback(
      (event: MouseEvent<HTMLLabelElement>) => {
        const nextValue = !node.checked;
        onChange?.(node, nextValue);

        if (event.target !== checkboxRef.current) {
          toggleControlledIsOpen(nextValue);
        }
      },
      [node, onChange]
    );

    const children = limited ? _.take(node.visibleChildren, nodeChildrenLimit) : node.children;

    const handleCollapsibleChevronClicked = useCombineCallbacks(
      stopPropagation,
      toggleControlledIsOpen
    );

    return (
      <>
        <ClickableLabel
          htmlFor="none"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={handleLabelClick}>
          <Checkbox
            ref={checkboxRef}
            checked={node.checked}
            indeterminate={node.indeterminate}
            onChange={_.noop}
          />
          {Boolean(node.children.length) && !hideChildren && (
            <Collapsible.Chevron
              data-open={dataAttr(isOpen)}
              name="Chevron"
              onClick={handleCollapsibleChevronClicked}
            />
          )}
          <ClampText>{`${node.name}${
            !hideChildren && node.children.length ? ` (${node.children.length})` : ''
          }`}</ClampText>
        </ClickableLabel>

        {!hideChildren && Boolean(children.length) && (
          <NodeContainer {...getContentProps()}>
            <Divider vertical data-active={dataAttr(highlightDivider)} />
            <ChildrenContainer>
              {children.map(child => (
                <HierarchyTreeView
                  key={child.key}
                  node={child}
                  defaultOpen={defaultOpen}
                  onMouseEnter={toggleHighlightDivider}
                  onMouseLeave={toggleHighlightDivider}
                  onChange={onChange}
                />
              ))}
              {node.visibleChildren.length > nodeChildrenLimit && (
                <TextButton underline onClick={toggleLimit}>
                  Show {limited ? 'more' : 'less'}
                </TextButton>
              )}
            </ChildrenContainer>
          </NodeContainer>
        )}
      </>
    );
  }
);

const ClickableLabel = styled(InputClickableLabel)`
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 2rem;
  padding: 1.5rem 2rem;

  &:hover {
    background-color: var(--color-blue-gray-15);

    ${BaseIcon}[data-name='Chevron'] {
      color: var(--color-blue-gray-60);
    }
  }

  ${Checkbox} {
    margin-right: 1rem;
  }

  ${Collapsible.Chevron} {
    transform: rotate(0);

    &[data-open] {
      transform: rotate(90deg);
    }
  }
`;

const ChildrenContainer = styled.div`
  display: flex;
  grid-area: children;
  flex-direction: column;
  flex-grow: 1;

  > ${TextButton} {
    padding: 0.75rem 0;
  }
`;

const NodeContainer = styled.div`
  display: grid;
  grid-template-areas: 'divider children';
  max-width: 100%;
  grid-template-columns: 5rem 1fr;
  margin-top: 1rem;
  gap: 2rem;

  > ${Divider} {
    grid-area: divider;
    background-color: var(--color-blue-gray-30);
    transition: background-color 50ms ease-in-out;
    margin: 0 2rem 0 3.75rem;
    border-radius: 100vmax;

    &[data-active] {
      background-color: var(--color-blue-gray-50);
    }
  }
`;
