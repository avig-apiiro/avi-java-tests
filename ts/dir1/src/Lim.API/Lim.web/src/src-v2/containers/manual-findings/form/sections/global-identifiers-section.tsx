import { useFieldArray } from 'react-hook-form';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading3, Heading5 } from '@src-v2/components/typography';
import {
  RowWrapper,
  TrashCircleButton,
} from '@src-v2/containers/manual-findings/form/components/use-field-to-component';

export const GlobalIdentifiersSection = () => (
  <FormLayoutV2.Section>
    <Heading3>Global identifiers</Heading3>
    <PlainGlobalIdentifiers
      placeholder="Type a CVE ID (e.g. CVE-2024-1776)..."
      title="CVE"
      name="globalIdentifiers.cveGlobalIdentifiers"
    />
    <PlainGlobalIdentifiers
      placeholder="Type a CWE ID (e.g. CWE-325)..."
      title="CWE"
      name="globalIdentifiers.cweGlobalIdentifiers"
    />
  </FormLayoutV2.Section>
);

const PlainGlobalIdentifiers = ({
  name,
  placeholder,
  title,
}: {
  name: string;
  placeholder: string;
  title: string;
}) => {
  const { fields, remove, append } = useFieldArray({ name });
  const regex = title.toLowerCase() === 'cve' ? /^CVE-\d{4}-\d{4,}$/i : /^CWE-\d{1,3}$/i;

  return (
    <>
      <FormLayoutV2.Label>
        <Heading5>{title}</Heading5>
        {fields?.map((field, index) => (
          <RowWrapper key={field.id}>
            <InputControl
              name={[name, index, title.toLowerCase()].join('.')}
              placeholder={placeholder}
              rules={{ pattern: regex }}
            />
            {fields.length > 1 && <TrashCircleButton index={index} remove={() => remove(index)} />}
          </RowWrapper>
        ))}
      </FormLayoutV2.Label>
      <ActionButton>
        <CircleButton size={Size.XSMALL} onClick={() => append({})}>
          <SvgIcon name="Plus" />
        </CircleButton>
        Add {title}
      </ActionButton>
    </>
  );
};

const ActionButton = styled.label`
  display: flex;
  gap: 1rem;
  width: fit-content;

  :hover {
    cursor: pointer;
  }
`;
