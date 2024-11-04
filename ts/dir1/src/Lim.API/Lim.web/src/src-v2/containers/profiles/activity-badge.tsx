import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { SvgIcon } from '@src-v2/components/icons';
import { DateTime, DistanceTime, OptionalDate } from '@src-v2/components/time';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { SubHeading4 } from '@src-v2/components/typography';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';
import { RepositoryProfileResponse } from '@src-v2/types/profiles/repository-profile-response';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export function ActivityBadge({ profile }: { profile: CodeProfileResponse }) {
  const createdAt = isTypeOf<{ createdAt: OptionalDate }>(profile, 'createdAt')
    ? profile.createdAt
    : undefined;

  const isArchived = isTypeOf<RepositoryProfileResponse>(profile, 'isArchived')
    ? profile.isArchived
    : undefined;

  return (
    <Tooltip
      placement="bottom-start"
      content={
        <>
          Last activity on <DateTime date={profile.lastActivityAt} format="PPP" /> &middot;{' '}
          {createdAt && (
            <>
              Created on <DateTime date={createdAt} format="PPP" />{' '}
            </>
          )}
          {createdAt && profile.firstActivityAt && (
            <>
              Active since <DateTime date={profile.firstActivityAt} format="PPP" />
            </>
          )}
        </>
      }>
      {(profile.firstActivityAt || isArchived) && (
        <Badge data-inactive={dataAttr(!profile.isActive || isArchived)}>
          <SubHeading4>Activity: </SubHeading4>
          {isArchived ? (
            <>
              <SvgIcon name="Archive" />
              Archived
            </>
          ) : (
            <>
              <ActivityIndicator active={profile.isActive} size={Size.XSMALL} />
              {profile.isActive ? (
                <>
                  In development for <DistanceTime date={profile.firstActivityAt} strict />
                </>
              ) : (
                'Inactive'
              )}
            </>
          )}
        </Badge>
      )}
    </Tooltip>
  );
}

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: pre-wrap;

  ${ActivityIndicator} {
    margin: 0 1.25rem 0 2.25rem;
  }
`;
