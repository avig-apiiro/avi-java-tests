import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { StickyHeader } from '@src-v2/components/layout';
import { ClustersFirstTimeLayout } from '@src-v2/components/layout/first-time-layouts/clusters-first-time-layout';
import { Page } from '@src-v2/components/layout/page';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { SearchContent } from '@src/blocks/RiskProfilesPage/blocks/SearchPage';

export default function ClustersPage() {
  const { profiles, application } = useInject();
  const clustersSearchState = useSuspense(profiles.searchProfiles, { profileType: 'clusters' });
  const isEmptyState =
    application.isFeatureEnabled(FeatureFlag.EmptyStates) && clustersSearchState.total === 0;

  return (
    <Page title="Clusters">
      {isEmptyState ? (
        <ClustersFirstTimeLayout />
      ) : (
        <>
          <StickyHeader />
          <AsyncBoundary>
            {/*@ts-expect-error*/}
            <SearchContent profileType="clusters" itemName="clusters" />
          </AsyncBoundary>
        </>
      )}
    </Page>
  );
}
