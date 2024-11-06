import { ReactNode } from 'react';
import styled from 'styled-components';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { Heading4 } from '@src-v2/components/typography';
import { ProfileTagsList } from '@src-v2/containers/profiles/profile-tags/profile-tags-list';

interface ProfileTagsOverviewCardProps {
  heading: string;
  isEmpty?: boolean;
  onOpenManageModal: () => void;
  children?: ReactNode;
}

export function ProfileTagsPreviewContainer({
  heading,
  isEmpty,
  children,
  onOpenManageModal,
}: ProfileTagsOverviewCardProps) {
  return (
    <ProfileTagsCard>
      <Heading4>{heading}</Heading4>
      <TextButton mode={LinkMode.INTERNAL} onClick={onOpenManageModal} type="button">
        {isEmpty ? 'Create tags' : 'Manage tags'}
      </TextButton>

      {!isEmpty ? children : <EmptyTagsContainer>No tags created</EmptyTagsContainer>}
    </ProfileTagsCard>
  );
}

const EmptyTagsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;

const ProfileTagsCard = styled(Card)`
  margin-top: 5rem;
  display: grid;
  grid-template-areas:
    'heading action'
    'content content';
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr;
  row-gap: 4rem;
  padding: 4rem 5rem;
  width: 50%;
  min-height: 31rem;

  ${Heading4} {
    grid-area: heading;
  }

  ${TextButton} {
    grid-area: action;
  }

  ${EmptyTagsContainer}, ${ProfileTagsList} {
    grid-area: content;
  }
`;
