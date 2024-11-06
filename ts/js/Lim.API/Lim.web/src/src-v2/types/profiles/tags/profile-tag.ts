import { Provider } from '@src-v2/types/enums/provider';

export enum TagSource {
  Manual = 'Manual',
  External = 'External',
  Calculated = 'Calculated',
}

export interface TagResponse {
  key: string;
  name: string;
  value: string;
  source?: TagSource;
  provider?: Provider;
}

export interface TagOption {
  key: string;
  name: string;
  optionalValues: string[];
}

export interface FindingTag {
  key: string;
  value: string;
}
