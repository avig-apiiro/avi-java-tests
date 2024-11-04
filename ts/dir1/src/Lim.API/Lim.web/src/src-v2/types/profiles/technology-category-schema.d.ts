import { LeanRepositoryConsumable } from '@src-v2/types/profiles/lean-consumable';
import { CodeReference } from '@src-v2/types/risks/code-reference';

interface TechnologyElementSchema {
  key: string;
  label: string;
  value?: string;
}

interface TechnologySubCategorySchema {
  subcategory: string;
  technologies: TechnologyElementSchema[];
}

export interface TechnologyCategorySchema {
  key: string;
  category: string;
  subCategory: TechnologySubCategorySchema[];
}

export interface TechnologyUsageSchema {
  key: string;
  category: string;
  subCategory: string;
  technology: string;
  codeReferences: CodeReference[];
  repository: LeanRepositoryConsumable;
}
