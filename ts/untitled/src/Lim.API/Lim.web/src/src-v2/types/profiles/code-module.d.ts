import { Language } from '@src-v2/types/enums/language';

export interface CodeModule {
  key: string;
  name: string;
  root: string;
  repositoryKey: string;
  isSensitive: boolean;
  languages: Language[];
}
