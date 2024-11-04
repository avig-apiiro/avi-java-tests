import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Input } from '@src-v2/components/forms';
import { Form } from '@src-v2/components/forms/form-layout';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { defaultItemToString } from '@src-v2/hooks';

export const SensitiveDataDefinitionForm = () => {
  const { register } = useFormContext();

  return (
    <Container>
      <Form.Fieldset as="label">
        <Heading>Name</Heading>
        <Input {...register('name')} placeholder="My Custom Sensitive Data" autoFocus />
      </Form.Fieldset>

      <Form.Fieldset as="label">
        <Heading>Exact Match</Heading>
        <Paragraph>Mark fields that appear exactly as listed (case insensitive)</Paragraph>
        <Controller
          name="exactMatch"
          render={({ field: { onChange, ...field } }) => (
            <SearchCombobox
              as={MultiSelect}
              {...field}
              // @ts-expect-error
              placeholder="social-security-number,date_of_birth "
              itemToString={defaultItemToString}
              onSelect={event => onChange(event.selectedItems?.map(item => item?.value ?? item))}
              creatable
            />
          )}
        />
      </Form.Fieldset>

      <Form.Fieldset as="label">
        <Heading>Multiple Tokens</Heading>
        <Paragraph>
          Mark fields containing all tokens listed. For example, the mask "social,number" will match
          fields like 'socialSecurityNumber', 'socialnumber' etc. (case insensitive)
        </Paragraph>
        <Controller
          name="multipleTokens"
          render={({ field: { onChange, ...field } }) => (
            <SearchCombobox
              as={MultiSelect}
              {...field}
              // @ts-expect-error
              placeholder="social,number"
              itemToString={defaultItemToString}
              onSelect={event => onChange(event.selectedItems?.map(item => item?.value ?? item))}
              creatable
            />
          )}
        />
      </Form.Fieldset>

      <Form.Fieldset as="label">
        <Heading>Wildcards</Heading>
        <Paragraph>
          * matches zero or more non-space characters. For example, the mask "user*" will match
          fields like 'userAccount', 'user12345' etc. (case insensitive)
        </Paragraph>
        <Controller
          name="wildcards"
          render={({ field: { onChange, ...field } }) => (
            <SearchCombobox
              as={MultiSelect}
              {...field}
              // @ts-expect-error
              placeholder="user*"
              itemToString={defaultItemToString}
              onSelect={event => onChange(event.selectedItems?.map(item => item?.value ?? item))}
              creatable
            />
          )}
        />
      </Form.Fieldset>
    </Container>
  );
};

const Container = styled.div`
  > ${Form.Fieldset} {
    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
    }

    > ${Heading} {
      margin-bottom: 4rem;
      font-size: var(--font-size-m);

      & + ${Paragraph} {
        font-size: var(--font-size-s);
      }
    }
  }
`;
