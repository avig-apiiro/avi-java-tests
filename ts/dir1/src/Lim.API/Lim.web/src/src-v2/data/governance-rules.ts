import { StubAny } from '@src-v2/types/stub-any';

export function flatRuleOptionTypes(rule: StubAny) {
  return {
    ...rule,
    given: flatPortionOptionTypes(rule.given),
    when: flatPortionOptionTypes(rule.when),
    then: flatPortionOptionTypes(rule.then),
  };
}

function flatPortionOptionTypes(
  portion: {
    type: string;
    subType: string;
    values?: any[];
    additionalProperties: { type: string; values: string[] }[];
  }[]
) {
  return portion.flatMap(option =>
    option.values?.map(
      value =>
        ({
          type: option.type,
          subType: option.subType,
          additionalProperties: option.additionalProperties?.flatMap(property =>
            property.values.map(propertyValue => ({
              type: property.type,
              value: propertyValue,
            }))
          ),
          value,
        }) ?? [option]
    )
  );
}
