import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { Combobox } from '@src-v2/components/forms';
import { InputControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { ApplicationGroupForm } from '@src-v2/containers/application-groups/application-group-form';
import { AdvancedContainer } from '@src-v2/containers/applications/advanced-definitions-fields/advanced-definitions-tabs';
import { PointOfContactFields } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { AssetCollectionFormTagsEditor } from '@src-v2/containers/profiles/profile-tags/asset-collection-form-tags-editor';
import { SelectInput } from '@src-v2/containers/select-input';
import { useInject, useValidation } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

const ApplicationGroupCreate = ({ editMode }) => {
  const { state } = useLocation<{ defaultValues: any }>();
  return (
    <ApplicationGroupForm editMode={editMode} defaultValues={state?.defaultValues}>
      <ApplicationGroupContent />
    </ApplicationGroupForm>
  );
};
const ApplicationGroupContent = () => {
  const { applicationProfiles, applicationGroupProfiles, application } = useInject();
  const { validateEmptySpace } = useValidation();
  const applicationGroupSource = useWatch({ name: 'source' });
  const disableEdit = Boolean(applicationGroupSource);

  return (
    <>
      <StickyHeader>
        <Button to="/profiles/groups" variant={Variant.SECONDARY} size={Size.LARGE}>
          Cancel
        </Button>
        <SubmitButton />
      </StickyHeader>
      <FormContentContainer>
        <GroupDetailsFieldSet as="label">
          <Heading>Group Name</Heading>
          <GroupDetailsInput
            name="name"
            placeholder="Type Name"
            disabled={disableEdit}
            rules={{
              required: true,
              validate: validateEmptySpace,
            }}
          />
          <Heading>Group Description</Heading>
          <GroupDetailsInput
            disabled={disableEdit}
            name="description"
            placeholder="Type a description"
          />
        </GroupDetailsFieldSet>

        <Form.Fieldset as="label">
          <Heading>Applications</Heading>
          <Paragraph>Collect applications belonging to this group</Paragraph>
          <Controller
            name="applications"
            rules={{ required: true, pattern: /\S/ }}
            render={({ field: { onChange, ...field } }) => (
              <SelectInput
                {...field}
                // @ts-expect-error
                as={MultiSelect}
                disabled={disableEdit}
                itemToString={item => item?.name}
                searchMethod={applicationProfiles.searchConfigurationSuggestions}
                onSelect={event => onChange(event.selectedItems)}
              />
            )}
          />
        </Form.Fieldset>

        <Form.Fieldset>
          <Heading>Advanced Definitions (optional)</Heading>
          <AdvancedDefinitions>
            {/*@ts-expect-error*/}
            <AdvancedContainer selected>
              <Heading>
                Points of Contact
                <InfoTooltip content="Define lead personas for this team" />
              </Heading>
              <PointOfContactFields legacyLayout name="pointsOfContact" />
            </AdvancedContainer>
            <Form.Fieldset>
              <TagManagementContainer>
                {application.isFeatureEnabled(FeatureFlag.ApplicationGroupTags) ? (
                  <TagsContainer>
                    <Heading>Tags management</Heading>
                    <AssetCollectionFormTagsEditor
                      optionsFetcher={applicationGroupProfiles.getApplicationGroupTagsOptions}
                    />
                  </TagsContainer>
                ) : (
                  <>
                    <Paragraph />
                    <SelectControlV2
                      creatable
                      multiple
                      name="tags"
                      placeholder=""
                      rules={{ pattern: validateEmptySpace }}
                    />
                  </>
                )}
              </TagManagementContainer>
            </Form.Fieldset>
          </AdvancedDefinitions>
        </Form.Fieldset>
      </FormContentContainer>
    </>
  );
};

export default ApplicationGroupCreate;

const AdvancedDefinitions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

function SubmitButton() {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button loading={isSubmitting} type="submit" size={Size.LARGE}>
      Save
    </Button>
  );
}

const GroupDetailsInput = styled(InputControl)`
  width: 85rem;
`;

const FormContentContainer = styled(Gutters)`
  ${Combobox} {
    max-width: 160rem;
  }
`;

const GroupDetailsFieldSet = styled(Form.Fieldset)`
  ${Heading} {
    margin-top: 5rem;
  }
`;

const TagManagementContainer = styled(Form.Fieldset)`
  border-top: 0.25rem solid var(--color-blue-gray-35);
  padding-top: 8rem;
`;

const TagsContainer = styled(Card)`
  width: 150rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  ${Heading} {
    font-size: var(--font-size-l);
    font-weight: 600;
  }
`;
