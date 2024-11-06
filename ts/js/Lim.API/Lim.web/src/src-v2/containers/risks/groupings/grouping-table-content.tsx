import {
  GroupingDoubleLineTitle,
  RisksCountersCell,
  TitleRisksCell,
  TotalRisksCell,
} from '@src-v2/containers/risks/groupings/grouping-common-cells';

const defaultGroupingCells = [
  {
    key: 'risks',
    label: 'Risks',
    Cell: RisksCountersCell,
  },
  {
    key: 'total-risks',
    label: 'Total risks',
    Cell: TotalRisksCell,
  },
];

export const secretHashGroupingColumns = [
  {
    key: 'secret-digest',
    label: 'Secret digest',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const dependencyNameVersionGroupingColumns = [
  {
    key: 'dependency-name-version',
    label: 'Dependency name and version',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const CweGroupingColumns = [
  {
    key: 'cwe',
    label: 'CWE',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const dependencyNameGroupingColumns = [
  {
    key: 'dependency-name',
    label: 'Dependency name',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const repositoryGroupingColumns = [
  {
    key: 'repository',
    label: 'Repository',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const governanceRuleGroupingColumns = [
  {
    key: 'policy',
    label: 'Policy name',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const applicationGroupingColumns = [
  {
    key: 'application',
    label: 'Application',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const componentGroupingColumns = [
  {
    key: 'component',
    label: 'Component',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const endPointGroupingColumns = [
  {
    key: 'end-point',
    label: 'End Point',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const sastGroupingColumns = [
  {
    key: 'sast',
    label: 'Sast',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

export const CodeModuleGroupingColumns = [
  {
    key: 'code-module',
    label: 'Code Module',
    Cell: GroupingDoubleLineTitle,
  },
  ...defaultGroupingCells,
];

export const ArtifactGroupingColumns = [
  {
    key: 'artifact',
    label: 'Artifact',
    Cell: TitleRisksCell,
  },
  ...defaultGroupingCells,
];

enum GROUPING_TYPES {
  DEPENDENCY_NAME_VERSION = 'DependencyNameVersion',
  DEPENDENCY_NAME = 'DependencyName',
  REPOSITORY = 'Repository',
  COMPONENT = 'Component',
  END_POINT = 'EndPoint',
  SAST = 'Sast',
  SECRET_HASH = 'SecretHash',
  ASSET_COLLECTION = 'AssetCollection',
  GOVERNANCE_RULE = 'GovernanceRule',
  CODE_MODULE = 'CodeModule',
  CWE = 'CWE',
  ARTIFACT = 'Artifact',
}

// This list goes one by one with GroupedByType.cs file
export const groupingColumnsMapper: { [key in GROUPING_TYPES]: any[] } = {
  [GROUPING_TYPES.ARTIFACT]: ArtifactGroupingColumns,
  [GROUPING_TYPES.CWE]: CweGroupingColumns,
  [GROUPING_TYPES.DEPENDENCY_NAME_VERSION]: dependencyNameVersionGroupingColumns,
  [GROUPING_TYPES.DEPENDENCY_NAME]: dependencyNameGroupingColumns,
  [GROUPING_TYPES.REPOSITORY]: repositoryGroupingColumns,
  [GROUPING_TYPES.COMPONENT]: componentGroupingColumns,
  [GROUPING_TYPES.END_POINT]: endPointGroupingColumns,
  [GROUPING_TYPES.SAST]: sastGroupingColumns,
  [GROUPING_TYPES.SECRET_HASH]: secretHashGroupingColumns,
  [GROUPING_TYPES.ASSET_COLLECTION]: applicationGroupingColumns,
  [GROUPING_TYPES.GOVERNANCE_RULE]: governanceRuleGroupingColumns,
  [GROUPING_TYPES.CODE_MODULE]: CodeModuleGroupingColumns,
};
