import { Controller } from 'react-hook-form';
import styled from 'styled-components';
import { Input } from '@src-v2/components/forms';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { Heading } from '@src-v2/components/typography';

export const SecretsExclusionDefinitionForm = () => {
  const namePlaceholder = 'My Custom Secret Exclusion Definition';

  return (
    <Container>
      <Form.Fieldset as="label">
        <Heading>Name</Heading>
        <InputControl
          name="name"
          placeholder={namePlaceholder}
          rules={{ required: true }}
          autoFocus
        />
      </Form.Fieldset>

      <Form.Fieldset as="label">
        <Heading>Application IDs</Heading>
        <InputControl name="appIds" />
      </Form.Fieldset>

      <Form.Fieldset as="label">
        <Heading>Repository IDs</Heading>
        <InputControl name="repoIds" />
      </Form.Fieldset>

      <Form.Fieldset as="label">
        <Heading>File paths</Heading>
        <Controller
          name="filesPathRegex"
          render={({ field }) => (
            <Input
              value={field.value?.join(',') ?? ''}
              // @ts-ignore
              onChange={event => field.onChange(event.target.value.split(','))}
              placeholder="e.g. /path/to/*.txt"
            />
          )}
        />
      </Form.Fieldset>

      <Form.Fieldset as="label">
        <Heading>Secret Pattern</Heading>
        <Controller
          name="regexMatch"
          render={({ field }) => (
            <Input
              value={field.value?.join(',') ?? ''}
              // @ts-ignore
              onChange={event => field.onChange(event.target.value.split(','))}
              placeholder="e.g. org-name-*"
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
    }
  }
`;
