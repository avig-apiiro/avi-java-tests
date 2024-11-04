import { ReactNode } from 'react';
import styled from 'styled-components';
import { Caption1, EllipsisText, Title } from '@src-v2/components/typography';
import {
  ApplicationsView,
  ConsumableProfileView,
  ProfilesSeparator,
  TeamsView,
} from '@src-v2/containers/profiles/consumable-profiles-view';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';

export function ProfileRelatedPaneHeader({
  repositoryProfile,
  applications = [],
  orgTeams = [],
  children,
}: {
  repositoryProfile: LeanConsumableProfile;
  applications?: LeanApplication[];
  orgTeams?: LeanOrgTeamWithPointsOfContact[];
  children: ReactNode;
}) {
  return (
    <Container>
      <TitleRow>{children}</TitleRow>
      <ProfilesSeparator>
        {Boolean(orgTeams?.length) && (
          <>
            <Caption1>Teams:</Caption1>
            <TeamsView teams={orgTeams} />
          </>
        )}
        {Boolean(applications?.length) && (
          <>
            <Caption1>Applications:</Caption1>
            <ApplicationsView applications={applications} />
          </>
        )}
        <>
          <Caption1>Repository:</Caption1>
          <ConsumableProfileView profile={repositoryProfile} />
        </>
      </ProfilesSeparator>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${Title} {
    font-size: var(--font-size-l);
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > ${EllipsisText} {
    flex-grow: 1;
  }
`;
