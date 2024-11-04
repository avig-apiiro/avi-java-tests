import { Connection } from '@src-v2/types/connector/connectors';

type BranchTagsType = {
  [key: string]: string;
};

export type ChangedDataType = {
  branchesToMonitor?: string[];
  branchesToUnmonitor?: string[];
  branchTags: BranchTagsType;
};

export type ConfirmationMultiBranchModalProps = {
  repositoryKey: string;
  repositoryName: string;
  changedData?: ChangedDataType;
  onClose?: () => void;
};

type BranchType = {
  isSuggested?: boolean;
  key: string;
  label: string;
  name: string;
};

type SuggestedBranchType = { branchName: string; reasons?: string[] };

export type InsightsCellProps = {
  branch: BranchType;
  defaultBranch: string;
  changedData?: ChangedDataType;
  monitoredBranches?: BranchType[];
  suggestedBranches?: SuggestedBranchType[];
  setChangedData: (BranchType) => void;
  setSuggestedBranches: (BranchType) => void;
  setMonitoredBranches: (BranchType) => void;
};

export type LabelCellProps = {
  branch: BranchType;
  changedData?: ChangedDataType;
  setChangedData: (BranchType) => void;
};

export type SuggestedCarouselItemProps = {
  name: string;
  reasons?: string[];
  monitorDisabled?: boolean;
  onClick: () => void;
  maxMonitorSize: number;
};

export type MultiBranchProps = {
  repositoryKey: string;
  maxMonitorSize?: number;
  changedData?: ChangedDataType;
  setChangedData: (ChangedDataType) => void;
};

export type ProviderRepositoryDataType = {
  defaultBranch?: string;
  monitoredBranches?: BranchType[];
  suggestedBranches?: SuggestedBranchType[];
  key?: string;
  name?: string;
  server?: Connection;
};
