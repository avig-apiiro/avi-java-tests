import styled from 'styled-components';
import { useProfilesContext } from '@src-v2/components/profiles-inject-context';
import { RouteDefinition } from '@src-v2/components/tabs/tabs-router';
import { Subtitle } from '@src-v2/components/typography';
import {
  InventoryTabProps,
  LegacyInventoryConsumableProfile,
} from '@src-v2/containers/inventory/inventory-v2';
import { ContributorsContent } from '@src-v2/containers/overview/contributors-content';
import { HighlightsSection } from '@src-v2/containers/overview/highlights-section';
import { TechnologiesContent } from '@src-v2/containers/overview/technologies-content';
import { ProfileAttackSurfaceHighlights } from '@src-v2/containers/profiles/profile-attack-surface-highlights';

export function getOverviewRouteDefinition({
  profile,
  profileType,
}: InventoryTabProps): RouteDefinition {
  const profileTypeForAttackSurface = getProfileTypeForAttackSurface(profileType);

  return {
    title: 'Overview',
    path: 'overview',
    condition: Boolean(profileTypeForAttackSurface),
    render: () => (
      <InventoryOverviewContent profile={profile} profileType={profileTypeForAttackSurface} />
    ),
  };
}

const InventoryOverviewContent = ({
  profile,
  profileType,
}: {
  profile: LegacyInventoryConsumableProfile;
  profileType: string;
}) => {
  const { profiles } = useProfilesContext();

  return (
    <InventoryHighlightsSection
      attackSurface={
        <ProfileAttackSurfaceHighlights dataFetcher={profiles.getAttackSurfaceHighlights} />
      }
      contributors={
        !(profileType === 'assetCollections' && profile.isModuleBased) && (
          <ContributorsContent dataFetcher={profiles.getLegacyContributors} />
        )
      }
      technologies={<TechnologiesContent dataFetcher={profiles.getTechnologies} />}
    />
  );
};

const InventoryHighlightsSection = styled(HighlightsSection)`
  margin-top: 4rem;
  padding: 0 0 10rem;
  grid-template-areas:
    'attackSurface technologies'
    'contributors technologies';
  grid-template-rows: fit-content(0) 78rem;

  > ${Subtitle} {
    display: none;
  }
`;

function getProfileTypeForAttackSurface(v1ProfileType: string) {
  switch (v1ProfileType) {
    case 'assetCollection':
      return 'assetCollections';
    case 'repository':
      return 'repositories';
    default:
      return null;
  }
}
