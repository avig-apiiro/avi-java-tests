import _ from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Heading } from '@src-v2/components/typography';
import { MaterialChangeCard } from '@src-v2/containers/commit/common-componnets';
import {
  getGovernanceRuleKeysByLabel,
  getMaterialChanges,
} from '@src-v2/containers/commit/material-changes-utils';
import { useMaterialChangesFilters } from '@src-v2/containers/pages/commit-page';
import { useInject, useSuspense } from '@src-v2/hooks';
import { dataAttr } from '@src-v2/utils/dom-utils';
import MaterialChangeActions from './material-change-actions';
import { MaterialChangeFactory } from './material-changes-content/material-changes-factory';

export const MaterialChanges = ({
  commitSha,
  repository,
  repositoryKey,
  moduleKey,
  isReleaseContext = false,
}) => {
  const { commits } = useInject();
  const { labelsToMaterialChangeKeys, governanceRules, materialChangesByRuleKey } = useSuspense(
    commits.getMaterialChanges,
    {
      repositoryKey,
      commitSha,
      moduleKey,
    }
  );
  const { activeFilters } = useMaterialChangesFilters();
  const governanceRuleKeysByLabel = getGovernanceRuleKeysByLabel(governanceRules);
  const relevantGovernanceRules = useMemo(
    () =>
      _.isEmpty(activeFilters)
        ? governanceRules
        : governanceRules.filter(rule =>
            activeFilters?.flatMap(label => governanceRuleKeysByLabel[label]).includes(rule.key)
          ),
    [activeFilters, governanceRules]
  );

  const selectedMaterialChangeKeys = _.isEmpty(activeFilters)
    ? []
    : activeFilters.flatMap(label => labelsToMaterialChangeKeys[label]);

  const materialChanges = getMaterialChanges(
    relevantGovernanceRules,
    materialChangesByRuleKey,
    selectedMaterialChangeKeys
  );

  if (isEmpty(materialChanges)) {
    return (
      <EmptyMaterialChangeList>
        No material changes match the selected filters
      </EmptyMaterialChangeList>
    );
  }

  return (
    <>
      {materialChanges.map(materialChangeData => {
        return (
          <AsyncBoundary>
            {/*@ts-ignore*/}
            <MaterialChangeCard key={materialChangeData.key} data-test-marker="mc-card">
              <MaterialChangeInfo data-ignored={dataAttr(materialChangeData.isAutoIgnored)}>
                <MaterialChangeFactory
                  governanceRule={materialChangeData.governanceRule}
                  thenSubType={materialChangeData.thenSubType}
                  materialChange={materialChangeData}
                  repository={repository}
                  commitSha={commitSha}
                />
              </MaterialChangeInfo>
              <MaterialChangeActions
                materialChange={materialChangeData}
                governanceRule={materialChangeData.governanceRule}
                thenSubType={materialChangeData.thenSubType}
                isReleaseContext={isReleaseContext}
              />
            </MaterialChangeCard>
          </AsyncBoundary>
        );
      })}
    </>
  );
};

const EmptyMaterialChangeList = styled.div`
  width: 100%;
  text-align: center;
`;

const MaterialChangeInfo = styled.div`
  flex: 1;

  ${Heading} {
    font-size: var(--font-size-s);
  }

  &[data-ignored] {
    opacity: 0.5;
  }
`;
