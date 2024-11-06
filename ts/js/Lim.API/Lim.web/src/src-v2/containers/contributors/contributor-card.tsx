import _ from 'lodash';
import { forwardRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import * as languageIcons from '@src-v2/assets/languages';
import { Avatar } from '@src-v2/components/avatar';
import { BadgesGroup } from '@src-v2/components/badges-group';
import { Card } from '@src-v2/components/cards';
import { LanguageStack } from '@src-v2/components/circles/language-stack';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph, Title } from '@src-v2/components/typography';
import { FrameworksTooltip } from '@src-v2/containers/contributors/frameworks-tooltip';
import { getLanguageDisplayName } from '@src-v2/data/languages';
import { StyledProps } from '@src-v2/types/styled';
import { pluralFormat } from '@src-v2/utils/number-utils';

export function ContributorCard({ developerProfile }) {
  const orderedBadges = useMemo(
    () =>
      _.orderBy(
        developerProfile.badges?.filter(badge => relevantBadgeTypes.includes(badge.type)),
        badge => relevantBadgeTypes.indexOf(badge.type)
      ),
    [developerProfile]
  );

  const languages = useMemo(
    () =>
      developerProfile.languagePercentages
        .filter(language => languageIcons[language.key])
        .map(language => ({
          icon: language.key,
          name: getLanguageDisplayName(language.key),
          tooltip: `${getLanguageDisplayName(language.key)}: ${language.value}% of commits`,
          percentage: language.value,
        })),
    [developerProfile]
  );
  return (
    <Container
      as={Link}
      to={`/users/contributors/${developerProfile.representativeIdentityKeySha}`}>
      <Header>
        <Avatar
          size={Size.XXLARGE}
          identityKey={developerProfile.key}
          username={developerProfile.displayName}
          active={developerProfile.isActive}
        />
        <TitleAndStatistics>
          <Title>{developerProfile.displayName}</Title>
          <Paragraph>
            <Statistics value={developerProfile.commitCount} single="Commit" />
            <Statistics value={developerProfile.authoredPullRequestCount} single="Pull Request" />
            <Statistics
              value={developerProfile.repositoryCount}
              single="Repository"
              plural="Repositories"
            />
            {developerProfile.codeFrameworks?.length > 0 && (
              <FrameworksTooltip frameworks={developerProfile.codeFrameworks}>
                <Statistics
                  value={developerProfile.codeFrameworks?.length}
                  single="Technology"
                  plural="Technologies"
                />
              </FrameworksTooltip>
            )}
          </Paragraph>
        </TitleAndStatistics>
        {languages.length > 0 && <LanguageStack languages={languages} />}
      </Header>

      {orderedBadges && <BadgesGroup badges={orderedBadges} />}
    </Container>
  );
}

const relevantBadgeTypes = ['Role', 'Modifications', 'Behavior'];

const Container = styled(Card)`
  flex-grow: 1;

  ${BadgesGroup} {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;
`;

const TitleAndStatistics = styled.div`
  flex-grow: 1;

  ${Title} {
    font-size: var(--font-size-l);
    font-weight: 600;
    margin: 0;
  }

  ${Paragraph} {
    color: var(--color-blue-gray-60);
    font-size: var(--font-size-s);
    font-weight: 300;
    margin: 0;
  }
`;

const Statistics = styled(
  forwardRef<HTMLSpanElement, StyledProps<{ value?: number; single?: string; plural?: string }>>(
    ({ value = 0, single, plural, ...props }, ref) => (
      <span ref={ref} {...props}>
        {value} {pluralFormat(value, single, plural ?? `${single}s`)}
      </span>
    )
  )
)`
  &:not(:last-child):after {
    content: '·';
    margin: 0 2rem;
  }
`;
