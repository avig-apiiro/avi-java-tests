import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { FormFieldArray } from '@src-v2/components/forms/form-field-array';
import { SelectV2 } from '@src-v2/components/select/select-v2';
import { FormTagValue } from '@src-v2/containers/profiles/profile-tags/manage-profile-tags-modal';
import { SingleTagSelection } from '@src-v2/containers/profiles/profile-tags/single-tag-selection';
import { TagOption } from '@src-v2/types/profiles/tags/profile-tag';

interface TagsSelectionProps {
  name?: string;
  tagOptions: TagOption[];
}

export function TagsSelection({ name = 'tags', tagOptions }: TagsSelectionProps) {
  const formTags: FormTagValue[] = useWatch({ name });

  const formUsedTagsData = useMemo(
    () =>
      formTags.reduce<Record<string, { name: string; values: string[] }>>((result, formTag) => {
        if (!formTag.keyOption) {
          return result;
        }

        if (!result[formTag.keyOption.key]) {
          result[formTag.keyOption.key] = {
            name: formTag.keyOption.name,
            values: [],
          };
        }

        if (formTag.valueOption?.value) {
          result[formTag.keyOption.key].values = [
            ...(result[formTag.keyOption.key].values ?? []),
            formTag.valueOption.value,
          ];
        }

        return result;
      }, {}),
    [formTags]
  );

  return (
    <TagsFieldArray buttonText="Add tag" name={name} options={{ shouldUnregister: true }}>
      {({ name }: { name: string }) => (
        <SingleTagSelection name={name} tagOptions={tagOptions} usedTagsData={formUsedTagsData} />
      )}
    </TagsFieldArray>
  );
}

const TagsFieldArray = styled(FormFieldArray)`
  padding-bottom: 2rem;

  ${FormFieldArray.FieldContainer} {
    line-height: 9rem;

    ${SelectV2.Container} {
      flex: 1;
    }
  }
`;
