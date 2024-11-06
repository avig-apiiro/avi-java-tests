import { FC, ReactNode } from 'react';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StyledProps } from '@src-v2/types/styled';

export type Cell<T> = FC<{ data: T } & StyledProps>;

export interface Column<T> {
  key?: string;
  label: ReactNode;
  width?: string | number;
  minWidth?: string;
  resizeable?: boolean;
  draggable?: boolean;
  fieldName?: string;
  sortable?: boolean;
  betaFeature?: FeatureFlag;
  hidden?: boolean;
  nestedColumns?: Column<T>[];
  Cell: Cell<T>;
}
