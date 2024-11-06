import { flatMap } from 'lodash';
import compact from 'lodash/compact';
import each from 'lodash/each';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findKey from 'lodash/findKey';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import keys from 'lodash/keys';
import map from 'lodash/map';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import some from 'lodash/some';
import { flatRuleOptionTypes } from '@src-v2/data/governance-rules';

export const validityStatus = {
  InvalidLabels: 'InvalidLabels',
  InvalidMessagingChannel: 'InvalidMessagingChannel',
  SlackDisconnected: 'SlackDisconnected',
  InvalidConnector: 'InvalidConnector',
  InvalidSchema: 'InvalidSchema',
  InvalidScreen: 'InvalidScreen',
  InvalidTargets: 'InvalidTargets',
  InvalidJiraOperation: 'InvalidJiraOperation',
};

interface ConvertOptionParams {
  key: string;
  displayName: string;
  required: boolean;
  group?: any;
  provider?: 'Jira' | 'AzureDevops' | 'Slack' | 'Teams' | 'GoogleChat';
  icon?: string;
  serverUrl?: string;
  defaultBranch?: string;
  projectId?: string;
  isMonitored?: boolean;
  risk?: 'Critical' | 'High' | 'Medium' | 'Low';
  disabled?: boolean;
  disabledTooltip?: {
    prefix: string;
    linkText: string;
    linkUrl: string;
  };
  tip?:
    | string
    | [
        string,
        {
          type: string;
          href: string;
        },
      ];
  canCurrentUserEdit?: boolean;
}

const convertOption = (serverOption: ConvertOptionParams) => {
  const selectOption: any = {
    value: serverOption.key,
    label: serverOption.displayName,
    required: serverOption.required,
  };
  if (serverOption.group !== undefined) {
    selectOption.group = serverOption.group;
  }
  if (serverOption.displayName) {
    selectOption.displayName = serverOption.displayName;
  }
  if (serverOption.provider) {
    selectOption.provider = serverOption.provider;
  }
  if (serverOption.icon) {
    selectOption.icon = serverOption.icon;
  }
  if (serverOption.serverUrl) {
    selectOption.serverUrl = serverOption.serverUrl;
  }
  if (serverOption.defaultBranch) {
    selectOption.defaultBranch = serverOption.defaultBranch;
  }
  if (serverOption.isMonitored) {
    selectOption.isMonitored = serverOption.isMonitored;
  }
  if (serverOption.risk) {
    selectOption.risk = serverOption.risk;
  }
  if (serverOption.disabled) {
    selectOption.isDisabled = true;
    selectOption.tooltipLinkText = serverOption.disabledTooltip?.linkText;
    selectOption.tooltipLinkUrl = serverOption.disabledTooltip?.linkUrl;
    selectOption.tooltipPrefix = serverOption.disabledTooltip?.prefix;
  } else {
    selectOption.tip = serverOption.tip;
  }

  if (serverOption.canCurrentUserEdit) {
    selectOption.canCurrentUserEdit = serverOption.canCurrentUserEdit;
  }

  if (serverOption.projectId) {
    selectOption.projectId = serverOption.projectId;
  }

  return selectOption;
};

const resolveOptions = (settings, selectedSubType) => {
  const valueOptions = selectedSubType?.options ?? settings.options;
  return valueOptions?.map(rulesService.convertOption);
};

const convertValueOnSubTypeChange = (
  currentSelection,
  newSubTypeSelection,
  options,
  valueOptions
) => {
  if (!isEmpty(valueOptions)) {
    return valueOptions[0].value;
  }
  const subTypeSettings = find(options[currentSelection.type].subTypes, [
    'key',
    newSubTypeSelection.value,
  ]);

  return !isEmpty(subTypeSettings?.options) ? subTypeSettings.options[0].key : '';
};

const getValueSettingsForSelection = (optionSettings, selected) => ({
  ...pick(
    find(optionSettings.options, ['key', selected]) || { key: selected, displayName: selected }, // The fallback to selected.value covers for removed labels
    ['key', 'displayName', 'provider', 'risk', 'serverUrl', 'isMonitored', 'defaultBranch']
  ),
});

const getValuesSettings = (typeSettings, currentSelection) => {
  let values = [''];
  let placeholder;
  let options;
  let type;

  if (typeSettings.options) {
    values = currentSelection.values.map(value =>
      getValueSettingsForSelection(typeSettings, value)
    );
    options = typeSettings.options;
    type = 'options';
  }

  const subTypeSettings = find(typeSettings.subTypes, ['key', currentSelection.subType]);
  if (subTypeSettings?.options) {
    values = currentSelection.values.map(value =>
      getValueSettingsForSelection(subTypeSettings, value)
    );
    options = subTypeSettings.options;
    type = 'options';
  }

  if (typeSettings.type === 'text' || typeSettings.type === 'developer') {
    type = typeSettings.type;
    placeholder = typeSettings.placeholder;
    values = [currentSelection.values[0]];
  }

  return {
    placeholder,
    values,
    options,
    type,
  };
};

const getOptionScope = (selectedOption, options) =>
  options[selectedOption.type].scope ||
  find(options[selectedOption.type].options, ['key', selectedOption.values[0]])?.scope;

const filterOptionScope = (option, scope) => {
  if ((!isNil(scope) && option.scope === scope) || option.scope === 'any') {
    return option;
  }

  if (option.options) {
    const scopedOptions = option.options.filter(
      _ => (!isNil(scope) && _.scope === scope) || [_.scope, scope].includes('any')
    );
    if (!isEmpty(scopedOptions)) {
      return {
        ...option,
        options: scopedOptions,
      };
    }
  }

  return null;
};

const isMultiTextPropertyUsed = (property, selectedOption) =>
  some(
    selectedOption.additionalProperties,
    additionalProperty => additionalProperty.type === property.key
  )
    ? property.multi && property.type === 'text'
    : true;

const filterAdditionalProperties = (optionSettings, selectedOption) =>
  optionSettings?.additionalProperties !== undefined &&
  selectedOption?.additionalProperties !== undefined
    ? optionSettings?.additionalProperties.filter(property =>
        isMultiTextPropertyUsed(property, selectedOption)
      )
    : optionSettings?.additionalProperties;

const filterOptions = (options, selectedOptions, currentOption?, isCustom?) => {
  if (!isEmpty(selectedOptions)) {
    const definingOption =
      find(
        selectedOptions,
        option => option.type !== currentOption?.type && getOptionScope(option, options) !== 'any'
      ) ?? selectedOptions[0];
    const scope = getOptionScope(definingOption, options);
    const scopedOptions = {};

    if (scope !== 'any') {
      each(options, (option, type) => {
        if (type === definingOption.type) {
          scopedOptions[type] = option;
        }

        const filtered = filterOptionScope(option, scope);
        if (filtered) {
          scopedOptions[type] = filtered;
        }
      });
      options = scopedOptions;
    }
  }
  const selectedTypes = new Set(selectedOptions.map(option => option.type));
  const exhaustedTypes = new Set(
    selectedOptions
      .filter(option => {
        const wildcardKeys = getWildcardKeys(options[option.type]);
        return wildcardKeys.has(option.values?.[0]);
      })
      .map(option => option.type)
  );

  return pickBy(
    options,
    (typeSettings, type) =>
      isCustom ||
      (typeSettings.type === 'text' && !exhaustedTypes.has(type)) ||
      !selectedTypes.has(type) ||
      (currentOption && currentOption.type === type) ||
      options[type].allowDuplication
  );
};

const filterWhenTypes = (options, selectedGiven) => {
  const givenScopes = new Set(
    compact(map(selectedGiven, given => options.given[given.type].scope))
  );
  return isEmpty(givenScopes)
    ? options.when
    : pickBy(options.when, when => matchesGivenScopes(when, givenScopes));
};

const filterThenSubTypes = (options, selectedWhen, selectedGiven) => {
  const givenScopes = new Set(
    compact(map(selectedGiven, given => options.given[given.type].scope))
  );
  const filteredThenOptions = isEmpty(givenScopes)
    ? options.then
    : pickBy(options.then, then => matchesGivenScopes(then, givenScopes));
  const selectedWhenSettings = options.when[selectedWhen[0].type];
  let { relevantSubTypes } = selectedWhenSettings;

  if (!relevantSubTypes && selectedWhen[0].subType) {
    const selectedSubTypeSettings = find(selectedWhenSettings.subTypes, [
      'key',
      selectedWhen[0].subType,
    ]);
    relevantSubTypes = selectedSubTypeSettings?.relevantSubTypes;
  }

  if (!relevantSubTypes && selectedWhenSettings.options) {
    const whenValues = selectedWhen[0]?.values;
    if (!isEmpty(whenValues)) {
      relevantSubTypes = find(selectedWhenSettings.options, [
        'key',
        whenValues[0],
      ])?.relevantSubTypes;
    }
  }

  if (!relevantSubTypes) {
    return filteredThenOptions;
  }

  const relevantOptions = {};
  each(
    relevantSubTypes,
    (relevantSubTypesByType, type) =>
      (relevantOptions[type] = {
        ...filteredThenOptions[type],
        subTypes: filter(filteredThenOptions[type].subTypes, subType =>
          relevantSubTypesByType.includes(subType.key)
        ),
      })
  );

  return relevantOptions;
};

const matchesGivenScopes = (portion, givenScopes) => {
  if (!portion.givenScope && !portion.givenScopes) {
    return true;
  }
  const portionGivenScopes = portion.givenScope ? [portion.givenScope] : portion.givenScopes;
  const intersection2 = intersection(portionGivenScopes, [...givenScopes]);
  return !isEmpty(intersection2);
};

const getDefaultOptionWithType = (portionOptions, type) => {
  const option: { type: any; value: string; subType?: any; additionalProperties?: any } = {
    type,
    value: '',
  };
  if (!isEmpty(portionOptions[type].subTypes)) {
    const [defaultSubType] = portionOptions[type].subTypes;
    option.subType = defaultSubType.key;
    if (!isEmpty(defaultSubType.options) && !portionOptions[type].allowEmptySelection) {
      option.value = defaultSubType.options[0].key;
      const defaultOptionAdditionalProperties = getRequiredPropertiesForSelected(
        defaultSubType.options[0].additionalProperties
      );
      if (!isEmpty(defaultOptionAdditionalProperties)) {
        option.additionalProperties = defaultOptionAdditionalProperties;
      }
    }
  } else {
    option.additionalProperties = getRequiredPropertiesForSelected(
      portionOptions[type].additionalProperties
    );
  }

  if (
    isEmpty(option.value) &&
    !isEmpty(portionOptions[type].options) &&
    !portionOptions[type].allowEmptySelection
  ) {
    option.value = portionOptions[type].options[0].key;
  }

  return option;
};

const getDefaultOption = (portionOptions, selectedOptions) => {
  const availableOptions = filterOptions(portionOptions, selectedOptions);
  const type =
    findKey(availableOptions, value => !value.disabled && value.scope !== 'any') ??
    keys(availableOptions)[0];
  return getDefaultOptionWithType(availableOptions, type);
};

const getDefaultModule = (optionSettings, selectedOption) => {
  const selectedValue = find(optionSettings.options, ['key', selectedOption.values[0]]);
  const modules = selectedValue && selectedValue.modules ? selectedValue.modules : [];
  return !isEmpty(modules) ? modules[0].root : '';
};

const getDefaultStorageBucket = optionSettings => {
  const buckets = optionSettings && optionSettings.buckets ? optionSettings.buckets : [];
  return !isEmpty(buckets) ? buckets[0].displayName : '';
};

const getPropertiesForSelectedOption = (
  propertiesSettings,
  selectedOption,
  selectedTypeSettings
) => {
  const wildcardKeys = getWildcardKeys(selectedTypeSettings);
  return selectedOption.values.length === 1 && wildcardKeys.has(selectedOption.values[0])
    ? filter(propertiesSettings, property => property.allowForWildcardValue)
    : propertiesSettings;
};

const getDefaultPropertyValue = (type, optionSettings, selectedOption) => {
  switch (type) {
    case 'Module':
      return [getDefaultModule(optionSettings, selectedOption)];
    case 'StorageBucket':
      return [getDefaultStorageBucket(optionSettings)];
    case 'RiskCategory':
      return ['General'];
    case 'SecureCodeWarrior':
      return [''];
    default:
      return [];
  }
};

const getDefaultProperty = (optionSettings, selectedOption) => {
  const properties = getPropertiesForSelectedOption(
    filterAdditionalProperties(optionSettings, selectedOption),
    selectedOption,
    optionSettings
  );
  const type = isEmpty(properties)
    ? optionSettings?.additionalProperties[0].key
    : properties[0].key;
  return { type, values: getDefaultPropertyValue(type, optionSettings, selectedOption) };
};

const applyRuleModifications = (rule, modifications) => ({
  ...rule,
  [modifications.portion]: rule[modifications.portion].map((option, index) =>
    index !== modifications.index
      ? option
      : {
          ...pick(modifications, ['type', 'subType', 'value', 'values', 'additionalProperties']),
        }
  ),
});

const getRequiredPropertiesForSelected = additionalProperties =>
  additionalProperties
    ?.filter(prop => prop.required)
    .map((property, index) => ({
      propertyIndex: index,
      type: property.key,
      value: '',
      values: [''],
      required: true,
    })) ?? null;

const markRequiredProperties = (additionalProperties, rulePortion) => {
  additionalProperties
    ?.filter(property => property.required)
    .forEach(requiredProperty => {
      const property = rulePortion.additionalProperties?.find(
        property => property.type === requiredProperty.key
      );
      if (!isNil(property)) {
        property.required = true;
      }
    });
};

const markTypeRequiredProperties = (rule, options) => {
  rule.then.forEach(thenOption => {
    markRequiredProperties(options.then[thenOption.type].additionalProperties, thenOption);
  });
};

const markSubTypeRequiredProperties = (rule, options) => {
  rule.then
    .filter(
      thenOption =>
        !isEmpty(thenOption.type) && !isEmpty(thenOption.subType) && !isEmpty(thenOption.values)
    )
    .forEach(thenOption => {
      markRequiredProperties(
        options.then[thenOption.type].subTypes
          ?.find(subtype => subtype.key === thenOption.subType)
          ?.options?.find(value => value.key === thenOption.values[0])?.additionalProperties,
        thenOption
      );
    });
};

const markRequiredThenProperties = (rule, options) => {
  markTypeRequiredProperties(rule, options);
  markSubTypeRequiredProperties(rule, options);
  return rule;
};

interface RulePortion {
  type: string;
  value: any;
  subType?: string;
  additionalProperties?: any[];
}

interface Rule {
  key: string;
  name: string;
  given: RulePortion[];
  when: RulePortion[];
  then: RulePortion[];
}

/**
 * Remove options from the rule that were removed from the schema
 * @param rule The rule being modified
 * @param thenOptions Global then options including all current project schemas
 */
const removeUnsupportedThenProperties = (rule: Rule, thenOptions) => {
  rule.then.forEach(rulePortion => {
    if (rulePortion.type === 'Jira' || rulePortion.type === 'AzureDevops') {
      return;
    }
    const optionalProperties = thenOptions[rulePortion.type].subTypes
      ?.find(subtype => subtype.key === rulePortion.subType)
      ?.options.find(value => value.key === rulePortion.value)?.additionalProperties;

    if (optionalProperties !== undefined) {
      const modifiedAdditionalProperties = rulePortion.additionalProperties?.filter(property =>
        find(optionalProperties, option => option.key === property.type)
      );
      if (!isEmpty(modifiedAdditionalProperties)) {
        rulePortion.additionalProperties = modifiedAdditionalProperties;
      }
    }
  });

  return rule;
};

interface GroupedOption {
  values: any[];
  additionalProperties?: any;
}

const handleAdditionalProperties = (groupedOptions: GroupedOption[], typeSettings) => {
  groupedOptions.forEach(groupedOption => {
    if (isEmpty(groupedOption.additionalProperties)) {
      return;
    }

    const groupedProperties = groupBy(
      groupedOption.additionalProperties,
      property => property.type
    );

    groupedOption.additionalProperties = flatMap(groupedProperties, (properties, propertyType) => {
      const propertySettings = find(
        typeSettings.additionalProperties,
        property => property.key === propertyType
      );

      return propertySettings?.type === 'text'
        ? map(properties, property => ({
            ...omit(property, ['value']),
            values: [property.value],
          }))
        : [
            {
              ...omit(properties[0], ['value']),
              values: map(properties, _ => _.value),
            },
          ];
    });
  });
};

const groupProperties = ['type', 'subType', 'conjunction', 'additionalProperties'];
const getGroupedOptionsForType = (typeSettings, values) => {
  const groupedOptions: GroupedOption[] =
    typeSettings.type === 'text'
      ? map(values, value => ({
          ...pick(value, groupProperties),
          values: [value.value],
        }))
      : [
          {
            ...pick(values[0], groupProperties),
            values: map(values, _ => _.value),
          },
        ];
  return groupedOptions;
};

const groupSameTypeValues = (rule: Rule, options) =>
  each(['given', 'when', 'then'], portion => {
    const groupedRuleOptions = groupBy(rule[portion], option => [option.type, option.subType]);

    const mappedOptions = map(groupedRuleOptions, values => {
      const [firstValue] = values;
      const { subType } = firstValue;
      let typeSettings = options[portion][firstValue.type];

      const subTypesSettings = find(typeSettings.subTypes, ['key', subType]);
      const valueSettings = subTypesSettings?.options?.find(
        option => option.key === firstValue.value
      );

      if (
        !isEmpty(subType) &&
        !isEmpty(subTypesSettings) &&
        isEmpty(valueSettings?.additionalProperties)
      ) {
        subTypesSettings.additionalProperties =
          subTypesSettings.additionalProperties ?? typeSettings.additionalProperties;
        typeSettings = subTypesSettings;
      } else if (!isEmpty(subType) && !isEmpty(firstValue.value) && !isEmpty(valueSettings)) {
        typeSettings = valueSettings;
      }

      const groupedOptions = getGroupedOptionsForType(typeSettings, values);

      if (typeSettings.allowEmptySelection) {
        groupedOptions[0].values = compact(groupedOptions[0].values);
      }

      if (
        (groupedOptions[0] as any).type !== 'Jira' &&
        (groupedOptions[0] as any).type !== 'AzureDevops'
      ) {
        handleAdditionalProperties(groupedOptions, typeSettings);
      } else {
        groupedOptions[0].additionalProperties?.forEach((option, index) => {
          groupedOptions[0].additionalProperties[index].values = [option.value];
        });
      }
      if (portion === 'then') {
        let ungrouped = [];
        if (typeSettings.allowDuplication) {
          ungrouped = ungroupWithDuplication(values);
          if (ungrouped.length) {
            groupedOptions.splice(groupedOptions[0] as any, 1, ...ungrouped);
          }
        }
      }
      return groupedOptions;
    });

    rule[portion] = flatten(mappedOptions);
  });

const ungroupWithDuplication = values => {
  const ungrouped = [];
  values.forEach(item => {
    item.values = [item.value];
    if (item.additionalProperties?.length) {
      item.additionalProperties[0].values = [item.additionalProperties[0].value];
    }
    ungrouped.push(item);
  });
  return ungrouped;
};

const ungroupSameTypeValues = rule => flatRuleOptionTypes(rule);

const getWildcardKeys = typeSettings =>
  new Set(typeSettings?.options?.filter(option => option?.wildcard)?.map(option => option.key));

const isWildcard = (typeSettings, values) => {
  const wildcardKeys = getWildcardKeys(typeSettings);
  return some(values, value => wildcardKeys.has(value.value));
};

const onMultiSelectOptionChange = ({
  newSelectedItems,
  selectedTypeSettings,
  isMulti,
  isAllowEmptySelection,
  currentValues,
  currentSelected,
  valueOptions,
  setSelection,
  newSelectionRequiredProperties = null,
}) => {
  if (!isMulti) {
    newSelectedItems = [newSelectedItems];
  }

  if (!newSelectedItems && rulesService.isWildcard(selectedTypeSettings, valueOptions)) {
    setSelection({
      ...pick(currentSelected, ['type', 'subType']),
      values: [newSelectedItems[0].value],
    });
  } else if (!newSelectedItems && isAllowEmptySelection) {
    setSelection({ ...pick(currentSelected, ['type', 'subType']), values: [] });
  } else if (rulesService.isWildcard(selectedTypeSettings, newSelectedItems)) {
    const wildcardOptions = rulesService.getWildcardKeys(selectedTypeSettings);
    const relevantWildcard = newSelectedItems.find(item => wildcardOptions.has(item.value));
    setSelection({
      ...pick(currentSelected, ['type', 'subType']),
      values: [relevantWildcard.value],
    });
  } else if (rulesService.isWildcard(selectedTypeSettings, currentValues)) {
    setSelection({
      ...pick(currentSelected, ['type', 'subType']),
      values: [newSelectedItems[0].value],
    });
  } else if (newSelectedItems) {
    setSelection({
      ...pick(currentSelected, ['type', 'subType']),
      values: newSelectedItems.map(_ => _.value),
      additionalProperties: newSelectionRequiredProperties,
    });
  }
};

const convertValueToValues = (settings, value) =>
  isEmpty(value) && settings.allowEmptySelection ? [] : [value];

const shouldShowPropertiesModifiers = (additionalProperties, selected, selectedTypeSettings) => {
  const wildcardTypeOptionKeys = getWildcardKeys(selectedTypeSettings);
  return (
    !isEmpty(additionalProperties) &&
    (some(additionalProperties, property => property.allowForWildcardValue) ||
      (selected.values.length === 1 && !wildcardTypeOptionKeys.has(selected.values[0])))
  );
};

const setWhenPortionOption = (options, modifiedRule, rule) => {
  const thenSubTypes = filterThenSubTypes(options, modifiedRule.when, modifiedRule.given);
  if (
    some(
      rule.then,
      then =>
        !thenSubTypes[then.type] ||
        (thenSubTypes[then.type].subTypes &&
          !some(thenSubTypes[then.type].subTypes, subType => subType.key === then.subType))
    )
  ) {
    const newDefaultSelection = getDefaultOption(thenSubTypes, []);
    modifiedRule.then = [
      {
        ...newDefaultSelection,
        values: convertValueToValues(
          thenSubTypes[newDefaultSelection.type],
          newDefaultSelection.value
        ),
      },
    ];
  }
};

export const AdditionalPropertiesType = {
  Type: 'Type',
  TypeValue: 'TypeValue',
  SubType: 'SubType',
  Value: 'Value',
};

const rulesService = {
  convertOption,
  resolveOptions,
  convertValueOnSubTypeChange,
  getValuesSettings,
  getDefaultOptionWithType,
  getDefaultOption,
  filterOptions,
  filterWhenTypes,
  filterThenSubTypes,
  groupSameTypeValues,
  ungroupSameTypeValues,
  getWildcardKeys,
  isWildcard,
  onMultiSelectOptionChange,
  shouldShowPropertiesModifiers,
  getPropertiesForSelectedOption,
  filterAdditionalProperties,
  getDefaultPropertyValue,
  getRequiredPropertiesForSelected,
  markRequiredThenProperties,
  removeUnsupportedThenProperties,
  newRule: options => {
    const given = getDefaultOption(options.given, []);
    const when = getDefaultOption(filterWhenTypes(options, [given]), []);
    const rule = {
      key: crypto.randomUUID(),
      name: '',
      given: [given],
      when: [when],
      then: [rulesService.getDefaultOption(filterThenSubTypes(options, [when], [given]), [])],
      type: 'legacyRule',
    };
    rulesService.groupSameTypeValues(rule, options);
    return rule;
  },
  changeRuleName: (rule, ruleName) => ({
    ...rule,
    name: ruleName,
  }),
  addOption: (rule, modifications, options) => {
    const newDefaultSelection = getDefaultOption(
      modifications.portion === 'then'
        ? filterThenSubTypes(options, rule.when, rule.given)
        : options[modifications.portion],
      rule[modifications.portion]
    );
    const definitionSettings = options[modifications.portion][newDefaultSelection.type];
    return {
      ...rule,
      [modifications.portion]: [
        ...rule[modifications.portion],
        {
          ...newDefaultSelection,
          values: convertValueToValues(definitionSettings, newDefaultSelection.value),
        },
      ],
    };
  },
  removeOption: (rule, modifications) => ({
    ...rule,
    [modifications.portion]: rule[modifications.portion].filter(
      (_, index) => index !== modifications.index
    ),
  }),
  setOption: (rule, modifications, options) => {
    const isCustom = rule.then.find(
      option => option.type === 'Jira' || option.type === 'AzureDevops'
    );
    if (options[modifications.portion][modifications.type].allowEmptySelection) {
      modifications.values = compact(modifications.values);
    }
    const modifiedRule = applyRuleModifications(rule, modifications);

    const modifiedPortionSelections = modifiedRule[modifications.portion];
    if (modifications.index === 0 && modifiedPortionSelections.length > 1) {
      const relevantOptions = filterOptions(
        options[modifications.portion],
        modifiedPortionSelections,
        null,
        isCustom
      );
      modifiedRule[modifications.portion] = modifiedPortionSelections.filter(
        (option, index) => index === 0 || relevantOptions[option.type]
      );
    }

    if (modifications.portion === 'given') {
      const whenTypes = filterWhenTypes(options, modifiedRule.given);
      const thenSubTypes = filterThenSubTypes(options, modifiedRule.when, modifiedRule.given);
      if (
        some(rule.when, when => !whenTypes[when.type]) ||
        some(rule.then, then => !thenSubTypes[then.type])
      ) {
        const newDefaultWhenSelection = getDefaultOption(whenTypes, []);
        modifiedRule.when = [
          {
            ...newDefaultWhenSelection,
            values: convertValueToValues(
              whenTypes[newDefaultWhenSelection.type],
              newDefaultWhenSelection.value
            ),
          },
        ];
        setWhenPortionOption(options, modifiedRule, rule);
      }
    }

    if (modifications.portion === 'when') {
      setWhenPortionOption(options, modifiedRule, rule);
    }

    return modifiedRule;
  },
  addProperty: (rule, modifications, options) => ({
    ...rule,
    [modifications.portion]: rule[modifications.portion].map((option, index) => {
      const optionSettings =
        modifications.type === AdditionalPropertiesType.Value
          ? find(options[modifications.portion]?.[option.type]?.subTypes || [], [
              'key',
              option.subType,
            ])?.options?.find(innerOption => innerOption.key === option.values[0])
          : modifications.type === AdditionalPropertiesType.SubType
            ? find(options[modifications.portion]?.[option.type]?.subTypes || [], [
                'key',
                option.subType,
              ])
            : modifications.type === AdditionalPropertiesType.TypeValue
              ? options[modifications.portion][option.type]?.options?.find(
                  innerOption => innerOption.key === option.values[0]
                )
              : options[modifications.portion][option.type];

      if (!optionSettings.additionalProperties) {
        optionSettings.additionalProperties = modifications.customAdditionalProperties;
      }

      return index !== modifications.optionIndex
        ? option
        : {
            ...option,
            additionalProperties: [
              ...(option.additionalProperties || []),
              getDefaultProperty(optionSettings, option),
            ],
          };
    }),
  }),
  removeProperty: (rule, modifications) => ({
    ...rule,
    [modifications.portion]: rule[modifications.portion].map((option, index) =>
      index !== modifications.optionIndex
        ? option
        : {
            ...option,
            additionalProperties: option.additionalProperties.filter(
              (_, index) => index !== modifications.propertyIndex
            ),
          }
    ),
  }),
  setProperty: (rule, modifications) => ({
    ...rule,
    [modifications.portion]: rule[modifications.portion].map((option, index) => {
      return index !== modifications.optionIndex
        ? option
        : {
            ...option,
            additionalProperties: option.additionalProperties.map((property, index) =>
              index !== modifications.propertyIndex
                ? property
                : pick(modifications, ['type', 'values', 'required'])
            ),
          };
    }),
  }),
  setProcessTags: (rule, modifications) => ({
    ...rule,
    processTagKeys: map(modifications, 'value'),
  }),
  setRuleCategory: (rule, category) => ({
    ...rule,
    category,
  }),
  setRuleDescription: (rule, description = '') => ({
    ...rule,
    description,
  }),
};

export default rulesService;
