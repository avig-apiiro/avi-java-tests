import { ApiiroQlSchemaVariant } from './apiiroql-schema-variant';
import {
  QExpressionObjectSchema,
  QExpressionPropertyDataType,
  QExpressionSchema,
} from './query-tree-model';
import { createSchemaGenerationOptions } from './query-tree-schema-patches';

export type OpenEnums = {
  codeScanProviderEnum: string[];
  frameworkNamesEnum: string[];
  insightBadges: string[];
  sensitiveDataTypes: string[];
  coverageProviderEnum: string[];
};

export type ApiiroQlSchemaQueriedTypeInfo = {
  name: string;
  schemaVariant: string;
};

/* eslint-disable no-use-before-define */
export type ApiiroQlApiDocsDeclaredProperty = {
  name: string;
  description: string;
  inherited: boolean;
  typeDocumentation: ApiiroQlApiDocsTypeDocumentation;
  excludedFromVariants?: ApiiroQlSchemaVariant[];
  includedInVariants?: ApiiroQlSchemaVariant[];
};
/* eslint-enable no-use-before-define */

export type ApiiroQlApiDocsTypeDocumentationObject = {
  typeTag: 'object';
  description: string;
  properties: ApiiroQlApiDocsDeclaredProperty[];
  supertypes: string[];
};

export type ApiiroQlApiDocsTypeDocumentationLibrary = {
  description: string;
  typeTag: 'library';
  libraryTypeName: string;
  properties: ApiiroQlApiDocsDeclaredProperty[];
};

export type ApiiroQlApiDocsTypeDocumentationTypeRef = {
  typeTag: 'typeRef';
  typeName: string;
};

/* eslint-disable no-use-before-define */
export type ApiiroQlApiDocsTypeDocumentationCallable = {
  typeTag: 'callable';
  description: string;
  returnType: ApiiroQlApiDocsTypeDocumentation;
  parameters: ApiiroQlApiDocsDeclaredProperty[];
};
/* eslint-enable no-use-before-define */

export type ApiiroQlApiDocsTypeDocumentationEnum = {
  typeTag: 'enum';
  description: string;
  values: string[];
};

export type ApiiroQlApiDocsTypeDocumentation =
  | ApiiroQlApiDocsTypeDocumentationObject
  | ApiiroQlApiDocsTypeDocumentationTypeRef
  | ApiiroQlApiDocsTypeDocumentationEnum
  | ApiiroQlApiDocsTypeDocumentationLibrary
  | ApiiroQlApiDocsTypeDocumentationCallable;

export type ApiiroQlApiDocsSignatureDocumentation = {
  signatureName: string;
  description: string;
  expectedReturn: ApiiroQlApiDocsTypeDocumentation;
  inputs: ApiiroQlApiDocsDeclaredProperty[];
  availableLibraries: string[];
};

export type ApiiroQlApiDocs = {
  topLevelTypes: { [typename: string]: ApiiroQlApiDocsTypeDocumentation };
  signatures: ApiiroQlApiDocsSignatureDocumentation[];
};

export type ApiiroQlSchema = {
  apiDocumentation: ApiiroQlApiDocs;
  openEnums: OpenEnums;
  queriedTypeInfo: ApiiroQlSchemaQueriedTypeInfo[];
};

export type SchemaPatches = {
  [typeName: string]: {
    properties: {
      [propertyName: string]: {
        enumValues?: string[];
        openEnum?: boolean;
        openEnumName?: keyof OpenEnums;
        hide?: boolean;
      };
    };
  };
};

export type ApiDocQuerySchemaGenerationOptions = {
  isObjectTypeHidden: (objectTypeName: string) => boolean;
  orderedEnums: string[];
  schemaPatches: SchemaPatches;
  openEnums: OpenEnums;
  schemaVariant?: ApiiroQlSchemaVariant;
};

export function createQExpressionSchemaFromApiiroQlApiDocs(
  apiDocs: ApiiroQlApiDocs,
  options: ApiDocQuerySchemaGenerationOptions
): QExpressionSchema {
  const returnedSchema: QExpressionSchema = {};

  Object.entries(apiDocs.topLevelTypes).forEach(([typename, topLevelType]) => {
    if (topLevelType.typeTag === 'object' && !options.isObjectTypeHidden(typename)) {
      const objectSchema: QExpressionObjectSchema = {
        properties: [],
        relationships: [],
        supertypes: [],
      };

      loadObjectSchemaFromObjectType(topLevelType, s => s, apiDocs, options, objectSchema);
      returnedSchema[typename] = objectSchema;
    }
  });

  const { schemaPatches, openEnums } = options;
  const applyOverrides = (type: QExpressionObjectSchema, overrides: SchemaPatches['x']) => {
    type.properties.forEach(propertyDesc => {
      const propertyOverride = overrides.properties[propertyDesc.id];
      if (propertyOverride) {
        Object.assign(propertyDesc, overrides.properties[propertyDesc.id]);

        if (propertyOverride.openEnumName) {
          propertyDesc.openEnum = true;
          propertyDesc.enumValues = openEnums[propertyOverride.openEnumName];
        }
      }
    });

    Object.entries(overrides.properties).forEach(([propertyId, settings]) => {
      if (settings.hide) {
        type.properties = type.properties.filter(property => property.id !== propertyId);
      }
    });
  };

  Object.keys(returnedSchema).forEach(toplevelTypeName => {
    const toplevelTypeSchema = returnedSchema[toplevelTypeName];
    schemaPatches[toplevelTypeName] &&
      applyOverrides(toplevelTypeSchema, schemaPatches[toplevelTypeName]);
    schemaPatches.__any && applyOverrides(toplevelTypeSchema, schemaPatches.__any);
  });

  return returnedSchema;
}

export function createQExpressionSchemaForQueriedType(
  apiiroQlSchema: ApiiroQlSchema,
  queriedType: string
) {
  return createQExpressionSchemaForVariant(
    apiiroQlSchema,
    apiiroQlSchema.queriedTypeInfo.find(typeInfo => typeInfo.name === queriedType)
      .schemaVariant as ApiiroQlSchemaVariant
  );
}

export function createQExpressionSchemaForVariant(
  apiiroQlSchema: ApiiroQlSchema,
  schemaVariant?: ApiiroQlSchemaVariant
) {
  return createQExpressionSchemaFromApiiroQlApiDocs(
    apiiroQlSchema.apiDocumentation,
    createSchemaGenerationOptions(apiiroQlSchema, schemaVariant)
  );
}

const intrinsicTypes: Record<string, QExpressionPropertyDataType> = {
  String: 'aqlString',
  Boolean: 'aqlBoolean',
  Double: 'aqlNumber',
  DateTime: 'aqlTime',
  'List<String>': 'aqlStringList',
  'Enumerable<String>': 'aqlStringList',
  'Set<String>': 'aqlStringList',
  'ISet`1<String>': 'aqlStringList',
};

const namingPropertyNames: string[] = ['name'];

function addIntrinsicDataTypePropertyToSchema(
  declaredProperty: ApiiroQlApiDocsDeclaredProperty,
  intrinsicDataType: QExpressionPropertyDataType,
  subjectGenerator: (subj: string) => string,
  objectSchema: QExpressionObjectSchema
) {
  objectSchema.properties.push({
    id: declaredProperty.name,
    displayName: declaredProperty.name,
    description: declaredProperty.description,
    apiiroQlGenerator: subject => `${subjectGenerator(subject)}.${declaredProperty.name}`,
    dataType: intrinsicDataType,
    enumValues: intrinsicDataType === 'aqlBoolean' ? ['true', 'false'] : undefined,
  });

  if (!objectSchema.naming && namingPropertyNames.includes(declaredProperty.name)) {
    objectSchema.naming = {
      apiiroQlGetterGenerator: subject => `${subjectGenerator(subject)}.${declaredProperty.name}`,
    };
  }
}

function addEnumDataTypePropertyToSchema(
  declaredProperty: ApiiroQlApiDocsDeclaredProperty,
  targetTypeName: string,
  targetType: ApiiroQlApiDocsTypeDocumentationEnum,
  isCollection: boolean,
  subjectGenerator: (subj: string) => string,
  objectSchema: QExpressionObjectSchema,
  schemaGenerationOptions: ApiDocQuerySchemaGenerationOptions
) {
  objectSchema.properties.push({
    id: declaredProperty.name,
    displayName: declaredProperty.name,
    apiiroQlGenerator: subject => `${subjectGenerator(subject)}.${declaredProperty.name}`,
    dataType: isCollection ? 'aqlStringList' : 'aqlString',
    enumValues: targetType.values,
    unorderedEnum: schemaGenerationOptions.orderedEnums.includes(targetTypeName),
    description: declaredProperty.description,
  });
}

function addCollectionRelationshipPropertyToSchema(
  declaredProperty: ApiiroQlApiDocsDeclaredProperty,
  targetType: string,
  subjectGenerator: (subj: string) => string,
  objectSchema: QExpressionObjectSchema
) {
  objectSchema.relationships.push({
    id: declaredProperty.name,
    displayName: declaredProperty.name,
    description: declaredProperty.description,

    apiiroQlMatchPredicateGenerator(subject, predicateGenerator) {
      return `${subjectGenerator(subject)}.${declaredProperty.name}.any((s) => ${predicateGenerator(
        's'
      )})`;
    },

    apiiroQlExistsGenerator(subject) {
      return `!${subjectGenerator(subject)}.${declaredProperty.name}.empty()`;
    },

    targetType,
  });
}

function addSingularRelationshipPropertyToSchema(
  declaredProperty: ApiiroQlApiDocsDeclaredProperty,
  propertyTypeName: string,
  subjectGenerator: (subj: string) => string,
  objectSchema: QExpressionObjectSchema
) {
  objectSchema.relationships.push({
    id: declaredProperty.name,
    displayName: declaredProperty.name,
    description: declaredProperty.description,

    apiiroQlMatchPredicateGenerator(subject, predicateGenerator) {
      const subjectExpression = `${subjectGenerator(subject)}.${declaredProperty.name}`;
      return `(!!${subjectExpression} && ${predicateGenerator(subjectExpression)})`;
    },

    apiiroQlExistsGenerator(subject) {
      return `!!(${subjectGenerator(subject)}.${declaredProperty.name})`;
    },

    targetType: propertyTypeName,
  });
}

function addRelationshipPropertyToSchema(
  declaredProperty: ApiiroQlApiDocsDeclaredProperty,
  targetTypeName: string,
  targetType: ApiiroQlApiDocsTypeDocumentationObject,
  isCollection: boolean,
  subjectGenerator: (subj: string) => string,
  apiDocs: ApiiroQlApiDocs,
  options: ApiDocQuerySchemaGenerationOptions,
  objectSchema: QExpressionObjectSchema
) {
  if (isCollection) {
    addCollectionRelationshipPropertyToSchema(
      declaredProperty,
      targetTypeName,
      subjectGenerator,
      objectSchema
    );
  } else if (options.isObjectTypeHidden(targetTypeName)) {
    loadObjectSchemaFromObjectType(
      targetType,
      subject => `${subject}.${declaredProperty.name}`,
      apiDocs,
      options,
      objectSchema
    );
  } else {
    addSingularRelationshipPropertyToSchema(
      declaredProperty,
      targetTypeName,
      subjectGenerator,
      objectSchema
    );
  }
}

function loadSuperTypes(
  superTypes: string[],
  apiDocs: ApiiroQlApiDocs,
  options: ApiDocQuerySchemaGenerationOptions
): string[] {
  return superTypes.flatMap(superType => {
    if (options.isObjectTypeHidden(superType)) {
      return loadSuperTypes(
        (apiDocs.topLevelTypes[superType] as ApiiroQlApiDocsTypeDocumentationObject).supertypes,
        apiDocs,
        options
      );
    }

    return [superType];
  });
}

function loadObjectSchemaFromObjectType(
  objectType: ApiiroQlApiDocsTypeDocumentationObject,
  subjectGenerator: (subj: string) => string,
  apiDocs: ApiiroQlApiDocs,
  options: ApiDocQuerySchemaGenerationOptions,
  objectSchema: QExpressionObjectSchema
) {
  objectSchema.supertypes = loadSuperTypes(objectType.supertypes, apiDocs, options);
  objectType.properties
    .filter(
      declaredProperty =>
        !options.schemaVariant ||
        ((!declaredProperty.includedInVariants ||
          declaredProperty.includedInVariants.includes(options.schemaVariant)) &&
          (!declaredProperty.excludedFromVariants ||
            !declaredProperty.excludedFromVariants.includes(options.schemaVariant)))
    )
    .forEach(declaredProperty => {
      const declaredPropertyTypeDoc = declaredProperty.typeDocumentation;

      switch (declaredPropertyTypeDoc.typeTag) {
        case 'typeRef':
          const propertyTypeName = declaredPropertyTypeDoc.typeName;

          // Intrinsic data type?
          const intrinsicDataType = intrinsicTypes[propertyTypeName];
          if (intrinsicDataType) {
            addIntrinsicDataTypePropertyToSchema(
              declaredProperty,
              intrinsicDataType,
              subjectGenerator,
              objectSchema
            );
          } else {
            const isCollection =
              propertyTypeName.startsWith('List<') ||
              propertyTypeName.startsWith('Set<') ||
              propertyTypeName.startsWith('HashSet<') ||
              propertyTypeName.startsWith('Enumerable<') ||
              propertyTypeName.startsWith('ISet<') ||
              propertyTypeName.startsWith('ISet`1<') ||
              propertyTypeName.startsWith('IApiiroQlAsyncEnumerable<');

            const targetTypeName = isCollection
              ? propertyTypeName.substring(
                  propertyTypeName.indexOf('<') + 1,
                  propertyTypeName.indexOf('>')
                )
              : propertyTypeName;

            const targetType = apiDocs.topLevelTypes[targetTypeName];
            switch (targetType?.typeTag) {
              case 'enum':
                addEnumDataTypePropertyToSchema(
                  declaredProperty,
                  targetTypeName,
                  targetType,
                  isCollection,
                  subjectGenerator,
                  objectSchema,
                  options
                );
                break;

              case 'object':
                addRelationshipPropertyToSchema(
                  declaredProperty,
                  targetTypeName,
                  targetType,
                  isCollection,
                  subjectGenerator,
                  apiDocs,
                  options,
                  objectSchema
                );
                break;

              default:
                break;
            }
          }
          break;

        default:
      }
    });
}
