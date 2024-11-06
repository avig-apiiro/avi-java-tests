import { TreeNodeType } from '@src-v2/components/sortable-tree/sortable-tree';
import { InventoryQuerySettings } from '@src-v2/containers/inventory-query/inventory-query-settings';
import { FavoritesFolder, FavoritesItem, FavoritesLeafItem } from '@src-v2/services';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export function countFavoriteLeafItems(data: FavoritesItem<InventoryQuerySettings>) {
  if (isTypeOf<FavoritesFolder<InventoryQuerySettings>>(data, 'folderContent')) {
    let count = 0;
    for (const item of data.folderContent) {
      count += countFavoriteLeafItems(item);
    }
    return count;
  }
  return 1;
}

export function filterFavoriteLeafItems(
  data: FavoritesItem<InventoryQuerySettings>[],
  searchTerm: string
): FavoritesItem<InventoryQuerySettings>[] {
  return data.flatMap(item => {
    if ('folderContent' in item) {
      return {
        ...item,
        folderContent: filterFavoriteLeafItems(item.folderContent, searchTerm),
      };
    }
    return isTypeOf<FavoritesLeafItem<InventoryQuerySettings>>(item, 'itemContent') &&
      item.name.toLowerCase().includes((searchTerm ?? '').toLowerCase())
      ? item
      : [];
  });
}

export function transformDataToInventoryNode(
  data: FavoritesItem<InventoryQuerySettings>,
  id = '1' // root id
): TreeNodeType & {
  query?: InventoryQuerySettings;
  isFolder?: boolean;
} {
  if (isTypeOf<FavoritesLeafItem<InventoryQuerySettings>>(data, 'itemContent')) {
    return { id, name: data.name, query: data.itemContent, children: [] };
  }
  const children = data.folderContent?.map((item, index) => {
    return transformDataToInventoryNode(item, `${id}.${index + 1}`);
  });

  return { id, name: data.name, isFolder: true, children };
}

export function pathExists(obj, path) {
  if (path.length === 0) {
    return true;
  }

  if (!obj || !obj.folderContent || obj.folderContent.length === 0) {
    return false;
  }

  const [current] = path;
  for (let i = 0; i < obj.folderContent.length; i++) {
    const item = obj.folderContent[i];
    if (item.name === current) {
      return pathExists(item, path.slice(1));
    }
  }

  return false;
}

export const getCardTitle = (libraryName: string) => {
  switch (libraryName) {
    case 'explorer.userFavorites':
      return 'My org queries';
    case 'explorer.presets':
      return 'Suggested queries';
    default:
      return null;
  }
};
