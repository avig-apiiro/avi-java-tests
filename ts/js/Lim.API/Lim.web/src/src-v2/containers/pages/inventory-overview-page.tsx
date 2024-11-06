import { observer } from 'mobx-react';
import styled from 'styled-components';
import { StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { Subtitle } from '@src-v2/components/typography';
import { ContributorsContent } from '@src-v2/containers/overview/contributors-content';
import { HighlightsSection } from '@src-v2/containers/overview/highlights-section';
import { OrganizationAttackSurface } from '@src-v2/containers/overview/organization-attack-surface';
import { TechnologiesContent } from '@src-v2/containers/overview/technologies-content';
import { useInject } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';
import { makeUrl } from '@src-v2/utils/history-utils';

export default observer(() => {
  const { organization } = useInject();

  return (
    <Page title="Inventory Overview">
      <StickyHeader />

      <InventorySection
        attackSurface={<OrganizationAttackSurface />}
        contributors={<ContributorsContent dataFetcher={organization.getContributors} />}
        technologies={
          <TechnologiesContent
            dataFetcher={organization.getTechnologies}
            linkFunc={buildTechnologyUrl}
          />
        }
      />
    </Page>
  );
});

const InventorySection = styled(HighlightsSection)`
  grid-template-rows: 0 fit-content(0) 78rem;

  > ${Subtitle} {
    display: none;
  }
`;

function buildTechnologyUrl(item: StubAny, subcategory: string) {
  return makeUrl('/profiles/repositories', {
    fl: { [subcategory === 'Languages' ? subcategory : 'Technologies']: { values: [item] } },
  });
}
