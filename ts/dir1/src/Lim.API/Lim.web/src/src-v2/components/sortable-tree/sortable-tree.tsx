import React, { useCallback, useContext, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { isAncestor, moveNode } from '@src-v2/components/sortable-tree/tree-methods';
import { QueryTreeContext } from '@src-v2/containers/inventory-query/inventory-query-sidebar/queries-library-card';

export type TreeNodeType = {
  id: string;
  name: string;
  children: TreeNodeType[];
  isFolder?: boolean;
};

export type DropState = 'insert-above' | 'insert-under' | 'insert';

export type TreeNodeProps = {
  node: TreeNodeType;
  moveNode: (dragNodeId: string, hoverNodeId: string, dropState: DropState) => void;
  tree: TreeNodeType[];
  depth?: number;
  maxDepth?: number;
  staticParent?: boolean;
  onDrop?: (dragNodeId: string, hoverNodeId: string, dropState: DropState) => void;
  canDrop?: (
    node: TreeNodeType[],
    hoverNodeId: string,
    dropNodeId: string,
    itemStatus: string
  ) => boolean;
  dragItem?: React.ElementType;
  nodeParent?: React.ElementType;
  isRoot?: boolean;
  readonly?: boolean;
  allowInnerOrder?: boolean;
  children?: React.ReactNode;
};

const TreeNode = ({
  node,
  moveNode,
  tree,
  depth = 0,
  maxDepth,
  staticParent = false,
  onDrop,
  canDrop,
  dragItem: DragItem = 'div',
  nodeParent: NodeParent = 'div',
  isRoot,
  children,
  allowInnerOrder,
  ...props
}: TreeNodeProps) => {
  const ref = useRef(null);
  const TreeNodeContainer = node.isFolder ? NodeParent : DragItem;
  const [itemStatus, setItemStatus] = useState<DropState>(null);

  const { readonly } = useContext(QueryTreeContext);

  const [, drag, previewRef] = useDrag({
    type: 'treeNode',
    canDrag: () => !readonly,
    item: { id: node?.id },
    collect: monitor => {
      monitor.isDragging();
    },
  });

  const [, drop] = useDrop({
    accept: 'treeNode',
    canDrop: () => !readonly && itemStatus !== null,
    drop: ({ id: dragNodeId }) => {
      const hoverNodeId = node?.id;
      if (isAncestor(tree, dragNodeId, hoverNodeId)) {
        return;
      }
      if (canDrop(tree, dragNodeId, hoverNodeId, itemStatus)) {
        setItemStatus(null);
        moveNode(dragNodeId, hoverNodeId, itemStatus);
      }
    },
    hover: (_, monitor) => {
      if (readonly) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverOffset = 30;

      if (allowInnerOrder && !node.isFolder) {
        if (hoverClientY < hoverMiddleY) {
          setItemStatus('insert-above');
        } else {
          setItemStatus('insert-under');
        }
      } else if (node.isFolder) {
        if (hoverClientY <= hoverOffset / 2) {
          setItemStatus('insert-above');
        } else if (hoverClientY < hoverOffset) {
          setItemStatus('insert');
        } else if (hoverClientY >= hoverOffset) {
          setItemStatus('insert-under');
        }
      }
    },
    collect: monitor => {
      const isOverCurrent = monitor.isOver({ shallow: true });
      if (!isOverCurrent) {
        setItemStatus(null);
      }
      return { canDrop: monitor.canDrop(), isOverCurrent };
    },
  });

  if (!readonly) {
    staticParent && node.isFolder ? drop(previewRef(ref)) : drag(drop(previewRef(ref)));
  }

  return (
    <TreeNodeContainer
      ref={ref}
      depth={depth}
      data-hover={itemStatus}
      data-parent={node.isFolder}
      {...props}
      node={node}>
      {node?.children?.map((childNode, index) => (
        <TreeNode
          node={childNode}
          readonly={readonly}
          key={`${node.name}-${index}`}
          moveNode={moveNode}
          tree={tree}
          maxDepth={maxDepth}
          depth={depth + 1}
          dragItem={DragItem}
          isRoot={false}
          allowInnerOrder={allowInnerOrder}
        />
      ))}
    </TreeNodeContainer>
  );
};

export const SortableTree = ({
  initialTree,
  onDrop,
  canDrop,
  dragItem,
  nodeParent,
  maxDepth = 2,
}) => {
  const [tree, setTree] = useState(initialTree);

  const handleMoveNode = useCallback(
    (dragNodeId, hoverNodeId, position) => {
      onDrop?.({ tree, from: dragNodeId, to: hoverNodeId, position });
      const newTree = moveNode(tree, dragNodeId, hoverNodeId, position);
      setTree(newTree);
    },
    [tree, setTree, moveNode]
  );

  return tree.map(node => (
    <TreeNode
      key={node.label}
      dragItem={dragItem}
      nodeParent={nodeParent}
      node={node}
      moveNode={handleMoveNode}
      tree={tree}
      maxDepth={maxDepth}
      staticParent={true}
      isRoot={true}
      depth={0}
      onDrop={onDrop}
      canDrop={canDrop}
      allowInnerOrder={!node.isFolder}
    />
  ));
};
