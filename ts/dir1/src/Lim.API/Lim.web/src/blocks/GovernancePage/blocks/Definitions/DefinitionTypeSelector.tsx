import isNil from 'lodash/isNil';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Card, CardTiles } from '@src-v2/components/cards';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import DefinitionConsts from './DefinitionConsts';

interface DefinitionInterface {
  type: string;
  title: string;
  text: string;
  exclude?: boolean;
}

export function DefinitionTypeSelector({ onSelect }) {
  const { application } = useInject();

  const Definitions: DefinitionInterface[] = useMemo(
    () => [
      {
        type: DefinitionConsts.types.API,
        title: 'API Routes',
        text: 'Define internet-facing / internal API routes',
      },
      {
        type: DefinitionConsts.types.Issue,
        title: 'Issues to Track',
        text: 'Define issues to track (e.g. pen-test findings in Jira)',
      },
      {
        type: DefinitionConsts.types.UserStory,
        title: 'Feature Requests',
        text: 'Define issues type (e.g. user stories) to predict risky features using NLP',
      },
      {
        type: DefinitionConsts.types.InternalFramework,
        title: 'Custom Frameworks',
        text: 'Define dependencies as a framework (e.g. custom encryption framework)',
      },
      {
        type: DefinitionConsts.types.CustomSensitiveData,
        title: 'Custom Sensitive Data',
        text: 'Define internal keywords that indicate how to track sensitive data',
      },
      {
        type: DefinitionConsts.types.SecretsExclusion,
        title: 'Secrets exclusion',
        text: 'Define internal keywords that indicate what secrets to exclude',
      },
    ],
    [application]
  );

  return (
    <Container>
      {Definitions.filter(({ exclude }) => isNil(exclude) || !exclude).map(
        ({ type, title, text }) => (
          <Card key={type}>
            <Heading>{title}</Heading>
            <Paragraph>{text}</Paragraph>
            <Button variant={Variant.SECONDARY} onClick={() => onSelect(type)}>
              + Add
            </Button>
          </Card>
        )
      )}
    </Container>
  );
}

const Container = styled(CardTiles)`
  --card-tiles-min-width: 80rem;
  gap: 3rem;

  ${Card} {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 3rem;
  }

  ${Heading} {
    font-size: var(--font-size-xl);
    line-height: 7rem;
  }
`;
