/*
import { ArgsTable, Canvas, Meta, Story } from '@storybook/addon-docs';
import { Controller } from 'react-hook-form';
import { Button } from '@src-v2/components/button-v2';
import { FormContext, Input } from '@src-v2/components/forms';
import { Form } from '@src-v2/components/forms/form-layout';
import { Heading, Paragraph } from '@src-v2/components/typography';

<Meta title="Shared/Forms/Form" component={FormContext} args={{}} />

# Form

<Canvas>
  <Story name="Form">
    {args => (
      <FormContext {...args} onSubmit={() => alert('Submitted Form')} shouldUseNativeValidation>
        <Form.Header>
          <Form.Details>
            <Heading>Title</Heading>
            <Paragraph>Subtitle</Paragraph>
          </Form.Details>
          <Button>Submit</Button>
        </Form.Header>
        <Form.Fieldset as="label">
          <Heading>LimitedInput example</Heading>
          <Controller
            name="name"
            rules={{ required: true, pattern: /\S/ }}
            render={({ field: { value, ...field } }) => (
              <Input
                {...field}
                value={value ?? ''}
                placeholder="Enter text here"
                autoComplete="off"
                autoFocus
              />
            )}
          />
        </Form.Fieldset>
      </FormContext>
    )}
  </Story>
</Canvas>

<ArgsTable story="Form" />
*/
