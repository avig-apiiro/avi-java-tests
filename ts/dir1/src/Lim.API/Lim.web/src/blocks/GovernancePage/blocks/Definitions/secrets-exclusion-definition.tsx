import styled from 'styled-components';
import { SecretsExclusionDefinition as SecretsExclusionDefinitionType } from '@src-v2/services';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { HorizontalStack } from '@src/components/HorizontalStack';

export const SecretsExclusionDefinition = ({
  definition,
}: {
  definition: SecretsExclusionDefinitionType;
}) => (
  // @ts-expect-error
  <HorizontalStack withSeparator key={definition.key}>
    <Field>Secrets exclusion</Field>
    <Field>
      {definition.anyApplication ? 'All' : definition.applicationKeys?.length ?? 0}{' '}
      {pluralFormat(definition.applicationKeys, 'applicationKeys', 'Applications')}
    </Field>
    <Field>
      {definition.anyRepository ? 'All' : definition.repositoryKeys?.length ?? 0}{' '}
      {pluralFormat(definition.repositoryKeys, 'repositoryKeys', 'Repositories')}
    </Field>
    <Field>
      {definition.regexMatch?.length ?? 0} {pluralFormat(definition.regexMatch, 'term', 'terms')}
    </Field>
  </HorizontalStack>
);

const Field = styled.span``;
