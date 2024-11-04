import { FilterOption } from '@src-v2/hooks/use-filters';

export interface RemoteOptionsGroup {
  key: string;
  options: FilterOption[];
  title: string;
  type: string;
}
