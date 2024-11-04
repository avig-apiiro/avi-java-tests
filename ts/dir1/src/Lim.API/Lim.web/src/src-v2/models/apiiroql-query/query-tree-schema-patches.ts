import { ApiiroQlSchemaVariant } from './apiiroql-schema-variant';
import {
  ApiDocQuerySchemaGenerationOptions,
  ApiiroQlSchema,
  SchemaPatches,
} from './query-tree-schema-builder';

export function createSchemaGenerationOptions(
  apiiroQlSchema: ApiiroQlSchema,
  schemaVariant?: ApiiroQlSchemaVariant
): ApiDocQuerySchemaGenerationOptions {
  return {
    isObjectTypeHidden: objectTypeName =>
      objectTypeName === 'InventoryBag' || objectTypeName.indexOf('`') !== -1,
    schemaPatches,
    openEnums: apiiroQlSchema.openEnums,
    orderedEnums: ['BusinessImpact', 'RiskLevel'],
    schemaVariant,
  };
}

const schemaPatches: SchemaPatches = {
  __any: {
    properties: {
      insightBadges: {
        hide: true,
      },
    },
  },

  DiffableInsight: {
    properties: {
      badge: {
        openEnumName: 'insightBadges',
      },
    },
  },

  RiskTriggerInsight: {
    properties: {
      badge: {
        openEnumName: 'insightBadges',
      },
    },
  },

  SensitiveData: {
    properties: {
      sensitiveDataTypes: {
        openEnumName: 'sensitiveDataTypes',
      },
    },
  },

  ApiElement: {
    properties: {
      httpMethod: {
        enumValues: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'],
        openEnum: true,
      },
      usedFrameworks: {
        openEnumName: 'frameworkNamesEnum',
      },
      sensitiveDataTypes: {
        openEnumName: 'sensitiveDataTypes',
      },
    },
  },

  CodeFinding: {
    properties: {
      provider: {
        openEnumName: 'codeScanProviderEnum',
      },
    },
  },

  DependencyFinding: {
    properties: {
      provider: {
        openEnumName: 'codeScanProviderEnum',
      },
    },
  },
  ProcessedFinding: {
    properties: {
      sourceProviders: {
        openEnumName: 'codeScanProviderEnum',
        openEnum: true,
      },
    },
  },
  ProcessedDependencyFinding: {
    properties: {
      sourceProviders: {
        openEnumName: 'codeScanProviderEnum',
        openEnum: true,
      },
    },
  },
  LightweightFinding: {
    properties: {
      sourceProviders: {
        openEnumName: 'codeScanProviderEnum',
        openEnum: true,
      },
    },
  },

  CodeProfile: {
    properties: {
      technologies: {
        openEnumName: 'frameworkNamesEnum',
      },
    },
  },

  RepositoryProfile: {
    properties: {
      technologies: {
        openEnumName: 'frameworkNamesEnum',
        openEnum: true,
      },
    },
  },

  ModuleProfile: {
    properties: {
      technologies: {
        openEnumName: 'frameworkNamesEnum',
        openEnum: true,
      },
    },
  },

  RepositoryCoverage: {
    properties: {
      providers: {
        openEnumName: 'coverageProviderEnum',
        openEnum: true,
      },
    },
  },

  FrameworkUsage: {
    properties: {
      name: {
        openEnumName: 'frameworkNamesEnum',
        openEnum: true,
      },
    },
  },

  RiskTriggerSummary: {
    properties: {
      sources: {
        openEnumName: 'codeScanProviderEnum',
      },
    },
  },

  Secret: {
    properties: {
      sources: {
        openEnumName: 'codeScanProviderEnum',
      },
    },
  },
};
