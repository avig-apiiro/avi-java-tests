import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';

const BadgesContainer = styled.div`
  display: flex;
  gap: 2.5rem;
`;

export const ConsumableBadges = ({ consumableProfile, ...props }) => {
  const badges = useMemo(
    () =>
      _.sortBy(
        consumableProfile.badges?.map(badgeKey => badgeMap[badgeKey]).filter(Boolean) ?? [],
        'order'
      ),
    [consumableProfile.badges]
  );
  return (
    badges.length > 0 && (
      <BadgesContainer {...props}>
        {badges.map(({ title, tooltip }) => (
          <Tooltip key={title} content={tooltip}>
            <Badge>{title}</Badge>
          </Tooltip>
        ))}
      </BadgesContainer>
    )
  );
};

const badgeMap = {
  Apis: { title: 'API', tooltip: 'Holds APIs', order: 1 },
  Piis: { title: 'PII', tooltip: 'Holds PII data', order: 2 },
  DataModels: { title: 'DM', tooltip: 'Holds data models', order: 4 },
};
