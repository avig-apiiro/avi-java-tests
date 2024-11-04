/*eslint no-use-before-define: "off"*/
import _ from 'lodash';
import { apiiroQlOperatorSupportRegistry } from './apiiroql-generator';

export type QExpression =
  | QBooleanCombination
  | QPropertyPredicate
  | QHasPredicate
  | QNegatedHasPredicate
  | QNamePredicate
  | QInsightBadgePredicate
  | QNegatedInsightBadgePredicate
  | QTypeSwitchPredicate;

export type QBooleanCombination = {
  type: 'boolean';
  combiner: 'or' | 'and';
  subExpressions: QExpression[];
};

export type QPropertyPredicateOperator =
  | '='
  | '!='
  | '>='
  | '<='
  | '<'
  | '>'
  | 'ct'
  | 'nct'
  | 'stw'
  | 'enw'
  | 'nenw'
  | 'nstw'
  | 'itl'
  | 'nitl'
  | 'inc'
  | 'ninc'
  | 'itn'
  | 'nitn';

export type QPropertyPredicate = {
  type: 'property';
  property: string;
  operator: QPropertyPredicateOperator;
  operand: string;
};

export type QHasPredicate = {
  type: 'relationship';
  relationshipName: string;
  relationshipQuery: QExpression;
};

export type QNegatedHasPredicate = {
  type: 'negatedRelationship';
  relationshipName: string;
  relationshipQuery: QExpression;
};

export type QNamePredicate = {
  type: 'name';
  operator: string;
  operand: string;
};

export type QInsightBadgePredicate = {
  type: 'hasInsight';
  insightBadge: string;
};

export type QNegatedInsightBadgePredicate = {
  type: 'negatedHasInsight';
  insightBadge: string;
};

export type QTypeSwitchPredicate = {
  type: 'typeSwitch';
  typeQueries: {
    typeSelector: string;
    query: QExpression | null;
  }[];
};

export type ExpressionTypeNames = QExpression['type'];
export type ExpressionTypeByName = {
  [typeName in ExpressionTypeNames]: QExpression & { type: typeName };
};

function objectTypeSupportsHasInsight(objectType: QExpressionObjectSchema) {
  const insightRelationshipSchema = objectType.relationships.find(r => r.id === 'insights');
  return (
    insightRelationshipSchema?.targetType === 'DiffableInsight' ||
    insightRelationshipSchema?.targetType === 'RiskTriggerInsight'
  );
}

const ExpressionCreators: {
  [typename in ExpressionTypeNames]: (
    fullSchema: QExpressionSchema,
    objectTypeName: string
  ) => ExpressionTypeByName[typename];
} = {
  boolean: (fullSchema, objectTypeName) => ({
    type: 'boolean',
    combiner: 'and',
    subExpressions: [CreateDefaultExpression(fullSchema, objectTypeName)],
  }),

  property: (fullSchema, objectTypeName) => {
    const objectType = fullSchema[objectTypeName];
    return (
      objectType.properties[0] && {
        type: 'property',
        operator: apiiroQlOperatorSupportRegistry[objectType.properties[0].dataType][0].operator,
        operand: objectType.properties[0].enumValues ? objectType.properties[0].enumValues[0] : '',
        property: objectType.properties[0].id,
      }
    );
  },

  relationship: (fullSchema, objectTypeName) => {
    const objectType = fullSchema[objectTypeName];
    return (
      objectType.relationships[0] && {
        type: 'relationship',
        relationshipQuery: null,
        relationshipName: objectType.relationships[0].id,
      }
    );
  },

  negatedRelationship: (fullSchema, objectTypeName) => {
    const objectType = fullSchema[objectTypeName];
    return (
      objectType.relationships[0] && {
        type: 'negatedRelationship',
        relationshipQuery: null,
        relationshipName: objectType.relationships[0].id,
      }
    );
  },

  name: (fullSchema, objectTypeName) => {
    const objectType = fullSchema[objectTypeName];
    return (
      objectType.naming && {
        type: 'name',
        operator: '=',
        operand: '',
      }
    );
  },

  hasInsight: (fullSchema, objectTypeName) => {
    const objectType = fullSchema[objectTypeName];

    if (!objectTypeSupportsHasInsight(objectType)) {
      return null;
    }

    return {
      type: 'hasInsight',
      insightBadge: '',
    };
  },

  negatedHasInsight: (fullSchema, objectTypeName) => {
    const objectType = fullSchema[objectTypeName];

    if (!objectTypeSupportsHasInsight(objectType)) {
      return null;
    }

    return {
      type: 'negatedHasInsight',
      insightBadge: '',
    };
  },

  typeSwitch: (fullSchema, objectTypeName) => {
    const subtypeOptions = getObjectSubtypeOptions(objectTypeName, fullSchema);
    if (!subtypeOptions?.length) {
      return null;
    }

    return {
      type: 'typeSwitch',
      typeQueries: [
        {
          typeSelector: subtypeOptions[0],
          query: null,
        },
      ],
    };
  },
};

export function CreateDefaultExpression(
  fullSchema: QExpressionSchema,
  objectTypeName: string,
  typename?: ExpressionTypeNames
): QExpression {
  return typename
    ? ExpressionCreators[typename](fullSchema, objectTypeName)
    : ExpressionCreators.property(fullSchema, objectTypeName) ||
        ExpressionCreators.relationship(fullSchema, objectTypeName) ||
        ExpressionCreators.typeSwitch(fullSchema, objectTypeName);
}

export type QExpressionPropertyDataType =
  | 'aqlNumber'
  | 'aqlString'
  | 'aqlBoolean'
  | 'aqlTime'
  | 'aqlStringList';

export type QExpressionObjectSchemaProperty = {
  id: string;
  displayName: string;
  description: string;
  apiiroQlGenerator: (subject: string) => string;
  dataType: QExpressionPropertyDataType;
  enumValues?: string[];
  openEnum?: boolean;
  unorderedEnum?: boolean;
};

export type QExpressionObjectSchemaRelationship = {
  id: string;
  displayName: string;
  description: string;
  apiiroQlMatchPredicateGenerator: (
    subject: string,
    predicateGenerator: (subject: string) => string
  ) => string;
  apiiroQlExistsGenerator: (subject: string) => string;
  targetType: string;
};

export type QExpressionObjectSchema = {
  supertypes: string[];
  properties: QExpressionObjectSchemaProperty[];
  relationships: QExpressionObjectSchemaRelationship[];
  naming?: {
    apiiroQlGetterGenerator: (subject: string) => string;
  };
};

export type QExpressionSchema = Record<string, QExpressionObjectSchema>;

export function getFullObjectSchema(
  object: QExpressionObjectSchema,
  _fullSchema: QExpressionSchema
): QExpressionObjectSchema {
  // Current schema format includes all supertype properties in subtypes
  return object;
}

export function getObjectSubtypeOptions(
  objectTypeName: string,
  fullSchema: QExpressionSchema
): string[] {
  const ret: string[] = [];
  const fullSchemaEntries = Object.entries(fullSchema);

  const subtypeQueue = [objectTypeName];
  for (let idx = 0; idx < subtypeQueue.length; idx++) {
    const subtypeName = subtypeQueue[idx];

    const newSubTypes = fullSchemaEntries
      .filter(([_name, schema]) => schema.supertypes.indexOf(subtypeName) >= 0)
      .map(([name]) => name);

    subtypeQueue.push(...newSubTypes);
    ret.push(...newSubTypes);
  }

  return _.uniq(ret);
}
