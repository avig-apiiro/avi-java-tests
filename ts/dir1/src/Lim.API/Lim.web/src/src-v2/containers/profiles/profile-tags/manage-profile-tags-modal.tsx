import _ from 'lodash';
import { ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Form } from '@src-v2/components/forms/form-layout';
import { SvgIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1 } from '@src-v2/components/typography';
import { TagsSelection } from '@src-v2/containers/profiles/profile-tags/tags-selection';
import { TagOption, TagResponse, TagSource } from '@src-v2/types/profiles/tags/profile-tag';
import { humanize } from '@src-v2/utils/string-utils';

export type ManageProfileTagsModalProps = {
  defaultValues?: { tags: TagResponse[] };
  tagOptions: TagOption[];
  typePrefix: 'Team' | 'Application' | 'Repository';
  description?: ReactNode;
  submitText?: string;
  onClose: () => void;
  onSubmit: (data: { tags: TagResponse[] }) => void;
};

export interface FormTagValue {
  keyOption: TagOption;
  valueOption: { label: string; value: string };
}

export const ManageProfileTagsModal = styled(
  ({
    typePrefix,
    description,
    submitText = 'Apply',
    tagOptions,
    defaultValues = { tags: [] },
    onSubmit,
    onClose,
    ...props
  }: ManageProfileTagsModalProps) => {
    const defaultSelectedTags = useMemo<FormTagValue[]>(() => {
      if (!defaultValues.tags?.length) {
        return [];
      }

      const tagOptionsByKey = _.keyBy(tagOptions, 'name');
      return defaultValues.tags.map(({ name, value }) => {
        const tagOption = tagOptionsByKey[name];

        return { keyOption: tagOption, valueOption: { value, label: value } };
      });
    }, [defaultValues]);

    const handleSubmit = useCallback(
      ({ tags }: { tags: FormTagValue[] }) =>
        onSubmit({
          tags: tags
            .filter(tag => Boolean(tag?.keyOption) && Boolean(tag?.valueOption))
            .map(tag => ({
              key: tag.keyOption.key,
              name: tag.keyOption.name,
              value: tag.valueOption.value,
              source: TagSource.Manual,
            })),
        }),
      [onSubmit]
    );

    return (
      <ConfirmationModal
        {...props}
        as={Form}
        title={`${typePrefix} tag management`}
        defaultValues={{ tags: defaultSelectedTags }}
        confirmOnClose
        submitText={submitText}
        onSubmit={handleSubmit}
        onClose={onClose}>
        <AsyncBoundary>
          <TagsSelection tagOptions={tagOptions} />
        </AsyncBoundary>

        <Caption1>
          <SvgIcon name="Info" size={Size.XXSMALL} />{' '}
          {description ??
            `Only unique pairs of key:values are accepted per ${humanize(typePrefix)}`}
        </Caption1>
      </ConfirmationModal>
    );
  }
)`
  width: 155rem;
  min-width: 155rem;
  max-height: 175.5rem;

  ${Modal.Header} {
    padding-bottom: 1rem;
  }

  ${Form} {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    ${Modal.Content} {
      padding-top: 6rem;
      flex-grow: 1;
      overflow: auto;
      font-size: var(--font-size-s);

      > ${Caption1} {
        display: flex;
        margin-top: 2rem;
        justify-content: flex-start;
        align-items: center;
        gap: 1.5rem;
        line-height: 1.5;
      }
    }
  }
`;
