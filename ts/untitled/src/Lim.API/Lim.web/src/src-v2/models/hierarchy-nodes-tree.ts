import _ from 'lodash';
import { makeAutoObservable } from 'mobx';

export interface HierarchicalRecord {
  key: string;
  name: string;
  hierarchy: { key: string; name: string }[];
  checked?: boolean;
}

export class TreeNode<TItem extends HierarchicalRecord = HierarchicalRecord> {
  /* eslint-disable no-use-before-define */

  key: string;
  name: string;
  visible = true;

  children: TreeNode<TItem>[];
  visibleChildren: TreeNode<TItem>[];
  item: TItem;

  private selfChecked = false;
  private readonly noCascade: boolean = false;
  private parent: TreeNode<TItem>;

  /* eslint-enable no-use-before-define */

  constructor(
    option: TItem,
    tree: _.Dictionary<TItem[]>,
    noCascade: boolean,
    parent?: TreeNode<TItem>
  ) {
    this.key = option.key;
    this.name = option.name;
    this.noCascade = noCascade;
    this.parent = parent;
    this.item = option;

    const children =
      tree[option.key]?.map(child => new TreeNode(child, tree, noCascade, this)) ?? [];
    this.children = sortTreeNodes(children);
    this.visibleChildren = this.children;

    this.checked = option.checked ?? false;

    makeAutoObservable(this);
  }

  public get checked() {
    return this.noCascade || !this.children.length
      ? this.selfChecked
      : this.children?.every(child => child.checked);
  }

  public get indeterminate(): boolean {
    if (this.noCascade) {
      return false;
    }

    return this.children.length
      ? this.children?.some(child => child.indeterminate)
      : this.selfChecked;
  }

  public get hasActiveChildren() {
    return this.children?.some(child => child.isActive);
  }

  public set checked(value: boolean) {
    if (this.noCascade || !this.children.length) {
      this.selfChecked = value;
    }

    this.children.forEach(child => (child.checked = value));
  }

  filter(searchTerm?: string) {
    this.visible = !searchTerm || this.name.toLowerCase().includes(searchTerm.toLowerCase());
    this.children.forEach(node => node.filter(searchTerm));

    this.visibleChildren = this.children.filter(child => child.visible);
  }

  public get hasParent() {
    return this.parent?.visible;
  }

  public get totalChildrenCount(): number {
    return this.children?.length
      ? _.sum(this.children?.map(child => child.totalChildrenCount)) + 1
      : 1;
  }

  private get isActive(): boolean {
    return this.selfChecked || this.children?.some(child => child.isActive);
  }
}

export class HierarchyNodesTree<TItem extends HierarchicalRecord> {
  private readonly tree: TreeNode<TItem>[];
  public visibleTree: TreeNode<TItem>[];

  constructor(options: TItem[], noCascade: boolean = true) {
    const keyToOption = _.keyBy(options, 'key');
    const [hierarchyFilterOptions, firstLevelOptions] = _.partition(options, option => {
      const parentKey = _.last(option.hierarchy)?.key;
      return Boolean(parentKey) && Boolean(keyToOption[parentKey]);
    });

    const parentKeyToFilterOption = _.groupBy(
      hierarchyFilterOptions,
      option => _.last(option.hierarchy).key
    );

    this.tree = sortTreeNodes(
      firstLevelOptions.map(
        (option: TItem) => new TreeNode(option, parentKeyToFilterOption, noCascade)
      )
    );

    this.visibleTree = this.tree;
    makeAutoObservable(this);
  }

  public updateCheckState(checkedKeys: string[]) {
    const checked = _.keyBy(checkedKeys, _.identity);

    flatTreeNodes(this.tree).forEach(node => {
      if (node.checked && !checked[node.key]) {
        node.checked = false;
      } else if (!node.checked && checked[node.key]) {
        node.checked = true;
      }
    });
  }

  public filter(searchTerm?: string) {
    this.tree.forEach(node => node.filter(searchTerm));
    this.visibleTree = flatTreeNodes(this.tree).filter(node => node.visible && !node.hasParent);
  }

  public get checkedTree(): TreeNode<TItem>[] {
    return flatTreeNodes(this.tree).filter(node => node.checked);
  }

  public get checkedItems(): TItem[] {
    return this.checkedTree.map(node => node.item);
  }
}

function flatTreeNodes<TItem extends HierarchicalRecord>(
  tree: TreeNode<TItem>[]
): TreeNode<TItem>[] {
  if (!tree.length) {
    return [];
  }

  return tree.flatMap(node => [node, ...flatTreeNodes(node.children)]);
}

function sortTreeNodes<TItem extends HierarchicalRecord>(
  tree: TreeNode<TItem>[]
): TreeNode<TItem>[] {
  return _.orderBy(tree, [node => node.totalChildrenCount, 'name'], ['desc', 'asc']);
}
