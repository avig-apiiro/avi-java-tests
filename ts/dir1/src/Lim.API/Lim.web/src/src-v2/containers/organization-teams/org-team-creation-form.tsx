import { useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Combobox, FormContext, Input } from '@src-v2/components/forms';
import { InputControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { ToastParagraph } from '@src-v2/components/toastify';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Heading1, Heading3, Heading5, SubHeading3 } from '@src-v2/components/typography';
import {
  CommunicationChannelResult,
  CommunicationConfigurationsField,
} from '@src-v2/containers/organization-teams/creation-form/communication-channels/communication-configurations-field';
import { TeamAssetsMappingSection } from '@src-v2/containers/organization-teams/creation-form/team-assets-mapping-section';
import {
  convertFormValuesToFlatTeamProfile,
  convertTeamProfileToFormValues,
} from '@src-v2/containers/organization-teams/creation-form/utils';
import {
  TeamOption,
  filterConfigurationRecord,
} from '@src-v2/containers/organization-teams/heirarchy-team-select-utils';
import { AssetsConfiguration } from '@src-v2/containers/profiles/assets-selection/assets-configuration-section';
import {
  FieldItem,
  PointOfContactFields,
} from '@src-v2/containers/profiles/points-of-contacts-fields';
import { AssetCollectionFormTagsEditor } from '@src-v2/containers/profiles/profile-tags/asset-collection-form-tags-editor';
import { useInject, useSuspense } from '@src-v2/hooks';
import { ConfigurationRecord } from '@src-v2/services/profiles/asset-collection-profiles-base';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';
import { ApiErrorCode } from '@src-v2/utils/api-error-code';

export type OrgTeamFormValues = {
  key?: string;
  name: string;
  description: string;
  parentTeamRecord?: ConfigurationRecord;
  tags: TagResponse[];

  pointsOfContact?: { developer: LeanDeveloper[]; jobTitle: { value: string; label: string } }[];
  communicationConfigurations?: CommunicationChannelResult[];
} & AssetsConfiguration;

export function OrgTeamCreationForm() {
  const { key } = useParams<{ key?: string }>();
  const { application, history, messaging, orgTeamProfiles, toaster } = useInject();

  const [orgTeamsRecords, existingProfile] = useSuspense([
    orgTeamProfiles.getTeamHierarchyChart,
    [orgTeamProfiles.getEnrichedProfile, { key }] as const,
  ]);

  const providersMessagingChannels = useSuspense(messaging.getProvidersChannels, {
    providers: existingProfile?.communicationChannelToProvider
      ? Object.keys(existingProfile.communicationChannelToProvider)
      : null,
  });

  const defaultValues = useMemo<OrgTeamFormValues>(
    () =>
      existingProfile
        ? convertTeamProfileToFormValues(
            existingProfile,
            orgTeamsRecords,
            providersMessagingChannels
          )
        : null,
    [existingProfile, orgTeamsRecords]
  );

  const orgTeamsSelectOptions = useMemo(
    () =>
      key
        ? orgTeamsRecords?.filter(
            record => record.key !== key && !record.hierarchy.some(item => item.key === key)
          )
        : orgTeamsRecords,
    [key, orgTeamsRecords]
  );

  const handleSubmit = useCallback(
    async (formData: OrgTeamFormValues) => {
      const configuration = convertFormValuesToFlatTeamProfile(formData);
      try {
        await orgTeamProfiles.upsert(configuration);
        toaster.success(
          !key ? (
            <>
              <Heading>Creating your team</Heading>
              <ToastParagraph>
                This process may take up to 2 hours, depending on your environment
              </ToastParagraph>
            </>
          ) : (
            'Changes saved successfully!'
          )
        );

        history.push(`/profiles/teams/${configuration.key}`);
      } catch (error: any) {
        switch (error.response?.data.errorCode) {
          case ApiErrorCode.duplicateNameError:
            return toaster.error(
              `A team named "${formData.name}" already exists, please try another name`
            );
          default:
            const errorMessage = !key
              ? 'Failed to create organization team'
              : 'Failed to save changes';
            return toaster.error(errorMessage);
        }
      }
    },
    [key]
  );

  return (
    <FormContext form={FormLayoutV2} onSubmit={handleSubmit} defaultValues={defaultValues}>
      <FormComponent
        existingProfile={existingProfile}
        application={application}
        orgTeamsSelectOptions={orgTeamsSelectOptions}
        orgTeamProfiles={orgTeamProfiles}
        history={history}
      />
    </FormContext>
  );
}

const FormContainer = styled(FormLayoutV2.Container)`
  ${Combobox} {
    width: auto;
    max-width: unset;
  }

  ${FieldItem} {
    margin-bottom: 0;

    ${Combobox.InputContainer} ${Input} {
      max-width: 160rem;
    }
  }
`;

const PointsOfContactSection = styled(FormLayoutV2.Section)`
  ${Combobox}:not(:first-child) ${Input} {
    width: auto;
    flex-grow: 1;
    min-width: 40rem;
  }
`;

const FormComponent = ({
  existingProfile,
  application,
  orgTeamsSelectOptions,
  orgTeamProfiles,
  history,
}: {
  existingProfile: StubAny;
  application: StubAny;
  orgTeamsSelectOptions: StubAny[];
  orgTeamProfiles: StubAny;
  history: StubAny;
}) => {
  const teamSource = useWatch({ name: 'source' });
  const disableEdit = Boolean(teamSource);

  return (
    <>
      <FormContainer>
        <FormLayoutV2.Section>
          <Heading1>{existingProfile ? 'Edit' : 'New'} team</Heading1>
          <FormLayoutV2.Label required>
            <Heading5>Team name</Heading5>
            <InputControl
              name="name"
              placeholder="Type the team's name..."
              rules={{ required: true }}
              autoFocus
              disabled={disableEdit}
            />
          </FormLayoutV2.Label>
          <FormLayoutV2.Label>
            <Heading5>Description</Heading5>
            <InputControl
              name="description"
              placeholder="Type a description for this team..."
              disabled={disableEdit}
            />
          </FormLayoutV2.Label>
          <FormLayoutV2.Label>
            <Heading5>
              Parent team{' '}
              <InfoTooltip content="The rightmost name in these nested list will be the parent of this team" />
            </Heading5>
            <SelectControlV2
              clearable
              searchable
              name="parentTeamRecord"
              placeholder="Type to select a parent team..."
              options={orgTeamsSelectOptions}
              filterOption={filterConfigurationRecord}
              option={TeamOption}
              disabled={disableEdit}
            />
          </FormLayoutV2.Label>
        </FormLayoutV2.Section>

        <TeamAssetsMappingSection disabled={disableEdit} />

        {application.isFeatureEnabled(FeatureFlag.OrgTeamTags) && (
          <FormLayoutV2.Section>
            <Heading3>Tags management</Heading3>
            <AssetCollectionFormTagsEditor
              noLimit
              typePrefix="Team"
              optionsFetcher={orgTeamProfiles.getTagsOptions}
            />
          </FormLayoutV2.Section>
        )}

        <PointsOfContactSection>
          <Heading3>Points of contact</Heading3>
          <PointOfContactFields
            name="pointsOfContact"
            dataFetcher={orgTeamProfiles.getTeamPointsOfContactTypes}
          />
        </PointsOfContactSection>
        {application.isFeatureEnabled(FeatureFlag.OrgTeamsCommunication) && (
          <FormLayoutV2.Section>
            <Heading3>Communication channels</Heading3>
            <SubHeading3 data-variant={Variant.SECONDARY}>
              Create the relevant channels for this team, based on your current connectors
            </SubHeading3>
            <CommunicationConfigurationsField name="communicationConfigurations" />
          </FormLayoutV2.Section>
        )}
      </FormContainer>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <Button variant={Variant.SECONDARY} size={Size.LARGE} onClick={history.goBack}>
            Cancel
          </Button>
          <FormLayoutV2.SubmitButton />
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
    </>
  );
};
