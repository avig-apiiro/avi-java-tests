import _ from 'lodash';
import { observer } from 'mobx-react';
import React, {
  ReactNode,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Card, CollapsibleCard } from '@src-v2/components/cards';
import { ClampText } from '@src-v2/components/clamp-text';
import { Collapsible } from '@src-v2/components/collapsible';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SortableTree, TreeNodeType } from '@src-v2/components/sortable-tree/sortable-tree';
import { getPathById } from '@src-v2/components/sortable-tree/tree-methods';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Title } from '@src-v2/components/typography';
import {
  InventoryQuerySettings,
  loadExportedQuerySettingsJson,
  useApiiroQlSchema,
} from '@src-v2/containers/inventory-query/inventory-query-settings';
import {
  getCardTitle,
  pathExists,
} from '@src-v2/containers/inventory-query/inventory-query-sidebar/library-utils';
import {
  countFavoriteLeafItems,
  filterFavoriteLeafItems,
  transformDataToInventoryNode,
} from '@src-v2/containers/inventory-query/inventory-query-sidebar/transformers';
import { treeItemStyles } from '@src-v2/containers/inventory-query/inventory-query-sidebar/tree-item-styles';
import { useSaveQueryModal } from '@src-v2/containers/inventory-query/modals/inventory-query-save-modal';
import { useInject, useLoading, useToggle } from '@src-v2/hooks';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

export const QueryTreeContext = React.createContext<{
  libraryName: 'explorer.userFavorites' | 'explorer.presets';
  tree: TreeNodeType;
  refetchTreeItems: () => void;
  readonly: boolean;
  createNewTab: (
    querySettings: InventoryQuerySettings,
    select: boolean,
    name: string,
    path?: string[]
  ) => void;
}>(null as any);

export const QueryLibraryCard = styled(
  observer(
    ({ libraryName, displayName, searchTerm, createNewTab, readonly, savingQuery, ...props }) => {
      const { inventoryQuery, toaster } = useInject();
      const trackAnalytics = useTrackAnalytics();
      const [data, setData] = useState(null);
      const [refetch, refetchTreeItems] = useToggle(false);

      const [dataFetcher, loading] = useLoading(
        async libraryName =>
          await inventoryQuery.getBetaFeatureFavoriteQueriesLibrary({ libraryName })
      );

      useEffect(() => {
        if (libraryName) {
          dataFetcher(libraryName).then(data => setData(data));
        }
      }, [refetch, libraryName, dataFetcher, setData, savingQuery]);

      const [initialTree, itemsCount] = useMemo(() => {
        const copy = {
          ...data,
          folderContent: filterFavoriteLeafItems(data?.folderContent, searchTerm, readonly),
        };
        return [transformDataToInventoryNode(copy, '1'), countFavoriteLeafItems(copy)] as const;
      }, [data, searchTerm]);

      const canDrop = useCallback(
        (tree, from, to, position) => {
          const root = { id: '1', children: tree };
          const fromPath = getPathById(root, from);
          fromPath.shift();
          const toPath = getPathById(root, to);
          toPath.shift();
          if (position === 'insert-above' || position === 'insert-inder') {
            toPath.pop();
          }

          const exists = pathExists(data, [...toPath, _.last(fromPath)]);
          if (exists) {
            toaster.error('Query with same name exists in target folder');
            return false;
          }
          return true;
        },
        [data]
      );

      if (!data) {
        return (
          <div {...props}>
            <CollapsibleCard
              open={false}
              data-type="library-card"
              title={
                <Title>
                  {displayName} <LogoSpinner />
                </Title>
              }
              {...props}
            />
          </div>
        );
      }

      return (
        <div {...props}>
          <CollapsibleCard
            open={initialTree.children.length > 0}
            data-diable-open={dataAttr(initialTree.children.length === 0)}
            title={
              <Title>
                {displayName} {loading ? <LogoSpinner /> : `(${itemsCount})`}
              </Title>
            }
            data-type="library-card"
            {...props}>
            <CardBody>
              <QueryTreeContext.Provider
                value={{
                  libraryName,
                  tree: initialTree,
                  createNewTab,
                  readonly,
                  refetchTreeItems,
                }}>
                <SortableTree
                  key={JSON.stringify(initialTree.children)}
                  initialTree={initialTree.children}
                  dragItem={TreeItem}
                  nodeParent={NodeParent}
                  canDrop={canDrop}
                  onDrop={async ({ tree, from, to, position }) => {
                    await inventoryQuery.moveFavoritesItem({
                      tree,
                      from,
                      to,
                      position,
                      libraryName,
                    });
                    refetchTreeItems();
                    trackAnalytics(AnalyticsEventName.ActionInvoked, {
                      [AnalyticsDataField.Source]: getCardTitle(libraryName),
                      [AnalyticsDataField.ActionType]: 'Move Query',
                    });
                  }}
                />
              </QueryTreeContext.Provider>
            </CardBody>
          </CollapsibleCard>
        </div>
      );
    }
  )
)`
  ${Card} {
    box-shadow: var(--elevation-0) !important;

    & ${LogoSpinner} {
      position: absolute;
      top: 7rem;
      right: 2rem;
      max-height: 7rem;
    }

    &[data-diable-open] {
      cursor: unset;
      pointer-events: none;
    }

    &:not([data-open]) {
      > ${Collapsible.Head} {
        background-color: white;
      }
    }
  }

  ${Collapsible.Body} {
    padding: 0;
  }

  > ${Collapsible.Head} {
    display: flex;
    gap: 2rem;
    flex-direction: row-reverse;
    background-color: var(--color-blue-gray-20);
    justify-content: flex-start;
    padding: 2rem;
  }

  margin: 4rem 0 1rem 0;
  display: flex;
  flex-direction: column;
`;

const TreeItem = styled(
  forwardRef<
    HTMLDivElement,
    {
      depth: number;
      children: ReactNode;
      node: TreeNodeType & {
        query?: InventoryQuerySettings;
      };
      parentName: string;
    }
  >(({ children, node, ...props }, ref) => {
    const { inventoryQuery } = useInject();
    const { libraryName, tree, createNewTab, readonly, refetchTreeItems } =
      useContext(QueryTreeContext);
    const pathArray = useMemo(() => getPathById(tree, node.id), [tree, node.id]);
    const { apiiroQlSchema } = useApiiroQlSchema();

    const handleLoadQuery = useCallback(
      event => {
        event.stopPropagation();
        const savedQuerySettings = loadExportedQuerySettingsJson(
          apiiroQlSchema,
          inventoryQuery.transformExportedQueryToFavoritesEntry(node.query)
        );
        const path = getPathById(tree, node.id, []);
        path.shift();
        createNewTab(savedQuerySettings, true, node.name, !readonly ? path : null);
      },
      [apiiroQlSchema, node.query]
    );

    const trackAnalytics = useTrackAnalytics();

    const [showRenameModal, renameModalElement] = useSaveQueryModal(true);

    const renameQuery = useCallback(
      async (newName: string) => {
        await inventoryQuery.renameFavoritesItem({
          libraryName,
          tree,
          from: node.id,
          newName,
        });
        trackAnalytics(AnalyticsEventName.ActionInvoked, {
          [AnalyticsDataField.Source]: getCardTitle(libraryName),
          [AnalyticsDataField.ActionType]: 'Rename Query',
        });
        refetchTreeItems();
      },
      [inventoryQuery, libraryName, tree, node.id, trackAnalytics, refetchTreeItems]
    );

    return (
      <>
        {' '}
        {renameModalElement}
        <div {...props} ref={ref}>
          <TreeItemWrapper
            onClick={event => {
              handleLoadQuery(event);
              trackAnalytics(AnalyticsEventName.ActionClicked, {
                [AnalyticsDataField.ActionType]: `Load query from ${libraryName}`,
              });
            }}>
            {children}
            <ClampText>{node?.name}</ClampText>
          </TreeItemWrapper>

          {!readonly && (
            <DropdownMenu onItemClick={stopPropagation} onClick={stopPropagation}>
              <Dropdown.Item
                onClick={async event => {
                  event.stopPropagation();
                  await inventoryQuery.deleteFavoritesItem({
                    pathToDelete: pathArray,
                    libraryName,
                  });
                  refetchTreeItems();
                }}>
                Delete
              </Dropdown.Item>
              <Dropdown.Item
                onClick={event => {
                  event.stopPropagation();
                  showRenameModal(renameQuery, 'explorer.userFavorites', node.name);
                }}>
                Rename
              </Dropdown.Item>
            </DropdownMenu>
          )}
        </div>
      </>
    );
  })
)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin-left: ${props => `${props.depth * 4}rem`};
  font-size: var(--font-size-xs);
  font-weight: 100;

  &:hover {
    cursor: move;
  }

  ${DropdownMenu} {
    flex-shrink: 0;
  }

  ${treeItemStyles};
`;

const NodeParent = styled(
  forwardRef<
    HTMLDivElement,
    { depth: number; children: ReactNode; node: TreeNodeType; open: boolean; libraryName: 'string' }
  >(({ children, node, ...props }, ref) => {
    const { inventoryQuery } = useInject();
    const { libraryName, refetchTreeItems } = useContext(QueryTreeContext);

    const isDeletable = useMemo(() => React.Children.count(children) === 0, [children]);

    const { readonly } = useContext(QueryTreeContext);

    return (
      <div ref={ref}>
        <Collapsible
          data-readonly={dataAttr(readonly)}
          key={`${node.name}-${node.children.length}`}
          open={node.children.length}
          title={
            <NodeParentLabel>
              {node?.name}
              {!readonly && (
                <DropdownMenu onClick={stopPropagation}>
                  <Tooltip disabled={isDeletable} content="Only an empty folder can be deleted">
                    <div>
                      <Dropdown.Item
                        disabled={!isDeletable}
                        onClick={async event => {
                          event.stopPropagation();
                          await inventoryQuery.deleteFavoritesItem({
                            pathToDelete: [node.name],
                            libraryName,
                          });
                          refetchTreeItems();
                        }}>
                        Delete
                      </Dropdown.Item>
                    </div>
                  </Tooltip>
                </DropdownMenu>
              )}
            </NodeParentLabel>
          }
          {...props}>
          <Collapsible.Body>{children}</Collapsible.Body>
        </Collapsible>
      </div>
    );
  })
)`
  &[data-readonly] {
    margin: 2rem 0;
  }

  ${Collapsible.Head} {
    display: flex;
    flex-direction: row-reverse;
    gap: 2rem;
    padding: 0;
  }

  ${treeItemStyles}
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const NodeParentLabel = styled.div`
  font-weight: 200;
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-65);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  > ${DropdownMenu} {
    flex-shrink: 0;
    margin-right: 0.25rem;
  }
`;

const TreeItemWrapper = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  align-items: center;
  padding: 0 3rem;
  margin-top: 1rem;
  font-weight: 400;
  line-height: 8rem;
  border-radius: 2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-15);
  }
`;
