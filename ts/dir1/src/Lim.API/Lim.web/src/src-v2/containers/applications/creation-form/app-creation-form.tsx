import { AxiosError } from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@src-v2/components/button-v2';
import { FormContext } from '@src-v2/components/forms';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import {
  RadioTilesSelection,
  TileOptionType,
} from '@src-v2/components/forms/radio-tiles-selection';
import { SvgIcon } from '@src-v2/components/icons';
import { ToastParagraph } from '@src-v2/components/toastify';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Heading1, Heading3, Heading5, SubHeading3 } from '@src-v2/components/typography';
import { ApplicationFormValues } from '@src-v2/containers/applications/creation-form/application-form-values';
import { AdditionalSettingsSection } from '@src-v2/containers/applications/creation-form/sections/additional-settings-section';
import { BusinessImpactSection } from '@src-v2/containers/applications/creation-form/sections/business-impact-section';
import { MonoRepoSection } from '@src-v2/containers/applications/creation-form/sections/mono-repo-section';
import { MultiAssetsSection } from '@src-v2/containers/applications/creation-form/sections/multi-assets-section';
import { SecuritySection } from '@src-v2/containers/applications/creation-form/sections/security-section';
import {
  convertAppConfigurationToFormValues,
  convertFormValuesToFlatApplicationProfile,
} from '@src-v2/containers/applications/creation-form/utils';
import { CommunicationConfigurationsField } from '@src-v2/containers/organization-teams/creation-form/communication-channels/communication-configurations-field';
import { AssetCollectionFormTagsEditor } from '@src-v2/containers/profiles/profile-tags/asset-collection-form-tags-editor';
import { useInject, useSuspense, useValidation } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ApiErrorCode } from '@src-v2/utils/api-error-code';
import { isTypeOf } from '@src-v2/utils/ts-utils';

const applicationType = {
  multiAssets: 'MULTIPLE ASSETS',
  monoRepo: 'MONO REPO',
};

const appTypeTileOptions: TileOptionType[] = [
  {
    value: applicationType.multiAssets,
    label: applicationType.multiAssets,
    icon: <SvgIcon name="MultipleAssets" />,
  },
  {
    value: applicationType.monoRepo,
    label: applicationType.monoRepo,
    icon: <SvgIcon name="MonoRepo" />,
  },
];

type AppCreationFormProps = {
  onSubmit?: (key: string) => void;
};

export const AppCreationForm = ({ onSubmit }: AppCreationFormProps) => {
  const { key } = useParams<{ key?: string }>();
  const { validateEmptySpace } = useValidation();
  const { application, applicationProfilesV2, history, toaster, messaging } = useInject();

  const existingProfileConfiguration = useSuspense(applicationProfilesV2.getEnrichedProfile, {
    key,
  });

  const disableMainInputs = Boolean(existingProfileConfiguration?.source);
  const [appType, setAppType] = useState(
    existingProfileConfiguration?.isModuleBased
      ? applicationType.monoRepo
      : applicationType.multiAssets
  );

  const providersMessagingChannels = useSuspense(messaging.getProvidersChannels, {
    providers: existingProfileConfiguration?.communicationChannelToProvider
      ? Object.keys(existingProfileConfiguration.communicationChannelToProvider)
      : null,
  });

  const defaultValues = useMemo<ApplicationFormValues>(
    () =>
      existingProfileConfiguration
        ? convertAppConfigurationToFormValues(
            existingProfileConfiguration,
            providersMessagingChannels
          )
        : null,
    [existingProfileConfiguration]
  );

  const handleSubmit = useCallback(
    async (formData: ApplicationFormValues) => {
      const configuration = convertFormValuesToFlatApplicationProfile(formData);

      try {
        await applicationProfilesV2.upsert(configuration);

        onSubmit?.(configuration.key);
        toaster.success(
          !key ? (
            <>
              <Heading>Creating your application</Heading>
              <ToastParagraph>
                This process may take up to 2 hours, depending on your environment
              </ToastParagraph>
            </>
          ) : (
            'Changes saved successfully!'
          )
        );
        history.push(`/profiles/applications/${configuration.key}`);
      } catch (error: any) {
        if (!isTypeOf<AxiosError>(error, 'response')) {
          return toaster.error(!key ? 'Failed to create application' : 'Failed to save changes');
        }

        switch ((error.response?.data as any).errorCode) {
          case ApiErrorCode.duplicateNameError:
            return toaster.error(
              `An application named "${formData.name}" already exists, please try another name`
            );
          case ApiErrorCode.nestingModulesError:
            return toaster.error('Module based application cannot have nesting modules');
          default:
            return toaster.error(!key ? 'Failed to create application' : 'Failed to save changes');
        }
      }
    },
    [key]
  );

  return (
    <FormContext form={FormLayoutV2} onSubmit={handleSubmit} defaultValues={defaultValues}>
      <FormLayoutV2.Container>
        <FormLayoutV2.Section>
          <Heading1>{key ? 'Edit application' : 'New application'}</Heading1>
          <FormLayoutV2.Label>
            <RadioTilesSelection
              title="Select the application type"
              disabled={disableMainInputs}
              selected={appType}
              options={appTypeTileOptions}
              onChange={setAppType}
            />
          </FormLayoutV2.Label>
          <FormLayoutV2.Label required>
            <Heading5>Application name</Heading5>
            <InputControl
              name="name"
              disabled={disableMainInputs}
              data-test-marker="application-name-input"
              placeholder="Type an application name..."
              rules={{
                required: true,
                validate: validateEmptySpace,
              }}
              autoFocus
            />
          </FormLayoutV2.Label>
          <FormLayoutV2.Label>
            <Heading5>Description</Heading5>
            <InputControl
              disabled={disableMainInputs}
              name="description"
              data-test-marker="application-description-input"
              placeholder="Type an application description..."
            />
          </FormLayoutV2.Label>
        </FormLayoutV2.Section>

        {appType === applicationType.multiAssets ? (
          <MultiAssetsSection disabled={disableMainInputs} />
        ) : (
          <MonoRepoSection />
        )}

        <FormLayoutV2.Section>
          <Heading3>Tags management</Heading3>
          <AssetCollectionFormTagsEditor
            noLimit
            optionsFetcher={applicationProfilesV2.getTagsOptions}
          />
        </FormLayoutV2.Section>

        <FormLayoutV2.HorizontalDivider>Advanced definitions</FormLayoutV2.HorizontalDivider>

        <SecuritySection />

        <BusinessImpactSection />

        <AdditionalSettingsSection />

        {application.isFeatureEnabled(FeatureFlag.ApplicationCommunicationChannel) && (
          <FormLayoutV2.Section>
            <Heading3>Communication channels</Heading3>
            <SubHeading3 data-variant={Variant.SECONDARY}>
              Create the relevant channels for this team, based on your current connectors
            </SubHeading3>
            <CommunicationConfigurationsField name="communicationConfigurations" />
          </FormLayoutV2.Section>
        )}
      </FormLayoutV2.Container>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <Button variant={Variant.SECONDARY} size={Size.LARGE} onClick={history.goBack}>
            Cancel
          </Button>
          <FormLayoutV2.SubmitButton />
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
    </FormContext>
  );
};
