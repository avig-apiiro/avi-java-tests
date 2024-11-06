import { useCallback } from 'react';
import { Route, Switch, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { Dropdown } from '@src-v2/components/dropdown';
import { FormContext } from '@src-v2/components/forms/form-context';
import { Form } from '@src-v2/components/forms/form-layout';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { ToastParagraph } from '@src-v2/components/toastify';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading } from '@src-v2/components/typography';
import { ApplicationFormContextProvider } from '@src-v2/containers/applications/application-form-context';
import { ApplicationFormModules } from '@src-v2/containers/applications/application-form-modules';
import { ApplicationFormMultiple } from '@src-v2/containers/applications/application-form-multiple';
import { ApplicationFormSubmitButton } from '@src-v2/containers/applications/application-form-submit-button';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { LeanPointOfContact } from '@src-v2/types/profiles/lean-developer';
import { ApiErrorCode } from '@src-v2/utils/api-error-code';

export type ApplicationFormConfigurationType = {
  apiGatewayKeys: string[];
  apisGroupKeys: string[];
  applicationKeys: string[];
  applicationType: string;
  applicationTypeOther: string;
  associatedApplicationTags: any[];
  associatedRepositoryTags: any[];
  businessImpact: string;
  businessUnit: string;
  collectedApplicationKeys: string[];
  complianceRequirements: string[];
  createdAt: string;
  createdBy: string;
  customFields: any[];
  deploymentLocation: string;
  description: string;
  entryPoints: { url: string; name: string }[];
  estimatedRevenue: string;
  estimatedUsersNumber: string | number;
  findingTags: any[];
  hasName: boolean;
  isDisabled: boolean;
  isInternetFacing: boolean;
  isModuleBased: boolean;
  key: string;
  lastDisabledAt: string;
  lastDisabledBy: string;
  modulesGroup: { moduleKeys: string[]; repositoryKey: string };
  name: string;
  ordinalId: number;
  parentKey: string;
  pointsOfContact: LeanPointOfContact[];
  projectKeys: string[];
  repositoriesScore: number;
  repositoriesScoreWeight: number;
  repositoryGroups: any[];
  repositoryKeys: string[];
  updatedAt: string;
  updatedBy: string;
  isNew?: boolean;
  source?: string;
};

export const ApplicationForm = styled(
  ({ onCreate, ...props }: { onCreate: (data: any) => void }) => {
    const { state } = useLocation<{
      activeSection: string;
      configuration: ApplicationFormConfigurationType;
    }>();
    const { activeSection, configuration } = state ?? {};
    const { applicationProfiles, toaster, history, asyncCache, profiles } = useInject();
    const { key } = useParams<{ key: string }>();

    useBreadcrumbs({
      breadcrumbs: [
        {
          label: key ? 'Edit application' : 'Create application',
          to: '/profiles/applications/create',
        },
      ],
    });

    const defaultValues = useSuspense(applicationProfiles.getConfigurationDefaultValues, {
      key,
      configuration,
    });

    const handleSubmit = useCallback(
      async formData => {
        try {
          const data = applicationProfiles.convertFormDataToConfiguration({
            type: activeSection,
            ...formData,
          });
          await applicationProfiles.upsert(data);
          onCreate?.(data); // can be removed when legacy support is dropped
          asyncCache.invalidateAll(profiles.searchProfiles);
          toaster.success(
            !configuration || configuration.isNew ? (
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
          history.push(`/profiles/applications/${data.key}`);
        } catch (e) {
          switch (e.response?.data.errorCode) {
            case ApiErrorCode.duplicateNameError:
              return toaster.error(
                `An application named "${formData.name}" already exists, please try another name`
              );
            case ApiErrorCode.nestingModulesError:
              return toaster.error('Module based application cannot have nesting modules');
            default:
              const errorMessage =
                !configuration || configuration.isNew
                  ? 'Failed to create application'
                  : 'Failed to save changes';
              return toaster.error(errorMessage);
          }
        }
      },
      [onCreate, activeSection, configuration?.isNew]
    );

    return (
      <Page title="Create Application">
        <FormContext
          {...props}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          mode="onSubmit">
          <ApplicationFormContextProvider>
            <StickyHeader data-test-marker="create-application-header">
              <Button
                data-test-marker="create-application-cancel"
                to={key ? `/profiles/applications/${key}/profile` : '/profiles/applications/create'}
                variant={Variant.SECONDARY}
                size={Size.LARGE}>
                Cancel
              </Button>
              <ApplicationFormSubmitButton />
            </StickyHeader>
            <Gutters>
              <AsyncBoundary>
                <ApplicationFormSection activeSection={activeSection} />
              </AsyncBoundary>
            </Gutters>
          </ApplicationFormContextProvider>
        </FormContext>
      </Page>
    );
  }
)`
  ${LogoSpinner} {
    width: 4rem;
    height: 4rem;
  }

  ${Form.LabelCell}
  height: 9rem;
}

${Dropdown.List} {
  max-width: 80rem;
  max-height: 55rem;
}
`;

function ApplicationFormSection({ activeSection }: { activeSection: string }) {
  return (
    <Switch>
      <Route path="/profiles/applications/create/multiple" component={ApplicationFormMultiple} />
      <Route path="/profiles/applications/create/mono" component={ApplicationFormModules} />
      <Route
        path="/profiles/applications/:key/edit"
        component={activeSection === 'modules' ? ApplicationFormModules : ApplicationFormMultiple}
      />
    </Switch>
  );
}

export const FORM_SECTIONS = {
  SELECTION: 'selection',
  MULTIPLE: 'multiple',
  MODULES: 'modules',
};
