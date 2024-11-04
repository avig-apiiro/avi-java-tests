import _ from 'lodash';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { Card } from '@src-v2/components/cards';
import { LanguageStack } from '@src-v2/components/circles';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { CardTitle } from '@src-v2/components/panes/pane-body';
import { Link } from '@src-v2/components/typography';
import { useRepositoryContext } from '@src-v2/containers/repository-pane/repository-context-provider';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { Language } from '@src-v2/types/enums/language';
import { entries } from '@src-v2/utils/ts-utils';

export function AboutRepositoryCard() {
  const { repository } = useRepositoryContext();

  const unorderedLanguagePercentages = entries(repository.languagePercentages).map(
    ([language, value]) => ({
      language,
      value,
    })
  );
  const languages = _.orderBy(
    unorderedLanguagePercentages,
    languagePercentage => languagePercentage.value,
    'desc'
  ).map(languagePercentage => ({
    name: Language[languagePercentage.language],
    icon: languagePercentage.language,
  }));

  return (
    <Card>
      <CardTitle>About this repository</CardTitle>
      <EvidenceLine label="Repository profile">
        <Link to={`/profiles/repositories/${repository.key}`}>{repository.name}</Link>
      </EvidenceLine>
      <EvidenceLine label="Number of commits">{repository.commitCount ?? 0}</EvidenceLine>
      <EvidenceLine label="Business impact">
        <BusinessImpactIndicator businessImpact={BusinessImpact[repository.businessImpactLevel]} />
      </EvidenceLine>
      <EvidenceLine label="Privacy">{repository.isPublic ? 'Public' : 'Private'}</EvidenceLine>
      {Boolean(repository.contributors?.total) && (
        <EvidenceLine label="Active contributors">
          {repository.contributors.recentlyActive.count} active out of{' '}
          {repository.contributors.total}
        </EvidenceLine>
      )}

      {Boolean(languages.length) && (
        <EvidenceLine label="Top languages">
          <LanguageStack languages={languages} />
        </EvidenceLine>
      )}
    </Card>
  );
}
