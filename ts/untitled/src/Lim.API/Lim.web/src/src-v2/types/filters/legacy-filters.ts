export interface LegacyFilterOption {
  name: string;
  displayName: string;
  sortOrder: number;
  group: string;
  groupOrder: number;
  sentiment?: string;
  description?: string;
  hierarchy?: { key: string; name: string }[];
}

export interface LegacyFilterGroup {
  name: string;
  count: number;
  filterType: string;
  displayName: string;
  isGrouped: boolean;
  defaultValue: string;
  defaultValues: string[];
  isAdditional: boolean;
  sortOrder?: number;
  filterOptions: LegacyFilterOption[];
  supportedOperators: ('And' | 'Or')[];
}
