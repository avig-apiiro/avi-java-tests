import {
  ExpressionTypeNames,
  QExpression,
  QExpressionObjectSchema,
  QExpressionPropertyDataType,
  QExpressionSchema,
  QPropertyPredicateOperator,
} from './query-tree-model';

export type QExpressionPropertyStereotype = 'aqlTimeSpan';

type OperatorSupport = {
  operator: QPropertyPredicateOperator;
  displayName: string;
  operandType?: QExpressionPropertyDataType; // Defaults to property type
  operandStereotype?: QExpressionPropertyStereotype;
  generator: (leftOp: string, rightOp: string) => string;
};

function SimpleOperatorGenerator(operator: string) {
  return (leftOp: string, rightOp: string) => `${leftOp} ${operator} ${rightOp}`;
}

const BaseOperatorSupport: OperatorSupport[] = [
  { operator: '=', displayName: '=', generator: SimpleOperatorGenerator('==') },
  { operator: '!=', displayName: '\u2260', generator: SimpleOperatorGenerator('!=') },
  { operator: '>', displayName: '>', generator: SimpleOperatorGenerator('>') },
  { operator: '>=', displayName: '\u2265', generator: SimpleOperatorGenerator('>=') },
  { operator: '<=', displayName: '\u2264', generator: SimpleOperatorGenerator('<=') },
  { operator: '<', displayName: '<', generator: SimpleOperatorGenerator('<') },
];

export const apiiroQlOperatorSupportRegistry: {
  [intrinsicType in QExpressionPropertyDataType]: OperatorSupport[];
} = {
  aqlNumber: [...BaseOperatorSupport],
  aqlString: [
    ...BaseOperatorSupport,

    {
      operator: 'ct',
      displayName: 'contains',
      generator: (l, r) => `Strings.contains(${l}, ${r})`,
    },
    {
      operator: 'nct',
      displayName: 'does not contain',
      generator: (l, r) => `!Strings.contains(${l}, ${r})`,
    },
    {
      operator: 'stw',
      displayName: 'starts with',
      generator: (l, r) => `Strings.startsWith(${l}, ${r})`,
    },
    {
      operator: 'enw',
      displayName: 'ends with',
      generator: (l, r) => `Strings.endsWith(${l}, ${r})`,
    },
    {
      operator: 'nstw',
      displayName: 'does not start with',
      generator: (l, r) => `!Strings.startsWith(${l}, ${r})`,
    },
    {
      operator: 'nenw',
      displayName: 'does not end with',
      generator: (l, r) => `!Strings.endsWith(${l}, ${r})`,
    },
  ],
  aqlBoolean: [{ operator: '=', displayName: '=', generator: SimpleOperatorGenerator('==') }],
  aqlTime: [
    ...BaseOperatorSupport.map(operator => ({
      ...operator,
      operandType: 'aqlTime' as QExpressionPropertyDataType,
    })),
    {
      operator: `itl`,
      displayName: `in the last`,
      operandType: 'aqlNumber',
      operandStereotype: 'aqlTimeSpan',
      generator: (l, r) =>
        `(${l} <= Dates.queryTime()) && (${l} >= Dates.add("day", -${r}, Dates.queryTime()))`,
    },
    {
      operator: `nitl`,
      displayName: `not in the last`,
      operandType: 'aqlNumber',
      operandStereotype: 'aqlTimeSpan',
      generator: (l, r) => `${l} < Dates.add("day", -${r}, Dates.queryTime())`,
    },
    {
      operator: `itn`,
      displayName: `in the next`,
      operandType: 'aqlNumber',
      operandStereotype: 'aqlTimeSpan',
      generator: (l, r) =>
        `(${l} >= Dates.queryTime()) && (${l} <= Dates.add("day", ${r}, Dates.queryTime()))`,
    },
    {
      operator: `nitn`,
      displayName: `not in the next`,
      operandType: 'aqlNumber',
      operandStereotype: 'aqlTimeSpan',
      generator: (l, r) => `${l} > Dates.add("day", ${r}, Dates.queryTime())`,
    },
  ],

  aqlStringList: [
    {
      operator: 'inc',
      displayName: 'includes',
      operandType: 'aqlString',
      generator: (l, r) => `${l}.any((s) => s == ${r})`,
    },
    {
      operator: 'ninc',
      displayName: 'does not include',
      operandType: 'aqlString',
      generator: (l, r) => `!${l}.any((s) => s == ${r})`,
    },
  ],
};

export class CodeGenerationErrorInvalidProperty extends Error {
  propertyName: string;

  constructor(propertyName: string) {
    super(`Property or relationship ${propertyName} does not exist in object.`);
    this.propertyName = propertyName;
  }
}

export const ApiiroQlConstantRenderers: {
  [intrinsicType in QExpressionPropertyDataType]: (constant: any) => string;
} = {
  aqlNumber: c => c,
  aqlString: c => `"${c.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$')}"`,
  aqlBoolean: c => c,
  aqlTime: c => `Dates.parseIso("${c}")`,
  aqlStringList: () => {
    throw new Error('No stringlist constant');
  },
};

function GenerateOperatorApplication(
  propertyType: QExpressionPropertyDataType,
  subject: string,
  operator: string,
  operand: string
) {
  const operatorInfo = apiiroQlOperatorSupportRegistry[propertyType].find(
    operatorInfo => operatorInfo.operator === operator
  );

  if (!operatorInfo) {
    throw new CodeGenerationErrorInvalidProperty(
      `Invalid operator ${operator} for property type ${propertyType}`
    );
  }

  const escapedOperand =
    ApiiroQlConstantRenderers[operatorInfo.operandType || propertyType](operand);

  return operatorInfo.generator(subject, escapedOperand);
}

const QExpressionApiiroQlGenerators: {
  [expressionType in ExpressionTypeNames]: (
    objectType: QExpressionObjectSchema,
    allSchema: QExpressionSchema,
    subject: string,
    query: QExpression & { type: expressionType }
  ) => string;
} = {
  boolean(objectType, allSchema, subject, query) {
    const operator = query.combiner === 'and' ? '&&' : '||';
    return `(${query.subExpressions
      .map(subexpression => generateApiiroQl(objectType, allSchema, subject, subexpression))
      .join(` ${operator} `)})`;
  },
  // @ts-expect-error
  property(objectType, allSchema, subject, query) {
    const propertyDescriptor = objectType.properties.find(
      property => property.id === query.property
    );

    if (!propertyDescriptor) {
      throw new CodeGenerationErrorInvalidProperty(query.property);
    }

    return GenerateOperatorApplication(
      propertyDescriptor.dataType,
      propertyDescriptor.apiiroQlGenerator(subject),
      query.operator,
      query.operand
    );
  },

  relationship(objectType, allSchema, subject, query) {
    const relationshipDescriptor = objectType.relationships.find(
      relationship => relationship.id === query.relationshipName
    );

    if (!relationshipDescriptor) {
      throw new CodeGenerationErrorInvalidProperty(query.relationshipName);
    }

    const relationshipTargetType = allSchema[relationshipDescriptor.targetType];

    return query.relationshipQuery
      ? relationshipDescriptor.apiiroQlMatchPredicateGenerator(subject, innerSubject =>
          generateApiiroQl(relationshipTargetType, allSchema, innerSubject, query.relationshipQuery)
        )
      : relationshipDescriptor.apiiroQlExistsGenerator(subject);
  },

  negatedRelationship(objectType, allSchema, subject, query) {
    return `!(${this.relationship(objectType, allSchema, subject, query)})`;
  },

  // @ts-expect-error
  name(objectType, allSchema, subject, query) {
    if (!objectType.naming) {
      throw new Error('Object does not have a name');
    }

    return GenerateOperatorApplication(
      'aqlString',
      objectType.naming.apiiroQlGetterGenerator(subject),
      query.operator,
      query.operand
    );
  },

  // @ts-expect-error
  hasInsight(objectType, allSchema, subject, query) {
    if (!objectType.relationships.find(relationship => relationship.id === 'insights')) {
      throw new Error('Object does not have insights.');
    }

    const badgeEvalExpression = GenerateOperatorApplication(
      'aqlString',
      'insight.badge',
      '=',
      query.insightBadge
    );
    return `${subject}.insights.any((insight) => ${badgeEvalExpression})`;
  },

  negatedHasInsight(objectType, allSchema, subject, query) {
    return `!(${this.hasInsight(objectType, allSchema, subject, query)})`;
  },

  typeSwitch(_objectType, allSchema, subject, query) {
    const switchOptions = query.typeQueries.map(
      typeQuery =>
        `${typeQuery.typeSelector} ts => (!!ts && ${
          typeQuery.query
            ? generateApiiroQl(allSchema[typeQuery.typeSelector], allSchema, 'ts', typeQuery.query)
            : 'true'
        })`
    );
    return `(${subject} match ${switchOptions.join(', ')}, else false)`;
  },
};

export function generateApiiroQl(
  objectType: QExpressionObjectSchema,
  allSchema: QExpressionSchema,
  subject: string,
  query: QExpression
): string {
  if (!QExpressionApiiroQlGenerators[query.type]) {
    throw new Error(`Can't generate ApiiroQL for query ${JSON.stringify(query)}`);
  }

  return (
    QExpressionApiiroQlGenerators[query.type] as (
      objectType: QExpressionObjectSchema,
      allSchema: QExpressionSchema,
      subject: string,
      query: QExpression
    ) => string
  )(objectType, allSchema, subject, query);
}
