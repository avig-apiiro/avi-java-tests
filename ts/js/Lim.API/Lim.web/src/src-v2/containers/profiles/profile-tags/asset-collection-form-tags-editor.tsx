import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ManageProfileTagsModal } from '@src-v2/containers/profiles/profile-tags/manage-profile-tags-modal';
import { ProfileTagsList } from '@src-v2/containers/profiles/profile-tags/profile-tags-list';
import { useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { TagOption, TagResponse, TagSource } from '@src-v2/types/profiles/tags/profile-tag';

type AssetCollectionFormTagsEditorProps = {
  typePrefix?: 'Application' | 'Team';
  optionsFetcher: () => Promise<TagOption[]>;
  noLimit?: true;
};

export const AssetCollectionFormTagsEditor = ({
  typePrefix = 'Application',
  noLimit,
  optionsFetcher,
}: AssetCollectionFormTagsEditorProps) => {
  const tagOptions = useSuspense(optionsFetcher);

  const [modalElement, setModal, closeModal] = useModalState();

  const { setValue } = useFormContext();
  const tags: TagResponse[] = useWatch({ name: 'tags' }) ?? [];

  const handleManageTagsClicked = useCallback(() => {
    const tagOptionKeys = tagOptions.map(option => option.key);
    const unsavedTags = tags.filter(tag => !tagOptionKeys.includes(tag.key));

    const updatedTagOptions = [
      ...tagOptions,
      ...unsavedTags.map(tagResponse => ({
        key: tagResponse.key,
        name: tagResponse.name,
        source: tagResponse.source,
        provider: tagResponse.provider,
        optionalValues: [tagResponse.value],
      })),
    ];
    setModal(
      <ManageProfileTagsModal
        typePrefix={typePrefix}
        tagOptions={updatedTagOptions}
        defaultValues={{ tags: tags.filter(tag => tag.source === TagSource.Manual) }}
        submitText="Apply"
        onSubmit={handleApplyTags}
        onClose={closeModal}
      />
    );

    function handleApplyTags({ tags: updatedTags }: { tags: TagResponse[] }) {
      setValue('tags', tags.filter(tag => tag.source !== TagSource.Manual).concat(updatedTags));
      closeModal();
    }
  }, [tags, closeModal]);

  return (
    <Container>
      {Boolean(tags?.length) && (
        <ProfileTagsList tagsLimit={noLimit ? false : undefined} tags={tags} />
      )}
      <Button
        type="button"
        startIcon="Edit"
        variant={Variant.SECONDARY}
        size={Size.LARGE}
        onClick={handleManageTagsClicked}>
        {tags?.length ? 'Manage' : 'Create'} tags
      </Button>
      {modalElement}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  ${FormLayoutV2.Section} > & ${ProfileTagsList} {
    border-radius: 2rem;
    background-color: var(--color-blue-gray-10);
    box-shadow: var(--elevation-0);
    padding: 2rem;
    margin-bottom: 2rem;
  }
`;
