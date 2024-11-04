type DefinitionType =
  | 'API'
  | 'Issue'
  | 'UserStory'
  | 'InternalFramework'
  | 'CustomSensitiveData'
  | 'SecretsExclusion';

type DefinitionDisplayType =
  | 'ApiClassificationDefinition'
  | 'RiskRelatedIssueDefinition'
  | 'UserStoryDefinition'
  | 'InternalFrameworkDefinition'
  | 'CustomSensitiveDataDefinition'
  | 'SecretsExclusionDefinition';

interface RuleConfig {
  given?: string;
  when: string;
}

interface TypeDefinitionToRule {
  ClassifyApis: string;
  Issue: RuleConfig;
  UserStory: RuleConfig;
  InternalFramework: RuleConfig;
  CustomSensitiveData: Pick<RuleConfig, 'when'>;
}

interface Mappings {
  types: Record<DefinitionType, DefinitionType>;
  apiPathByType: {
    [K in DefinitionType]: string;
  };
  modalTitleByType: {
    Issue: string;
    UserStory: string;
    InternalFramework: string;
  };
  typeDisplayNameByType: {
    [K in DefinitionType]: DefinitionDisplayType;
  };
  typeToRisk: {
    Issue: string;
    UserStory: string;
  };
  typeDefinitionToRule: TypeDefinitionToRule;
}

interface Definition {
  type: DefinitionDisplayType;
}

const mappings: Mappings = {
  types: {
    API: 'API',
    Issue: 'Issue',
    UserStory: 'UserStory',
    InternalFramework: 'InternalFramework',
    CustomSensitiveData: 'CustomSensitiveData',
    SecretsExclusion: 'SecretsExclusion',
  },
  apiPathByType: {
    API: 'apiClassification',
    Issue: 'riskRelatedIssueDefinitions',
    UserStory: 'userStoryDefinitions',
    InternalFramework: 'internalFrameworkDefinitions',
    CustomSensitiveData: 'customSensitiveDataDefinitions',
    SecretsExclusion: 'secretExclusionDefinitions',
  },
  modalTitleByType: {
    Issue: 'Define Issues to Track',
    UserStory: 'Define Feature Requests to Track',
    InternalFramework: 'Define a Custom Framework',
  },
  typeDisplayNameByType: {
    API: 'ApiClassificationDefinition',
    Issue: 'RiskRelatedIssueDefinition',
    UserStory: 'UserStoryDefinition',
    InternalFramework: 'InternalFrameworkDefinition',
    CustomSensitiveData: 'CustomSensitiveDataDefinition',
    SecretsExclusion: 'SecretsExclusionDefinition',
  },
  typeToRisk: {
    Issue: 'RiskRelatedIssue',
    UserStory: 'RiskyUserStory',
  },
  typeDefinitionToRule: {
    ClassifyApis: 'ApiClassification',
    Issue: {
      given: 'RiskRelatedIssue',
      when: 'OpenIssue',
    },
    UserStory: {
      given: 'RiskyUserStory',
      when: 'OpenUserStory',
    },
    InternalFramework: {
      given: 'Repository',
      when: 'Technology',
    },
    CustomSensitiveData: {
      when: 'SensitiveData',
    },
  },
};

export default mappings;

export const getDefinitionType = (definition: Definition): DefinitionType => {
  const typeMap: Record<DefinitionDisplayType, DefinitionType> = {
    ApiClassificationDefinition: 'API',
    RiskRelatedIssueDefinition: 'Issue',
    UserStoryDefinition: 'UserStory',
    InternalFrameworkDefinition: 'InternalFramework',
    CustomSensitiveDataDefinition: 'CustomSensitiveData',
    SecretsExclusionDefinition: 'SecretsExclusion',
  };
  return typeMap[definition.type];
};

export const getDefinitionNamePrefix = (definition: Definition): string => {
  const prefixMap: Record<DefinitionDisplayType, string> = {
    ApiClassificationDefinition: 'api routes',
    RiskRelatedIssueDefinition: 'tracked issues',
    UserStoryDefinition: 'feature requests',
    InternalFrameworkDefinition: 'custom framework',
    CustomSensitiveDataDefinition: 'custom sensitive data',
    SecretsExclusionDefinition: 'secrets exclusion',
  };
  return prefixMap[definition.type];
};
