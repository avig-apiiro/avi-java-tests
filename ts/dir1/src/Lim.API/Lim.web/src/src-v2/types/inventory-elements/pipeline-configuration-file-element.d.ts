import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { CodeReference } from '@src-v2/types/risks/code-reference';

export interface PipelineBuildDependency {
  name: string;
  versions: string[];
  declarations: { codeReference: CodeReference }[];
}

export interface PipelineBuildDependencyDeclaration {
  name: string;
  version: string;
  codeReference;
}

export interface CicdPipelineDependencyDeclarationElement extends BaseElement {
  id: string;
  version: string;
  relativePath: string;
  cicdPipelineEntityId: string;
  codeReference: CodeReference;
  dependencyType: string;
  cicdPipelineTechnology: string;
  ciCdIacFramework: string;
}

export interface PipelineConfigurationFileElement extends BaseElement {
  id: string;
  iacFramework: string;
  version: string;
  relativePath: string;
  codeReferences: CodeReference[];
  pipelineBuildDependency: PipelineBuildDependency[];
  cicdPipelineDependencyDeclarations: CicdPipelineDependencyDeclarationElement[];
}

export interface PipelineDependencyDeclarations {
  id: string;
  name: string;
  version: string;
  lines: number[];
  codeReference: Partial<CodeReference>;
  relatedProfile?: Partial<LeanConsumableProfile>;
}
