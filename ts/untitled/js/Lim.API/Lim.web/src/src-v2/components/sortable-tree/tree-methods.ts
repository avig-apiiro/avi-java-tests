import { DropState, TreeNodeType } from '@src-v2/components/sortable-tree/sortable-tree';

function findClosestAncestor<T extends TreeNodeType>(node: T, parent: T, targetId: string) {
  if (node.id === targetId) {
    return { node, parent };
  }
  for (const child of node.children ?? []) {
    const result = findClosestAncestor(child, node, targetId);
    if (result) {
      return result;
    }
  }
  return null;
}

function removeFromTree<T extends TreeNodeType>(nodeList: T[], targetId: string) {
  for (let dragNodeIndex = 0; dragNodeIndex < nodeList.length; dragNodeIndex++) {
    if (nodeList[dragNodeIndex].id === targetId) {
      return { node: nodeList.splice(dragNodeIndex, 1)[0], index: dragNodeIndex };
    }
    if (nodeList[dragNodeIndex].children) {
      const result = removeFromTree(nodeList[dragNodeIndex].children, targetId);
      if (result) {
        return result;
      }
    }
  }
}

function insertToTree<T extends TreeNodeType>(
  nodeList: T[],
  targetId: string,
  nodeToInsert: T,
  insetPosition: DropState,
  nodeIndex: number
) {
  for (let i = 0; i < nodeList.length; i++) {
    if (nodeList[i].id === targetId) {
      if (insetPosition === 'insert-above') {
        nodeList.splice(i, 0, nodeToInsert);
      } else if (insetPosition === 'insert-under') {
        nodeList.splice(i + 1, 0, nodeToInsert);
      } else {
        nodeList[i].children.splice(nodeIndex, 0, nodeToInsert);
      }
      return true;
    }

    if (nodeList[i].children) {
      const result = insertToTree(
        nodeList[i].children,
        targetId,
        nodeToInsert,
        insetPosition,
        nodeIndex
      );
      if (result) {
        return true;
      }
    }
  }
}

export function isAncestor<T extends TreeNodeType>(
  tree: T[],
  ancestorId: string,
  descendantId: string
) {
  for (const node of tree) {
    const { node: descendant, parent } = findClosestAncestor(node, null, descendantId) || {};
    if (!descendant) {
      continue;
    }
    if (parent && parent.id === ancestorId) {
      return true;
    }
    if (descendant.id === ancestorId) {
      return true;
    }
    if (descendant.children?.some(child => isAncestor([child], ancestorId, descendantId))) {
      return true;
    }
  }
  return false;
}

export function getPathById(data, id, path = []) {
  const newPath = path.concat(data.name || '');

  if (data.id === id) {
    return newPath;
  }

  if (Array.isArray(data.children)) {
    for (const child of data.children) {
      const foundPath = getPathById(child, id, newPath);
      if (foundPath) {
        return foundPath;
      }
    }
  }

  return null;
}

export function moveNode<T extends TreeNodeType>(
  tree: T[],
  dragNodeId: string,
  hoverNodeId: string,
  insetPosition: DropState
) {
  if (!dragNodeId || !hoverNodeId) {
    return tree;
  }
  const newTree = JSON.parse(JSON.stringify(tree));
  const { node: dragNode, index: dragNodeIndex } = removeFromTree(newTree, dragNodeId);
  insertToTree(newTree, hoverNodeId, dragNode, insetPosition, dragNodeIndex);
  return newTree;
}
