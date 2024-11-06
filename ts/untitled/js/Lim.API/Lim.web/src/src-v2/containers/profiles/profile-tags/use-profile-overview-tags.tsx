import { useCallback } from 'react';
import {
  ManageProfileTagsModal,
  ManageProfileTagsModalProps,
} from '@src-v2/containers/profiles/profile-tags/manage-profile-tags-modal';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { TagResponse, TagSource } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';

type UseManageProfileTagsModalParams = {
  profileKey: string;
  taggableEntityKey: string;
  defaultTags: TagResponse[];
  noToast: boolean;
  optionsFetcher: () => Promise<ManageProfileTagsModalProps['tagOptions']>;
  onSubmit: (key: string, tags: TagResponse[], profileKey: string) => Promise<void>;
} & Pick<ManageProfileTagsModalProps, 'typePrefix' | 'submitText'>;

export function useManageProfileTagsModal({
  profileKey,
  taggableEntityKey,
  typePrefix,
  optionsFetcher,
  defaultTags,
  onSubmit,
}: UseManageProfileTagsModalParams) {
  const { toaster } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();
  const tagOptions = useSuspense(optionsFetcher);

  const handleOpenModal = useCallback(() => {
    setModal(
      <ManageProfileTagsModal
        submitText="Save"
        typePrefix={typePrefix}
        defaultValues={{ tags: defaultTags.filter(tag => tag.source === TagSource.Manual) }}
        tagOptions={tagOptions}
        onSubmit={handleSaveTeamTags}
        onClose={closeModal}
      />
    );

    async function handleSaveTeamTags({ tags }: { tags: StubAny[] }) {
      try {
        await onSubmit(taggableEntityKey, tags, profileKey);
        closeModal();
        toaster.success(`${typePrefix} tags saved successfully.`);
      } catch {
        toaster.error('Application tags could not be saved.');
      }
    }
  }, [closeModal, defaultTags, setModal, tagOptions]);

  return [modalElement, handleOpenModal] as const;
}
