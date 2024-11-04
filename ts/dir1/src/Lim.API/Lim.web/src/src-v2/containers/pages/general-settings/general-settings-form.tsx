import _ from 'lodash';
import { ReactNode, useCallback, useState } from 'react';
import { FormState, useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { FormContext } from '@src-v2/components/forms';
import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { RiskyTicketsOption } from '@src-v2/containers/pages/general-settings/monitor-design-risks';
import {
  FormGranulatedSlaPolicyDefinition,
  granularPoliciesFieldName,
} from '@src-v2/containers/pages/general-settings/sla/granular/granular-sla-policy-section';
import { useRiskyTickets } from '@src-v2/containers/pages/general-settings/use-risky-tickets';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { RiskScoreDefinition, SlaPolicyDefinition } from '@src-v2/services';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';

interface GeneralSettingsFormData extends SlaPolicyDefinition {
  granularPolicies: FormGranulatedSlaPolicyDefinition[];
  riskScore: RiskScoreDefinition;
  providers: ProviderGroup[];
  enabledRiskyTickets: RiskyTicketsOption[];
  isMonitoringEnabled: boolean;
}

interface GeneralSettingsFormProps {
  children: ReactNode;
  location: string;
}

export const GeneralSettingsForm = ({ children, location, ...props }: GeneralSettingsFormProps) => {
  const { toaster, organization, scaConfiguration } = useInject();
  const [SLAData, riskScore, granularPolicies, availableServers] = useSuspense([
    [organization.getRiskSLASettings] as const,
    [organization.getRiskScoreSettings] as const,
    [organization.getGranularSLASettings] as const,
    [scaConfiguration.getAvailableServerProviders] as const,
  ]);

  const trackAnalytics = useTrackAnalytics();
  const { enabledRiskyTickets, featureEnabled } = useRiskyTickets();

  const [formKey, setFormKey] = useState(crypto.randomUUID());

  const handleSubmit = useCallback(
    async (
      data: GeneralSettingsFormData,
      _event,
      formState: FormState<GeneralSettingsFormData>
    ) => {
      const { dirtyFields } = formState;
      const isSlaDirty =
        dirtyFields.critical || dirtyFields.high || dirtyFields.medium || dirtyFields.low;
      const isGranularDirty = dirtyFields.granularPolicies;
      const isProvidersPreferencesDirty = dirtyFields.providers;
      const isRiskScoreDirty = dirtyFields.riskScore;
      const enabledRiskyTicketsDirty = dirtyFields.enabledRiskyTickets;
      const isMonitoringEnabledDirty = dirtyFields.isMonitoringEnabled;

      const {
        providers,
        enabledRiskyTickets,
        isMonitoringEnabled,
        granularPolicies: updatedGranularPolicies,
        riskScore: updatedRiskScore,
        ...rest
      } = data;

      try {
        const promises = [];

        if (enabledRiskyTicketsDirty || isMonitoringEnabledDirty) {
          const updatedRiskyTickets = _.mapValues(
            _.groupBy(enabledRiskyTickets, riskyTicket => riskyTicket.icon),
            items => _.map(items, item => item.value)
          );
          promises.push(organization.setRiskyTickets(updatedRiskyTickets, isMonitoringEnabled));
        }

        if (isSlaDirty) {
          promises.push(
            organization.setRiskSLASettings(rest).then(() =>
              trackAnalytics(AnalyticsEventName.ActionClicked, {
                [AnalyticsDataField.ActionType]: 'Define SLA',
              })
            )
          );
        }

        if (isRiskScoreDirty) {
          promises.push(
            organization.setRiskScoreSettings(updatedRiskScore).then(() =>
              trackAnalytics(AnalyticsEventName.ActionClicked, {
                [AnalyticsDataField.ActionType]: 'Define Risk Score',
              })
            )
          );
        }

        if (isGranularDirty) {
          const deletedPolicyKeys = _.differenceBy(
            granularPolicies,
            updatedGranularPolicies,
            'key'
          ).map(policy => policy.key);

          promises.push(
            organization
              .updateGranularSlaPolicies(
                updatedGranularPolicies.filter(policy => policy.isDirty),
                deletedPolicyKeys
              )
              .then(() =>
                trackAnalytics(AnalyticsEventName.ActionClicked, {
                  [AnalyticsDataField.ActionType]: 'Define Specific SLA',
                })
              )
          );
        }

        if (isProvidersPreferencesDirty) {
          promises.push(
            scaConfiguration.updatePriorityConfiguration(providers).then(() => {
              trackAnalytics(AnalyticsEventName.ActionClicked, {
                [AnalyticsDataField.ActionType]: 'SCA provider order change',
                [AnalyticsDataField.ScaProviderOrder]: data.providers.join(', '),
                [AnalyticsDataField.Context]: window.location.href,
              });
            })
          );
        }
        await Promise.all(promises);

        toaster.success('Settings changed successfully');
        setFormKey(crypto.randomUUID());
      } catch (e) {
        toaster.error('Something went wrong');
      }
    },
    [granularPolicies]
  );

  return (
    <FormContext
      displayPromptOnLeave
      key={formKey}
      form={FormLayoutV2}
      onSubmit={handleSubmit}
      defaultValues={{
        ...SLAData,
        riskScore,
        [granularPoliciesFieldName]: granularPolicies,
        providers: availableServers,
        enabledRiskyTickets,
        isMonitoringEnabled: featureEnabled,
      }}
      {...props}>
      <FormLayoutV2.Container>{children}</FormLayoutV2.Container>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <CancelButton location={location} />
          <SubmitButton />
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
    </FormContext>
  );
};

function SubmitButton() {
  const { rbac } = useInject();
  const {
    formState: { isSubmitting, isDirty },
  } = useFormContext();

  const disabled = !rbac.hasGlobalScopeAccess || !isDirty;

  return (
    <Button type="submit" size={Size.LARGE} disabled={disabled} loading={isSubmitting}>
      Save
    </Button>
  );
}

function CancelButton({ location }) {
  const history = useHistory();
  const { application } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();
  const isSettingsNewLayout = application.isFeatureEnabled(FeatureFlag.SettingsNewLayout);

  const {
    formState: { isDirty },
  } = useFormContext();

  const handleClick = () => {
    if (isSettingsNewLayout && isDirty) {
      setModal(
        <DiscardModal
          title="Discard changes?"
          submitStatus="failure"
          submitText="Discard"
          onSubmit={() => history.push(location)}
          onClose={closeModal}>
          There are changes that will be discarded.
          <br />
          Are you sure?
        </DiscardModal>
      );
    } else {
      history.goBack();
    }
  };
  return (
    <>
      <Button
        variant={Variant.SECONDARY}
        size={Size.LARGE}
        onClick={handleClick}
        disabled={isSettingsNewLayout && !isDirty}>
        Cancel
      </Button>
      {modalElement}
    </>
  );
}
