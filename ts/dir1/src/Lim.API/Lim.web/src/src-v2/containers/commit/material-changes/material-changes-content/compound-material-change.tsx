import _ from 'lodash';
import { Paragraph } from '@src-v2/components/typography';
import { MaterialChangeFactory } from '@src-v2/containers/commit/material-changes/material-changes-content/material-changes-factory';
import { pluralFormat } from '@src-v2/utils/number-utils';

export const CompoundMaterialChange = ({
  materialChange,
  governanceRule,
  thenSubType,
  repository,
  commitSha,
}) => {
  const currentWhenIndexes = materialChange.partialMaterialChanges.flatMap(
    partialMaterialChange => partialMaterialChange.ruleWhenIndexes
  );
  const missingWhenIndexesCount = _.difference(
    _.range(governanceRule.when.length),
    currentWhenIndexes
  ).length;

  return (
    <>
      <Paragraph>{governanceRule.name}</Paragraph>
      {materialChange.partialMaterialChanges.map(partialMaterialChange => (
        <MaterialChangeFactory
          key={partialMaterialChange.key}
          governanceRule={governanceRule}
          thenSubType={thenSubType}
          materialChange={partialMaterialChange}
          repository={repository}
          commitSha={commitSha}
          renderActions={false}
          whenIndex={partialMaterialChange.ruleWhenIndexes[0]}
        />
      ))}
      {missingWhenIndexesCount > 0 && (
        <Paragraph>
          Combined with {pluralFormat(missingWhenIndexesCount, 'change', null, true)} Introduced in
          previous commits
        </Paragraph>
      )}
    </>
  );
};
