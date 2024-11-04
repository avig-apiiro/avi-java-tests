import _ from 'lodash';
import styled from 'styled-components';
import { BadgesGroup } from '@src-v2/components/badges-group';

const BadgeTypesOrder = ['Role', 'Modifications', 'Behavior'];

const BadgesContainer = styled.div`
  display: flex;
  gap: 2.5rem;
`;

export const ContributorBadges = ({ badges, categories = null }) => {
  const badgesByType = _.groupBy(badges, 'type');
  const typeAndBadgesToDisplay = Object.entries(
    categories?.length ? _.pick(badgesByType, categories) : badgesByType
  );

  return (
    !_.isEmpty(typeAndBadgesToDisplay) && (
      <BadgesContainer>
        {_.orderBy(typeAndBadgesToDisplay, ([key]) => BadgeTypesOrder.indexOf(key)).map(
          ([key, badgesGroup]) => (
            <BadgesGroup key={key} badges={badgesGroup} />
          )
        )}
      </BadgesContainer>
    )
  );
};
