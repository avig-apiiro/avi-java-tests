import _ from 'lodash';
import { useCallback } from 'react';
import { useInject } from '@src-v2/hooks';
import { Definition } from '@src-v2/services';
import { SecretElement } from '@src-v2/types/inventory-elements';
import { InventoryElementCollectionRow } from '@src-v2/types/inventory-elements/inventory-element-collection-row';
import { RiskyIssue } from '@src-v2/types/inventory-elements/risky-issue';

export function useRiskIssuesEnricher() {
  const { developers } = useInject();

  return useCallback(
    async (issuesDataModel: InventoryElementCollectionRow<RiskyIssue>[]) =>
      await Promise.all(
        issuesDataModel.map(async dataModel => {
          const identityKeys = Object.keys(
            dataModel.diffableEntity.assigneeIdentitiesKeysToActivityTime
          );
          if (!identityKeys?.length) {
            return dataModel;
          }

          const assigneeProfiles = await developers.getDeveloperProfiles({ keys: identityKeys });
          return {
            ...dataModel,
            diffableEntity: { ...dataModel.diffableEntity, assigneeProfiles },
          };
        })
      ),
    []
  );
}

export type EnrichedSecretElement = SecretElement & {
  exclusionDefinitionName?: string;
};

export function useSecretsExclusionDefinitionEnricher() {
  const { definitions, asyncCache } = useInject();

  return useCallback(async (page: InventoryElementCollectionRow<EnrichedSecretElement>[]) => {
    const secretExclusionDefinitions: Definition[] = await asyncCache.suspend(
      definitions.getSecretsExclusionDefinitions
    );
    const definitionsByKey = _.keyBy(secretExclusionDefinitions, 'key');
    page
      .filter(item => item.diffableEntity.exclusionDefinitionId)
      .forEach(item => {
        item.diffableEntity.exclusionDefinitionName =
          definitionsByKey[item.diffableEntity.exclusionDefinitionId]?.name;
      });

    return page;
  }, []);
}
