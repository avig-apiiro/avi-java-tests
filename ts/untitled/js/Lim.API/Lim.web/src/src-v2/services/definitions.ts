import { ApiClient } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import DefinitionConsts from '@src/blocks/GovernancePage/blocks/Definitions/DefinitionConsts';
import { ruleFormatToDefinition } from '@src/blocks/GovernancePage/blocks/definitionOptionsUtils';

interface ProcessTag {
  key: string;
  name: string;
  processName: string;
  type: string;
}

export interface Definition {
  apiClassification?: string;
  filePath?: string;
  type: string;
  fullDisplayName: string;
  partialDisplayName: string;
  termsCount?: number;
  key: string;
  repositoryKey?: string;
  ordinalId: number;
  name: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  hasName: boolean;
  isDisabled: boolean;
  lastDisabledAt?: Date;
  lastDisabledBy?: string;
  wildcards?: string[];
  exactMatch?: string[];
  assetCollectionKeys?: string[];
  components?: string[];
  multipleTokens?: string[];
  frameworkDescription?: string;
  frameworkGroup?: string;
  frameworkName?: string;
  frameworkType?: string;
  language?: string;
  packageImports?: string;
  allAssetCollections?: boolean;
  allProjects?: boolean;
  processTag?: ProcessTag;
  processTagKey?: string;
  projectKeys?: string[];
  titles?: string[];
  types?: string[];
  labels?: string[];
}

export interface SecretsExclusionDefinition extends Definition {
  filesPathRegex: string[];
  regexMatch: string[];
  repositoryKeys: string[];
  anyRepository: boolean;
  applicationKeys: string[];
  anyApplication: boolean;
  applications?: Partial<LeanConsumableProfile>[];
  repositories?: Partial<LeanConsumableProfile>[];
}

export class Definitions {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: { apiClient: ApiClient; asyncCache: AsyncCache }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  getDefinitions(): Promise<Partial<Definition>[]> {
    return this.#client.get('definitions');
  }

  async applyDefinition({
    definitionRaw,
    definitionType,
  }: {
    definitionRaw: Definition;
    definitionType: string;
  }) {
    let updatePath;
    let definition;

    switch (definitionType) {
      case DefinitionConsts.types.API:
        updatePath = DefinitionConsts.apiPathByType.API;
        definition = ruleFormatToDefinition(definitionRaw);
        break;
      case DefinitionConsts.types.Issue:
        updatePath = DefinitionConsts.apiPathByType.Issue;
        definition = {
          ...definitionRaw,
          projectKeys: definitionRaw.allProjects ? [] : definitionRaw.projectKeys,
          assetCollections: null,
        };
        break;
      case DefinitionConsts.types.UserStory:
        updatePath = DefinitionConsts.apiPathByType.UserStory;
        definition = {
          ...definitionRaw,
          projectKeys: definitionRaw.allProjects ? [] : definitionRaw.projectKeys,
          assetCollections: null,
        };
        break;
      case DefinitionConsts.types.InternalFramework:
        updatePath = DefinitionConsts.apiPathByType.InternalFramework;
        definition = {
          ...definitionRaw,
          projectKeys: definitionRaw.allProjects ? [] : definitionRaw.projectKeys,
          assetCollections: null,
        };
        break;
      case DefinitionConsts.types.CustomSensitiveData:
        updatePath = DefinitionConsts.apiPathByType.CustomSensitiveData;
        definition = definitionRaw;
        break;
      case DefinitionConsts.types.SecretsExclusion:
        updatePath = DefinitionConsts.apiPathByType.SecretsExclusion;
        definition = {
          ...definitionRaw,
          applicationKeys: (definitionRaw as SecretsExclusionDefinition)?.applications?.map(
            app => app.key
          ),
          repositoryKeys: (definitionRaw as SecretsExclusionDefinition)?.repositories?.map(
            repo => repo.key
          ),
        };
        break;
      default:
        console.error(`Unsupported definition type given ${definitionType}`);
    }

    await this.#client.put(`definitions/${updatePath}`, definition);
    this.#asyncCache.invalidateAll(this.getDefinitions);
  }

  async removeDefinition({
    definition,
    type,
  }: {
    definition: Definition;
    type: keyof typeof DefinitionConsts.apiPathByType;
  }) {
    await this.#client.delete(
      `definitions/${DefinitionConsts.apiPathByType[type]}/${definition.key}`
    );
    this.#asyncCache.invalidateAll(this.getDefinitions);
  }

  getSecretsExclusionDefinitions(): Promise<Definition[]> {
    return this.getDefinitionsByType({
      type: 'secretExclusionDefinitions',
    });
  }

  getDefinitionsByType({ type }: { type: string }): Promise<Definition[]> {
    return this.#client.get(`definitions/${type}`);
  }
}
