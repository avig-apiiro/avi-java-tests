import styled, { css } from 'styled-components';
import { AvatarProfile } from '@src-v2/components/avatar';
import { TextButton } from '@src-v2/components/button-v2';
import { DistanceTime, TimeTooltip } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { ContributorBadges } from './contributor-badges';

const FontBodySmall = css`
  color: var(--default-text-color);
  font-size: var(--font-size-s);
  line-height: 4.5rem;
  font-weight: 300;
`;

const StyledDeveloperRolesBadge = styled(ContributorBadges)`
  margin-left: auto;
  ${FontBodySmall};
`;

const demoDeveloperLogins = [
  '81.218.220.22, Tel Aviv, Israel on Apr 18',
  '62.56.136.64, Tel Aviv, Israel on Apr 17',
  '62.56.141.63, Tel Aviv, Israel on Apr 16',
  '62.56.145.223, Tel Aviv, Israel on Jan 22',
  '161.185.160.93, New York, United States on May 3',
  '199.168.151.207, New York, United States on May 9',
  '78.31.205.123, New York, United States on Jun 7',
  '78.31.205.114, New York, United States on Jun 3',
];

export const DeveloperActivityInsights = (developerProfile, isDemo) => [
  developerProfile.lastActivity && (
    <TimeTooltip key="last" date={developerProfile.lastActivity}>
      <span>
        Last activity <DistanceTime date={developerProfile.lastActivity} addSuffix strict />
      </span>
    </TimeTooltip>
  ),
  developerProfile.activeSince && (
    <TimeTooltip key="since" date={developerProfile.activeSince}>
      <span>
        Active since <DistanceTime date={developerProfile.activeSince} addSuffix strict />
      </span>
    </TimeTooltip>
  ),
  isDemo && (
    <span key="login">
      Last login from{' '}
      {demoDeveloperLogins[developerProfile.displayName.length % demoDeveloperLogins.length]}
    </span>
  ),
];

export const DeveloperTooltipStack = styled.div`
  display: flex;
  text-align: left;
  flex-wrap: unset;
  align-items: flex-start;
  gap: 2.5rem;
  flex-grow: 1;
  justify-content: space-between;
`;

type ContributorType = {
  developerProfile: any;
  className?: string;
  hideImage?: boolean;
  underline?: string;
  link?: boolean;
  roleBadges?: any[];
};

export const ContributorTooltip = ({
  className,
  developerProfile,
  hideImage,
  underline,
  link = true,
  roleBadges,
  ...props
}: ContributorType) => {
  const developerTooltip = () => (
    <DeveloperTooltipStack>
      <AvatarProfile
        size={Size.SMALL}
        active={developerProfile.isActive}
        identityKey={developerProfile.key}
        username={developerProfile.displayName}
        lastActivity={developerProfile.lastActivity}
        activeSince={developerProfile.activeSince}>
        <TextButton underline to={`/users/contributors/${developerProfile.key}`}>
          {developerProfile.displayName}
        </TextButton>
      </AvatarProfile>
      <StyledDeveloperRolesBadge badges={roleBadges} />
    </DeveloperTooltipStack>
  );

  return <Container {...props}>{developerTooltip()}</Container>;
};

const Container = styled.div``;
