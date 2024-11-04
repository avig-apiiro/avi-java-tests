import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';

export interface DeployKey {
  key: string;
  title: string;
  createdBy: LeanDeveloper;
  createdAt: Date;
  lastUsed: Date;
  readOnly: boolean;
}
