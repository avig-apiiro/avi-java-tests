import _ from 'lodash';
import { observer } from 'mobx-react';
import { ChangeEvent, forwardRef, useCallback, useEffect, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { Divider } from '@src-v2/components/divider';
import { CheckboxToggle } from '@src-v2/components/forms';
import { InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { HierarchyTreeView } from '@src-v2/components/hierarchy-tree-view';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading5, SubHeading4 } from '@src-v2/components/typography';
import {
  HierarchicalCodeModule,
  MonoRepo,
} from '@src-v2/containers/applications/creation-form/sections/mono-repo-section';
import { useToggle } from '@src-v2/hooks';
import { HierarchyNodesTree, TreeNode } from '@src-v2/models/hierarchy-nodes-tree';
import { CodeModule } from '@src-v2/types/profiles/code-module';

export const ModulesTreeBoxControl = forwardRef<
  HTMLDivElement,
  { height: number; repository: MonoRepo }
>(({ height, repository }, ref) => {
  const modulesCount = repository?.modules?.length;
  return (
    <ModulesCard ref={ref} height={height}>
      <Heading5>Available modules {modulesCount !== undefined && `(${modulesCount})`}</Heading5>

      <Controller
        name="modules"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <ModulesTree repository={repository} value={value} onChange={onChange} />
        )}
      />
    </ModulesCard>
  );
});

const ModulesCard = styled(Card)<{ height?: number }>`
  display: flex;
  min-height: 90rem;
  height: ${props => props.height ?? 90}rem;
  flex-direction: column;
  gap: 2rem;

  ${SearchInput} {
    width: 100%;
    height: 8rem;
  }

  > ${InputClickableLabel} {
    display: flex;
    align-items: center;
    gap: 2rem;
    cursor: default;
  }
`;

const ModulesTree = observer(
  ({
    repository,
    value,
    onChange,
  }: {
    repository: MonoRepo;
    value?: HierarchicalCodeModule[];
    onChange: (value: HierarchicalCodeModule[]) => void;
  }) => {
    const [showSelectedTree, toggleShowSelectedTree] = useToggle();

    useEffect(() => toggleShowSelectedTree(false), [repository]);

    const treeModel = useMemo(() => {
      if (!repository) {
        return null;
      }
      const chart = buildModulesChart(repository.modules);
      return new HierarchyNodesTree(chart, true);
    }, [repository]);

    useEffect(() => {
      if (!treeModel) {
        return;
      }

      treeModel.updateCheckState(value?.map(module => module.key));
    }, [treeModel, value]);

    const handleChange = useCallback(
      (node: TreeNode<HierarchicalCodeModule>, checked: boolean) => {
        const nextValue = checked
          ? [...treeModel.checkedItems, node.item]
          : treeModel.checkedItems.filter(item => item.key !== node.item.key);
        onChange(nextValue);

        if (!nextValue.length) {
          toggleShowSelectedTree(false);
        }
      },
      [treeModel]
    );

    const handleFilter = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => treeModel.filter(event.target.value),
      [treeModel]
    );

    return (
      <>
        <SearchInput
          variant={Variant.SECONDARY}
          wait={false}
          placeholder="Search by module name..."
          disabled={!repository?.modules.length}
          onChange={handleFilter}
        />

        <TreeWrapper>
          {repository && treeModel?.visibleTree.length ? (
            (showSelectedTree ? treeModel.checkedTree : treeModel.visibleTree).map(node => (
              <HierarchyTreeView
                defaultOpen
                key={node.key}
                node={node}
                hideChildren={showSelectedTree}
                onChange={handleChange}
              />
            ))
          ) : (
            <SubHeading4>
              No items available...
              <br />
              Choose a repository that contains modules.
            </SubHeading4>
          )}
        </TreeWrapper>
        <Divider />

        <InputClickableLabel>
          <CheckboxToggle
            disabled={!treeModel?.checkedItems?.length}
            checked={showSelectedTree}
            onChange={toggleShowSelectedTree}
          />
          Show only selected modules ({treeModel?.checkedItems?.length ?? 0})
        </InputClickableLabel>
      </>
    );
  }
);

const TreeWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: stretch;
  overflow: auto;

  > ${SubHeading4} {
    margin: auto;
    text-align: center;
  }
`;

function buildModulesChart(modules: CodeModule[] = []): HierarchicalCodeModule[] {
  if (!modules.length) {
    return [];
  }

  const moduleByPartialKey = _.keyBy(modules, module => _.last(module.key.split('/')));

  return modules.map(module => {
    let parentPartialKeys = module.key.split('/');
    parentPartialKeys = _.take(parentPartialKeys, parentPartialKeys.length - 1);

    return {
      ...module,
      hierarchy: parentPartialKeys
        .map(key => {
          const parent = moduleByPartialKey[key];
          return parent ? { key: parent.key, name: parent.name } : null;
        })
        .filter(Boolean),
    };
  });
}
