import { TreeNodeType } from '@src-v2/components/sortable-tree/sortable-tree';
import {
  ExportedQuerySettings,
  InventoryQuerySettings,
} from '@src-v2/containers/inventory-query/inventory-query-settings';
import { FavoritesFolder, FavoritesItem, FavoritesLeafItem } from '@src-v2/services';
import { isTypeOf } from '@src-v2/utils/ts-utils';

type TreeNodeContent =
  | {
      zodiac?: boolean;
      query: any;
    }
  | {
      isFolder: true;
    };

export function countFavoriteLeafItems(data: FavoritesItem<ExportedQuerySettings>) {
  if (isTypeOf<FavoritesFolder<ExportedQuerySettings>>(data, 'folderContent')) {
    if (!data || !data.folderContent) {
      return null;
    }
    let count = 0;
    for (const item of data.folderContent) {
      count += countFavoriteLeafItems(item);
    }
    return count;
  }
  return 1;
}

export function filterFavoriteLeafItems(
  data: FavoritesItem<ExportedQuerySettings>[],
  searchTerm: string,
  pruneEmptyFolders: boolean
): FavoritesItem<ExportedQuerySettings>[] {
  if (data === undefined) {
    return null;
  }

  return data.flatMap(item => {
    if ('folderContent' in item) {
      const folderContent = filterFavoriteLeafItems(
        item.folderContent,
        searchTerm,
        pruneEmptyFolders
      );

      if (!folderContent.length && pruneEmptyFolders) {
        return [];
      }

      return {
        ...item,
        folderContent,
      };
    }

    if (
      isTypeOf<FavoritesLeafItem<InventoryQuerySettings>>(item, 'itemContent') &&
      item.name.toLowerCase().includes((searchTerm ?? '').toLowerCase())
    ) {
      return item;
    }

    return [];
  });
}

export const transformDataToInventoryNode = (
  data: FavoritesItem<InventoryQuerySettings>,
  id = '1' // root id
): TreeNodeType & TreeNodeContent => {
  if (!data) {
    return null;
  }
  if (isTypeOf<FavoritesLeafItem<InventoryQuerySettings>>(data, 'itemContent')) {
    return { id, name: data.name, query: data.itemContent, children: [] };
  }
  const children = data.folderContent?.map((item, index) => {
    return transformDataToInventoryNode(item, `${id}.${index + 1}`);
  });

  return { id, name: data.name, isFolder: true, children };
};
