import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Heading5 } from '@src-v2/components/typography';
import { TagResponseBadge } from '@src-v2/containers/profiles/profile-tags/tag-response-badge';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { StyledProps } from '@src-v2/types/styled';

export interface ProfileTagsOverviewProps {
  tags: TagResponse[];
  tagsLimit?: number | false;
}

export const ProfileTagsList = styled(
  ({ tags, tagsLimit = 10, ...props }: ProfileTagsOverviewProps & StyledProps) => (
    <div {...props}>
      <TrimmedCollectionDisplay
        limit={tagsLimit !== false ? tagsLimit : tags.length}
        item={({ value }) => <TagResponseBadge tag={value} />}
        excessiveItem={({ value }) => (
          <ExcessiveItemContainer>
            <Heading5>
              <ClampText>{value.name}</ClampText>
            </Heading5>{' '}
            : <ClampText>{value.value}</ClampText>
          </ExcessiveItemContainer>
        )}>
        {tags}
      </TrimmedCollectionDisplay>
    </div>
  )
)`
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  gap: 1rem;
`;

const ExcessiveItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
