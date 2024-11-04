import { formatDistance } from 'date-fns';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { ClampText } from '@src-v2/components/clamp-text';
import {
  IgnoredRepositoryTooltip,
  UnmonitoredRepositoryTooltip,
} from '@src-v2/components/coverage-table/coverage-tooltips';
import { ElementSeparator, ElementSeparatorProps } from '@src-v2/components/element-separator';
import { VendorIcon } from '@src-v2/components/icons';
import { BusinessImpactPopover } from '@src-v2/components/risk/risk-popovers';
import { OptionalDate } from '@src-v2/components/time';
import { IconTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Caption1, EllipsisText, Light, Link, Paragraph } from '@src-v2/components/typography';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';
import { StyledProps } from '@src-v2/types/styled';
import { formatDate } from '@src-v2/utils/datetime-utils';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const ProfilesSeparator = styled(
  ({ children, ...props }: Omit<ElementSeparatorProps, 'as'>) => (
    <ElementSeparator as="div" {...props}>
      {children}
    </ElementSeparator>
  )
)`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${Caption1} {
    color: var(--color-blue-gray-55);
  }
`;

export const ApplicationsView = ({ applications = [] }: { applications: LeanApplication[] }) => (
  <LeanAssetCollectionView type="application" items={applications} />
);

export const TeamsView = ({ teams }: { teams: LeanOrgTeamWithPointsOfContact[] }) => (
  <LeanAssetCollectionView type="team" items={teams} />
);

const LeanAssetCollectionView = ({
  items = [],
  type,
}: {
  items: LeanApplication[];
  type: 'application' | 'team';
}) => {
  const toPrefix = `${type}s`;
  return (
    <AppViewContainer>
      <TrimmedCollectionDisplay
        limit={1}
        item={({ value: item }) => (
          <>
            <AppViewContainer>
              <Link to={`/profiles/${type}s/${item.key}`} onClick={stopPropagation}>
                <ClampText>{item.name}</ClampText>
              </Link>
            </AppViewContainer>
            {item.businessImpact !== 'None' && (
              <BusinessImpactPopover profile={item}>
                <BusinessImpactIndicator businessImpact={item.businessImpact} />
              </BusinessImpactPopover>
            )}
          </>
        )}
        excessiveItem={({ value: item }) => (
          <Link key={item.key} to={`/profiles/${toPrefix}/${item.key}`}>
            <EllipsisText>{item.name}</EllipsisText>
          </Link>
        )}>
        {items}
      </TrimmedCollectionDisplay>
    </AppViewContainer>
  );
};

const AppViewContainer = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: 1rem;
`;

export function activityContent(
  isActive: boolean,
  activeSince: OptionalDate,
  lastActivity: OptionalDate
) {
  if (!isActive) {
    return '';
  }

  if (isActive) {
    return activeSince
      ? `In development for ${formatDistance(new Date(activeSince), new Date())}`
      : 'Active';
  }

  return lastActivity
    ? `Inactive. Last activity on ${formatDate(new Date(lastActivity), 'daily')}`
    : 'Inactive';
}

export function ConsumableProfileView({
  profile,
  isActive,
  showArchivedIndicator,
  monitorStatus,
  ignoredBy,
  ignoreReason,
  lastMonitoringChangeTimestamp,
  children,
}: StyledProps<{
  profile: LeanConsumableProfile;
  isActive?: boolean;
  showArchivedIndicator?: boolean;
  monitorStatus?: string;
  ignoredBy?: string;
  ignoreReason?: string;
  lastMonitoringChangeTimestamp?: string;
}>) {
  const displayName = `${profile.name}${profile.referenceName ? ` (${profile.referenceName})` : ''}`;
  return (
    <LocationContainer>
      {profile.vendor && <VendorIcon name={profile.vendor} />}
      {children}
      {profile.type === 'RepositoryProfile' ? (
        <RepositoryDetailsTooltip
          content={
            <>
              {Boolean(profile.serverUrl) && (
                <Paragraph>
                  <Light>Server URL:</Light> {profile.serverUrl}
                </Paragraph>
              )}
              {profile.repositoryGroupId && profile.provider !== 'Github' && (
                <Paragraph>
                  <Light>Repository group:</Light> {profile.repositoryGroupId}
                </Paragraph>
              )}
              <Paragraph>
                <Light>Repository:</Light> {profile.name}
              </Paragraph>
              {Boolean(profile.referenceName) && (
                <Paragraph>
                  <Light>Branch:</Light> {profile.referenceName}
                </Paragraph>
              )}
            </>
          }
          delay={[500, null]}>
          {monitorStatus !== 'Ignored' && monitorStatus !== 'NotMonitored' ? (
            <Link to={`/profiles/repositories/${profile.key}`} onClick={stopPropagation}>
              <EllipsisText>{displayName}</EllipsisText>
            </Link>
          ) : (
            <EllipsisText>{displayName}</EllipsisText>
          )}
        </RepositoryDetailsTooltip>
      ) : (
        <ClampText>{displayName}</ClampText>
      )}
      <IconContainer>
        {isActive && (
          <ActivityIndicatorSmall
            content={activityContent(isActive, profile.activeSince, profile.lastActivity)}
            active={isActive}
          />
        )}
        {profile.businessImpact &&
          profile.businessImpact.toString() !== 'None' &&
          monitorStatus !== 'Ignored' &&
          monitorStatus !== 'NotMonitored' && (
            <BusinessImpactPopover profile={profile}>
              <BusinessImpactIndicator businessImpact={profile.businessImpact} />
            </BusinessImpactPopover>
          )}
        {showArchivedIndicator && <RepositoryIconTooltip name="Archive" content="Archived" />}
        {monitorStatus === 'Ignored' && (
          <RepositoryIconTooltip
            interactive
            name="Invisible"
            content={
              <IgnoredRepositoryTooltip
                serverUrl={profile.serverUrl}
                repositoryName={profile.name}
                ignoredBy={ignoredBy}
                ignoreReason={ignoreReason}
                lastMonitoringChangeTimestamp={lastMonitoringChangeTimestamp}
              />
            }
          />
        )}
        {monitorStatus === 'NotMonitored' && (
          <RepositoryIconTooltip
            interactive
            name="Invisible"
            content={
              <UnmonitoredRepositoryTooltip
                serverUrl={profile.serverUrl}
                repositoryName={profile.name}
              />
            }
          />
        )}
      </IconContainer>
    </LocationContainer>
  );
}

const RepositoryDetailsTooltip = styled(Tooltip as any)`
  ${Paragraph}:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActivityIndicatorSmall = styled(ActivityIndicator)`
  width: 1.5rem;
  height: 1.5rem;
  border-width: 0.25rem;
`;

const RepositoryIconTooltip = styled(IconTooltip)`
  color: var(--color-blue-gray-50);

  &:hover {
    color: var(--color-blue-gray-60);
  }
`;

export const LocationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow-x: hidden;

  ${Link} {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
