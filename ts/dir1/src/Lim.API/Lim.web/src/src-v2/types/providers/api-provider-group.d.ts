import { ProviderGroupBase } from '@src-v2/types/providers-base';

export type ApiProviderGroup = ProviderGroupBase & {
  iconNames: string[];
  url: string;
};
