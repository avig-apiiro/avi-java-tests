import styled from 'styled-components';
import { ConsumableBadges } from '@src-v2/components/consumable-badges';
import { VendorIcon } from '@src-v2/components/icons';
import { DistanceTime, TimeTooltip } from '@src-v2/components/time';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Link } from '@src-v2/components/typography';
import { RepositoryProfileResponse } from '@src-v2/types/profiles/repository-profile-response';

const PopoverContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const RepositoryPopover = ({
  repositoryProfile,
}: {
  repositoryProfile: RepositoryProfileResponse;
}) => {
  return (
    <Container>
      {repositoryProfile.provider && <VendorIcon name={repositoryProfile.provider} />}
      <Popover
        content={
          <PopoverContainer>
            {repositoryProfile.firstActivityAt && (
              <TimeTooltip date={repositoryProfile.firstActivityAt}>
                <span>
                  First activity{' '}
                  <DistanceTime date={repositoryProfile.firstActivityAt} addSuffix strict />
                </span>
              </TimeTooltip>
            )}
            {repositoryProfile.isActive && (
              <TimeTooltip date={repositoryProfile.lastActivityAt}>
                <span>
                  Last activity{' '}
                  <DistanceTime date={repositoryProfile.lastActivityAt} addSuffix strict />
                </span>
              </TimeTooltip>
            )}
            <ConsumableBadges consumableProfile={repositoryProfile} />
          </PopoverContainer>
        }>
        <Link to={`/profiles/repositories/${repositoryProfile.key}`}>
          {repositoryProfile.uniqueName}
        </Link>
      </Popover>
    </Container>
  );
};
