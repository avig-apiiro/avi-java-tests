import styled from 'styled-components';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { RiskDetailsIconContainer } from '@src-v2/components/risk/risk-details';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { RiskFactorPopover } from '@src-v2/components/risk/risk-popovers';
import { PointsOfContact } from '@src-v2/containers/profiles/points-of-contact';
import { OrganizationTeamProfileResponse } from '@src-v2/types/profiles/organization-team-profile-response';
import { humanize } from '@src-v2/utils/string-utils';

interface TeamHeaderRiskDetailsProps {
  profile: OrganizationTeamProfileResponse;
  profileKey: String;
}

export const TeamHeaderRiskDetails = ({
  profile,
  profileKey,
  ...props
}: TeamHeaderRiskDetailsProps) => (
  <TeamDetailsContainer {...props}>
    {profile.pointsOfContact.length > 0 && (
      <PointsOfContact
        identities={profile.pointsOfContact}
        profileKey={profileKey}
        isActive={profile.isActive}
      />
    )}
    <RiskFactorPopover
      title={humanize(`${profile.riskLevel} Risk`, true)}
      profile={{ ...profile, profileType: 'teams' }}
      interactive>
      <RiskDetailsIconContainer>
        <RiskIcon riskLevel={profile.riskLevel} />
      </RiskDetailsIconContainer>
    </RiskFactorPopover>
  </TeamDetailsContainer>
);

export const TeamDetailsContainer = styled.div`
  display: flex;
  user-select: none;
  gap: 1rem;
  cursor: pointer;
  justify-content: space-between;
  align-items: center;

  ${Label} {
    color: var(--default-text-color);
    font-size: var(--font-size-xs);
    font-weight: 300;
    white-space: nowrap;
    line-height: 1;
  }
`;
