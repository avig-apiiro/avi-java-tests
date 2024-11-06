import _ from 'lodash';
import { observer } from 'mobx-react';
import { ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FilterSelect } from '@src-v2/components/filters/inline-control/components/filter-select';
import { FilterGeneralSelectProps } from '@src-v2/components/filters/inline-control/containers/filter-general-select';
import { HierarchyTreeView } from '@src-v2/components/hierarchy-tree-view';
import { Popover } from '@src-v2/components/tooltips/popover';
import { FilterOperation, FilterOption, isHierarchyFilterOption } from '@src-v2/hooks/use-filters';
import { HierarchyNodesTree, TreeNode } from '@src-v2/models/hierarchy-nodes-tree';

export type HierarchyFilterGeneralSelectProps = Pick<
  FilterGeneralSelectProps,
  'filter' | 'activeValues' | 'searchable' | 'onClear' | 'onClose'
> & {
  noCascade?: boolean;
  onChange?: (operations: FilterOperation | FilterOperation[]) => void;
};

export const HierarchyFilterGeneralSelect = observer(
  ({
    filter,
    activeValues,
    searchable = true,
    noCascade,
    onChange,
    onClear,
    onClose,
  }: HierarchyFilterGeneralSelectProps) => {
    const filterTreeModel = useMemo(() => {
      return new HierarchyNodesTree(
        filter.options?.map(option => ({
          key: option.value,
          name: option.title,
          hierarchy: isHierarchyFilterOption(option) ? option.hierarchy : [],
        })),
        noCascade
      );
    }, [filter.options]);

    const activeFilterValues = useMemo(
      () => activeValues?.[filter.key]?.values ?? [],
      [activeValues, filter.key]
    );

    useEffect(
      () => filterTreeModel.updateCheckState(activeFilterValues),
      [activeValues?.[filter.key]]
    );

    const handleChange = useCallback(
      (node: TreeNode, checked: boolean) => {
        if (!onChange) {
          return;
        }

        const operations = noCascade
          ? generateHierarchyFilterChangedPayload(filter.key, checked, node.key, filter.options)
          : getTreeNodeCheckedValues(node).map(value => ({
              key: filter.key,
              value,
              multiple: true,
              checked,
            }));
        return onChange(operations);
      },
      [activeValues, filterTreeModel, noCascade]
    );

    const clearSearchTerm = useCallback(() => filterTreeModel.filter(), [filterTreeModel]);

    const handleClose = useCallback(() => {
      onClear?.(filter.key);
      onClose?.();
    }, [onClear]);

    const handleSearch = useCallback(
      ({ target }: ChangeEvent<HTMLInputElement>) =>
        filterTreeModel.filter(target.value.toLowerCase()),
      [filter]
    );

    return (
      <FilterSelect
        data-test-marker="filter"
        label={filter.title}
        popover={FilterPopover}
        defaultOpen={filter.defaultOpen}
        activeValues={useMemo(
          () =>
            activeFilterValues
              ?.map(value => filter.options.find(option => option.value === value))
              .filter(Boolean),
          [activeFilterValues, filter.options]
        )}
        onSearch={searchable ? handleSearch : undefined}
        onHide={clearSearchTerm}
        onClose={activeFilterValues?.length ? handleClose : undefined}
        renderItem={option => option.title}>
        {filterTreeModel.visibleTree.map(treeNode => (
          <HierarchyTreeView
            key={treeNode.key}
            node={treeNode}
            defaultOpen={treeNode.indeterminate}
            onChange={handleChange}
          />
        ))}
      </FilterSelect>
    );
  }
);

const FilterPopover = styled(FilterSelect.Popover)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 120rem;

  ${Popover.Content} {
    max-height: 170rem;
  }
`;

function getTreeNodeCheckedValues(node: TreeNode): string[] {
  if (node.children.length) {
    return node.children.flatMap(getTreeNodeCheckedValues);
  }

  return [node.key];
}

export function generateHierarchyFilterChangedPayload(
  key: string,
  checked: boolean,
  checkedValue: string,
  filterOptions: FilterOption[]
) {
  if (_.isArray(checkedValue)) {
    return {
      key,
      value: checkedValue,
      multiple: true,
      checked,
    };
  }

  const checkedChildren = filterOptions
    .filter(
      option => isHierarchyFilterOption(option) && _.some(option.hierarchy, { key: checkedValue })
    )
    .map(option => option.value);

  return _.uniq([checkedValue, ...checkedChildren]).map(value => ({
    key,
    multiple: true,
    checked,
    value,
  }));
}
