import _ from 'lodash';
import { riskOrder } from '@src-v2/data/risk-data';
import type {
  AbnormalBehaviorType,
  MaterialChange,
  ThenSubType,
} from '@src-v2/types/material-changes/material-changes';
import { humanize } from '@src-v2/utils/string-utils';

export const thenSubTypeToVerb = (value: ThenSubType): string => {
  switch (value) {
    case 'Added':
    case 'Removed':
    case 'Upgraded':
    case 'Downgraded':
    case 'Modified':
      return _.camelCase(value);
    case 'Altered':
      return 'significantly changed';
    default:
      return value;
  }
};

export const abnormalBehaviorTypeToString = (value: AbnormalBehaviorType): string => {
  switch (value) {
    case 'DormantRepositoryAnomaly':
      return 'Dormant repository';
    case 'DormantDeveloperAnomaly':
      return 'Dormant developer';
    case 'DormantRepositoryDeveloperAnomaly':
      return 'Dormant developer in the context of repository';
    default:
      return null;
  }
};

export const thenSubTypeToConjunction = value => {
  switch (value) {
    case 'Added':
      return 'to';
    case 'Removed':
      return 'from';
    case 'Altered':
      return 'at';
    default:
      return value;
  }
};

export const getGovernanceRuleKeysByLabel = governanceRules =>
  Object.fromEntries(
    governanceRules.flatMap(rule =>
      rule.then.map(({ type, value: ruleLabel }) => (type === 'Label' ? [ruleLabel, rule.key] : []))
    )
  );

export const getApiClassificationDescription = classification => {
  switch (classification) {
    case 'internetFacing':
    case 'internal':
      return humanize(classification);
    default:
      return 'unknown';
  }
};

export function getMethodName(methodFullPath, removeParams) {
  const methodExpression = methodFullPath.split('.').pop();
  return removeParams ? methodExpression.slice(0, methodExpression.indexOf('(')) : methodExpression;
}

export const getMaterialChangeLabelsData = labelsToMaterialChangeKeys =>
  Object.keys(labelsToMaterialChangeKeys).map(key => ({
    name: key,
    count: labelsToMaterialChangeKeys[key].length,
  }));

export const getCommitCodeReferenceUrl = (repository, commitSha, referenceUrl) => {
  const providerUrl = repository.providerUrl ?? repository.url;

  switch (repository.provider ?? repository.vendor ?? repository.server?.provider) {
    case 'Bitbucket':
    case 'BitbucketCloud':
    case 'BitbucketServer':
      return `${providerUrl}/commits${commitSha ? `/${commitSha}` : ''}#${referenceUrl}`;

    case 'AzureDevops':
      return `${providerUrl}?path=/${referenceUrl}`;

    case 'Github':
    case 'Gitlab':
      return `${providerUrl}/blob/${commitSha ? `${commitSha}/` : ''}${referenceUrl}`;

    default:
      console.warn(`unsupported provider ${repository.provider ?? ''}`);
  }
};

export const getMaterialChanges = (
  governanceRules,
  materialChangesByRuleKey,
  selectedMaterialChangeKeys
): MaterialChange[] => {
  const orderedGovernanceRules = _.orderBy(
    governanceRules,
    [
      rule => rule.isAutoIgnored,
      rule => (rule.then.type !== 'Risk' ? 0 : riskOrder.indexOf(rule.then.value)),
    ],
    ['asc', 'desc']
  );

  return orderedGovernanceRules
    .reduce((materialChanges, governanceRule) => {
      Object.entries(materialChangesByRuleKey[governanceRule.key]).forEach(
        ([ruleIndex, materialChangesWithSameIndex]: [string, MaterialChange[]]) => {
          materialChangesWithSameIndex.forEach(materialChange =>
            materialChanges.push({
              ...materialChange,
              thenSubType: governanceRule.then[ruleIndex].subType,
              governanceRule,
            })
          );
        }
      );
      return materialChanges;
    }, [])
    .filter(
      materialChange =>
        _.isEmpty(selectedMaterialChangeKeys) ||
        _.includes(selectedMaterialChangeKeys, materialChange.key)
    )
    .sort(materialChange => materialChange.orderByValue);
};

export const getApiText = (httpMethod, httpRoute, methodName, classification) => {
  const name = !_.isEmpty(httpRoute) ? `${httpMethod ?? 'ANY'} ${httpRoute}` : methodName;
  const classificationText =
    classification && classification !== 'unknown'
      ? ` (${getApiClassificationDescription(classification)})`
      : '';
  return `${name}${classificationText}`;
};

export const getFilters = (labelsToMaterialChangeKeys, materialChangesByLabels) => {
  const materialChangeLabels = getMaterialChangeLabelsData(labelsToMaterialChangeKeys);

  return materialChangeLabels.map(label => {
    const riskLevel = (_.head(materialChangesByLabels[label.name]) as MaterialChange)?.riskLevel;
    const hasIcon = riskOrder.includes(riskLevel.toLowerCase());

    return {
      ...label,
      icon: hasIcon ? riskLevel : null,
    };
  });
};

export const getPerforceChangeNumber = message => {
  if (message.indexOf('change = ') >= 0) {
    const startIndex = message.indexOf('change = ') + 9;
    return message.substr(startIndex, message.lastIndexOf(']') - startIndex);
  }
  return message;
};

export const getPerforceChangeMessage = message => {
  if (message.indexOf('[git-p4') >= 0) {
    return message.substring(0, message.indexOf('[git-p4') - 1);
  }
  return message;
};
