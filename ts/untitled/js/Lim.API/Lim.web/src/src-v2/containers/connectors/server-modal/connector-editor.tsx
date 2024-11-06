import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { AnalyticsDataField } from '@src-v2/components/analytics-layer';
import { Badge, BadgeColors } from '@src-v2/components/badges';
import { AlertBanner } from '@src-v2/components/banner';
import { CircleButton, TextButton } from '@src-v2/components/button-v2';
import { Divider } from '@src-v2/components/divider';
import { FileReaderButton } from '@src-v2/components/file-reader-button';
import { CheckboxToggle, Input, Radio } from '@src-v2/components/forms';
import {
  CheckboxControl,
  InputControl,
  SelectControlV2,
  UploadFileControl,
} from '@src-v2/components/forms/form-controls';
import { FormLayoutV2, InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import {
  Caption2,
  ExternalLink,
  Heading5,
  Paragraph,
  SubHeading4,
} from '@src-v2/components/typography';
import { ConnectorEditorFields } from '@src-v2/containers/connectors/server-modal/connector-editor-fields';
import { WebhookConnectorHeading } from '@src-v2/containers/connectors/server-modal/webhook-connector-heading';
import { SimpleSelect } from '@src-v2/containers/simple-select';
import {
  AKAMAI_API_SECURITY_AUTHENTICATION_METHOD_OPTIONS,
  BROKER_AGENT_KEY_REGEX,
  NO_WHITESPACES_REGEX,
  PORT_REGEX,
  WEBHOOK_REGEX,
  WIZ_AUTHENTICATION_METHOD_OPTIONS,
  WIZ_CLIENTID_REGEX,
  WIZ_ENDPOINT_REGEX,
} from '@src-v2/data/connectors';
import { useConditionalValidation, useInject, useSuspense, useValidation } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { humanize } from '@src-v2/utils/string-utils';
import { IssueEntityTypesToPull } from './consts';

export function ConnectorEditor({
  providerGroup,
  isEdit,
}: {
  providerGroup: ProviderGroup;
  isEdit: boolean;
}) {
  const {
    formState: { errors },
  } = useFormContext();

  const fieldOptions = useConnectorFields(providerGroup, isEdit);

  return (
    <Container>
      {providerGroup.key === 'AzureCloud' && (
        <Description> Supported resources: AKS,API Management</Description>
      )}
      {Boolean(WEBHOOK_REGEX[providerGroup.key]) && <WebhookConnectorHeading />}
      <ConnectorEditorFields fieldOptions={fieldOptions} fieldErrors={errors} isEdit={isEdit} />
    </Container>
  );
}

const Container = styled.div`
  > ${Paragraph}, > ${WebhookConnectorHeading} {
    margin-top: 5rem;
  }
`;

const tokenExpireKey = 'token-expire';
const maxLength = 10000;
export const maxLengthValidation = (fieldName: string, value: string) =>
  !value || value?.length <= maxLength || `${fieldName} exceeded max length`;

function useConnectorFields(providerGroup: ProviderGroup, isEdit: boolean) {
  const { connectors, application } = useInject();

  const providerGroups = useSuspense(connectors.getProviderGroups);
  const existingServers = useMemo(
    () => providerGroups.flatMap(group => group.servers ?? []),
    [providerGroups]
  );

  const defaultParams = { providerGroup, isEdit, existingServers };

  const showAzureOnPremConnector =
    !application.isSaas || application.isFeatureEnabled(FeatureFlag.ForceAzureCloudOnPremConnector);

  const [akamaiApiSecurityAuthOption, setAkamaiApiSecurityAuthOption] = useState(
    AKAMAI_API_SECURITY_AUTHENTICATION_METHOD_OPTIONS[0].value
  );
  switch (providerGroup.key) {
    case 'GoogleChat':
    case 'Teams':
      return [
        {
          name: 'name',
          rules: {
            required: true,
            validate: {
              validateMaxLength: value => maxLengthValidation('Name', value),
            },
          },
        },
        generateUrlField({
          ...defaultParams,
          validate: {
            validateWebhook: value =>
              WEBHOOK_REGEX[providerGroup.key].some(regex => regex.test(value)),
          },
        }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'AzureActiveDirectory':
      return [
        generateUsernameField({ displayName: 'Client Id', ...defaultParams }),
        generatePasswordField({ ...defaultParams, displayName: 'Client Secret' }),
        { name: 'additionalData', displayName: 'Tenant Id', rules: { required: true } },
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Splunk':
      return [
        generateUrlField({ displayName: 'Splunk URL', ...defaultParams }),
        generatePasswordField({ ...defaultParams, displayName: 'Splunk Token' }),
        {
          name: 'additionalData',
          displayName: 'HTTP Event Collector Port (default 8088)',
          rules: { required: true, validate: { regionRegex: region => PORT_REGEX.test(region) } },
        },
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Backstage':
      return [
        generateUrlField({ displayName: 'Backstage URL', ...defaultParams }),
        generatePasswordField({ ...defaultParams, displayName: 'Backstage Token', isEdit: true }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'AzureCloud':
      return [
        showAzureOnPremConnector && {
          name: 'username',
          displayName: 'Client Id',
          rules: {
            required: true,
            validate: {
              validateMaxLength: value => maxLengthValidation('Client Id', value),
            },
          },
          onChange: (setValue, event) => {
            setValue('url', event.target.value);
            setValue('username', event.target.value);
          },
        },
        showAzureOnPremConnector &&
          generatePasswordField({ ...defaultParams, displayName: 'Client Secret' }),
        {
          name: 'additionalData',
          displayName: `Tenant Id${!showAzureOnPremConnector ? ' (Optional)' : ''}`,
          rules: {
            required: showAzureOnPremConnector,
            validate: {
              validateMaxLength: value => maxLengthValidation('Tenant Id', value),
            },
          },
        },
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ].filter(Boolean);
    case 'AWS':
      return [
        generateUsernameField({ displayName: 'Access Key ID', ...defaultParams }),
        generatePasswordField({ ...defaultParams, displayName: 'Secret Access Key' }),
        { name: 'description', displayName: 'Description (optional)' },
        generateFileSelector({
          label: 'Connect to multiple accounts via assume role (optional)',
          tooltip: 'The CSV format is: RoleArn, ExternalId',
        }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Spring':
      return [
        generateUrlField(defaultParams),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'ShiftLeft':
      return [
        generateUrlField(defaultParams),
        generateUsernameField({
          displayName: 'Org ID',
          ...defaultParams,
        }),
        generatePasswordField(defaultParams),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Veracode':
      return [
        generateUrlField(defaultParams),
        generateUsernameField({
          displayName: 'API ID',
          ...defaultParams,
        }),
        generatePasswordField({ displayName: 'API Key', ...defaultParams }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Fortify':
      return [
        generateUrlField(defaultParams),
        generateUsernameField({
          displayName: 'Client ID',
          ...defaultParams,
        }),
        generatePasswordField({ displayName: 'Client Secret', ...defaultParams }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Snyk':
    case 'SonarCloud':
    case 'Semgrep':
    case 'Polaris':
    case 'BurpSuite':
    case 'BlackDuck':
      return [
        generateUrlField(defaultParams),
        generateUsernameField({
          displayName: 'Display Name',
          ...defaultParams,
        }),
        generatePasswordField(defaultParams),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Mend':
      return [
        generateUrlField(defaultParams),
        generatePasswordField({ ...defaultParams, displayName: 'User key' }),
        generateUsernameField({
          displayName: 'Display name',
          ...defaultParams,
        }),
        generatePasswordField({
          ...defaultParams,
          name: 'organizationToken',
          displayName: 'Organization API key',
        }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Mend2':
      return [
        // Display name (Username, not used by provider)
        generateUsernameField({ ...defaultParams, displayName: 'Display name' }),
        // Url (Url)
        generateUrlField({ ...defaultParams, displayName: 'API Base URL (v2.0)' }),
        // Organization token (OrganizationToken)
        generatePasswordField({
          ...defaultParams,
          name: 'organizationToken',
          displayName: 'Organization API key',
        }),
        // User email (AdditionalData)
        { name: 'additionalData', displayName: 'User email', rules: { required: true } },
        // User key (Password)
        generatePasswordField({ ...defaultParams, displayName: 'User key' }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Jenkins':
      return [
        generateUrlField(defaultParams),
        generateUsernameField(defaultParams),
        generatePasswordField({ ...defaultParams, displayName: 'Organization Token' }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'GoogleCloud':
      return [
        generateUrlField(defaultParams),
        generateUsernameField({
          displayName: 'Display Name',
          ...defaultParams,
        }),
        generateUploadSshKeyField(),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'GitPlain':
      return [
        generateUrlField({ placeholder: 'ssh://', ...defaultParams }),
        generateUsernameField(defaultParams),
        generateUploadSshKeyField(),
        generateFileSelector({
          label: 'List repository URLs used in this server',
          tooltip: 'The CSV format is: SshUrl, Name, BranchName',
        }),
      ];
    case 'Checkmarx':
    case 'Sonatype':
      return [
        generateUrlField(defaultParams),
        generateUsernameField(defaultParams),
        generatePasswordField({ displayName: 'Password', ...defaultParams }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'AkamaiApiSecurity':
      return [
        generateUrlField(defaultParams),
        !isEdit
          ? {
              name: 'providerConfigJson.authenticationMethodType',
              displayName: 'Authentication Method',
              defaultValue: AKAMAI_API_SECURITY_AUTHENTICATION_METHOD_OPTIONS[0].value,
              render: ({ onChange, field }) => (
                <AuthMethodSimpleSelect
                  title="Select authentication mode"
                  variant={Variant.FILTER}
                  options={AKAMAI_API_SECURITY_AUTHENTICATION_METHOD_OPTIONS}
                  defaultValue={AKAMAI_API_SECURITY_AUTHENTICATION_METHOD_OPTIONS.find(
                    option => option.value === field.value
                  )}
                  identity={item => item.name}
                  onSelect={item => {
                    setAkamaiApiSecurityAuthOption(item.value);
                    onChange(item.value);
                  }}
                />
              ),
            }
          : null,
        generateUsernameField({
          displayName: akamaiApiSecurityAuthOption === 'StaticToken' ? 'Display Name' : 'Client ID',
          ...defaultParams,
        }),
        generatePasswordField({
          displayName: akamaiApiSecurityAuthOption === 'StaticToken' ? 'Token' : 'Client Secret',
          ...defaultParams,
        }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ].filter(Boolean);
    case 'HackerOne':
      return [
        generateUrlField(defaultParams),
        generateUsernameField({ displayName: 'Token Name', ...defaultParams }),
        generatePasswordField({
          displayName: 'Token',
          ...defaultParams,
        }),
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ];
    case 'Wiz':
      const buildWizUrl = (region: string) => `https://api.${region}.app.wiz.io`.toLowerCase();

      return [
        {
          name: 'additionalData',
          displayName: 'Region',
          subLabel: 'Enter your Wiz region to generate the URL below',
          placeholder: 'Type a region name...',
          disabled: isEdit,
          rules: {
            required: true,
            validate: {
              regionRegex: region => WIZ_ENDPOINT_REGEX.test(region),
              validateMaxLength: value => maxLengthValidation('Region', value),
            },
          },
          onChange: (setValue, event) => {
            setValue('url', buildWizUrl(event.target.value));
          },
        },
        {
          ...generateUrlField({ ...defaultParams, disabled: true }),
          disabled: true,
          defaultValue: 'https://api.region.app.wiz.io/',
        },
        {
          name: 'providerConfigJson.authenticationMethodType',
          displayName: 'Authentication Method',
          defaultValue: WIZ_AUTHENTICATION_METHOD_OPTIONS[0].value,
          render: ({ onChange, field }) => (
            <AuthMethodSimpleSelect
              title="Select authentication mode"
              variant={Variant.FILTER}
              options={WIZ_AUTHENTICATION_METHOD_OPTIONS}
              defaultValue={WIZ_AUTHENTICATION_METHOD_OPTIONS.find(
                option => option.value === field.value
              )}
              identity={item => item.name}
              onSelect={item => onChange(item.value)}
              disabled={isEdit}
            />
          ),
        },
        {
          name: 'username',
          displayName: 'Client ID',
          disabled: isEdit,
          rules: {
            required: true,
            validate: {
              validateWizClientId: region => WIZ_CLIENTID_REGEX.test(region),
              validateMaxLength: value => maxLengthValidation('Client Id', value),
            },
          },
        },
        generatePasswordField({ ...defaultParams, displayName: 'Client Secret' }),
        {
          tokenExpireDate: <TokenExpireDate />,
        },
        {
          separateComponent: <WizIntegrationScope />,
        },
        application.isFeatureEnabled(FeatureFlag.PullWizIssues)
          ? {
              separateComponent: <WizMultiSelect />,
            }
          : null,
      ].filter(Boolean);

    case 'Invicti':
      return [
        generateUrlField(defaultParams),
        generateUsernameField({ ...defaultParams, displayName: 'User ID' }),
        generatePasswordField({
          displayName: 'Token',
          ...defaultParams,
        }),
      ];

    case 'NetworkBroker':
      return [
        generateUrlField({ ...defaultParams, displayName: 'Id' }),
        generatePasswordField({
          ...defaultParams,
          displayName: 'Agent public key',
          validate: {
            validateBrokerPublicKey: key =>
              BROKER_AGENT_KEY_REGEX.test(key) || 'Invalid public key',
          },
        }),
      ];

    case 'Qualys':
      const urlField = generateUrlField(defaultParams);
      urlField.subLabel = 'Enter your Qualys platform URL';
      return [
        urlField,
        generateUsernameField(defaultParams),
        generatePasswordField({ ...defaultParams, displayName: 'Password' }),
      ];

    case 'JFrog':
      return [
        generateUrlField({ ...defaultParams, displayName: 'Server URL' }),
        !providerGroup.usernameNotRequired && generateUsernameField(defaultParams),
        generatePasswordField({
          displayName: providerGroup.tokenAsPasswordNotSupported ? 'Password or Token' : 'Token',
          ...defaultParams,
        }),
        providerGroup.usernameNotRequired && {
          name: 'description',
          displayName: 'Description (Optional)',
        },
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
        { separateComponent: <JFrogIntegrationScope key="jfrog-integration-scope" /> },
      ].filter(Boolean);
    case 'Github':
      return [
        generateUrlField(defaultParams),
        !providerGroup.usernameNotRequired && generateUsernameField(defaultParams),
        generatePasswordField({
          displayName: providerGroup.tokenAsPasswordNotSupported ? 'Password or Token' : 'Token',
          ...defaultParams,
        }),
        providerGroup.usernameNotRequired && {
          name: 'description',
          displayName: 'Description (Optional)',
        },
        { tokenExpireDate: <TokenExpireDate /> },
        {
          separateComponent: <IntegrationScope provider={providerGroup.displayName} />,
        },
      ].filter(Boolean);
    case 'Gitlab':
      return [
        generateUrlField(defaultParams),
        !providerGroup.usernameNotRequired && generateUsernameField(defaultParams),
        generatePasswordField({
          displayName: providerGroup.tokenAsPasswordNotSupported ? 'Password or Token' : 'Token',
          ...defaultParams,
        }),
        providerGroup.usernameNotRequired && {
          name: 'description',
          displayName: 'Description (Optional)',
        },
        { tokenExpireDate: <TokenExpireDate /> },
        { separateComponent: <IntegrationScope provider={providerGroup.displayName} /> },
      ].filter(Boolean);
    case 'Orca':
      return [
        { separateComponent: <UrlSelect isEdit={defaultParams?.isEdit} /> },
        !providerGroup.usernameNotRequired && generateUsernameField(defaultParams),
        generatePasswordField({
          displayName: providerGroup.tokenAsPasswordNotSupported ? 'Password or Token' : 'Token',
          ...defaultParams,
        }),
        providerGroup.usernameNotRequired && {
          name: 'description',
          displayName: 'Description (Optional)',
        },
        { tokenExpireDate: <TokenExpireDate /> },
      ].filter(Boolean);
    case 'PrismaCloud':
      return [
        generateUrlField({ displayName: 'Twistlock console URL', ...defaultParams }),
        generateUsernameField(defaultParams),
        generatePasswordField({ displayName: 'Password', ...defaultParams }),
        providerGroup.usernameNotRequired && {
          name: 'description',
          displayName: 'Description (Optional)',
        },
      ].filter(Boolean);
    case 'ManagedSemgrep':
      return [
        {
          separateComponent: <ManagedSemgrep />,
        },
      ];

    default:
      return [
        generateUrlField(defaultParams),
        !providerGroup.usernameNotRequired && generateUsernameField(defaultParams),
        generatePasswordField({
          displayName: providerGroup.tokenAsPasswordNotSupported ? 'Password or Token' : 'Token',
          ...defaultParams,
        }),
        providerGroup.usernameNotRequired && {
          name: 'description',
          displayName: 'Description (Optional)',
        },
        { tokenExpireDate: <TokenExpireDate key={tokenExpireKey} /> },
      ].filter(Boolean);
  }
}

function generateUrlField({
  providerGroup,
  isEdit,
  existingServers = [],
  displayName = 'URL',
  validate = {},
  disabled = false,
  placeholder = 'https://',
}: {
  providerGroup: ProviderGroup;
  isEdit: boolean;
  existingServers?: any;
  displayName?: string;
  name?: string;
  validate?: any;
  disabled?: boolean;
  placeholder?: string;
}) {
  return {
    name: 'url',
    type: 'url',
    existingServers,
    providerGroupName: providerGroup.key,
    allowMultipleConnectorsUrl: providerGroup.allowMultipleConnectorsUrl,
    fixedDisplayValue: providerGroup.fixedUrl,
    fixedValue: providerGroup.fixedUrl
      ? `${providerGroup.fixedUrl}/?display_name=${crypto.randomUUID()}`
      : undefined,
    displayName,
    rules: !disabled && {
      required: true,
      validate: {
        ...validate,
        validateMaxLength: value => maxLengthValidation('URL', value),
        noWhitespace: url => NO_WHITESPACES_REGEX.test(url),
        uniqueServer: !isEdit
          ? (url: string) =>
              !existingServers?.find(
                server => server.url === url && providerGroup.key === server.providerGroup
              ) || 'Another connector with the same URL is already configured'
          : () => true,
      },
    },
    defaultValue: providerGroup.defaultUrl,
    placeholder,
    disabled: isEdit,
    subLabel: '',
  };
}

function generatePasswordField({
  name = 'password',
  displayName = 'Token',
  isEdit,
  validate = {},
}: {
  name?: string;
  displayName?: string;
  isEdit: boolean;
  validate?: any;
}) {
  return {
    name,
    type: 'password',
    placeholder: isEdit ? '****************************************' : undefined,
    displayName,
    rules: {
      required: !isEdit,
      validate: {
        ...validate,
        validateMaxLength: value => maxLengthValidation(displayName, value),
      },
    },
  };
}

function generateUploadSshKeyField() {
  return {
    name: 'password',
    displayName: 'Upload your private key file',
    rules: { required: true },
    render: ({ onChange }, setError) => (
      <FileReaderButton
        onChange={onChange}
        onError={errorMessage => setError('password', { type: 'fileError', message: errorMessage })}
      />
    ),
  };
}

function generateUsernameField({
  displayName = 'Username',
  providerGroup,
}: {
  displayName?: string;
  providerGroup: ProviderGroup;
}) {
  return {
    name: 'username',
    displayName,
    rules: {
      required: true,
      validate: {
        validateMaxLength: value => maxLengthValidation(displayName, value),
      },
    },
    onChange: providerGroup.fixedUrl
      ? (setValue, event) => {
          setValue('description', event.target.value);
        }
      : null,
  };
}

function generateFileSelector({ label, tooltip }: { label: string; tooltip: string }) {
  return {
    name: 'additionalData',
    label: (
      <Tooltip content={tooltip}>
        <span>{label}</span>
      </Tooltip>
    ),
    render: ({ onChange }, setError) => (
      <FileReaderButton
        onChange={onChange}
        onError={errorMessage =>
          setError('additionalData', { type: 'fileError', message: errorMessage })
        }
      />
    ),
  };
}

const Description = styled.span`
  font-size: 3.5rem;
  font-weight: 300;
  line-height: 5rem;
  color: var(--color-blue-gray-60);
`;

const IntegrationLabel = styled(InputClickableLabel)`
  display: flex;
  gap: 2rem;
  align-items: center;
  width: fit-content;
`;

const WizIntegrationScope = () => {
  const {
    watch,
    formState: { isSubmitted },
  } = useFormContext();

  const { application } = useInject();

  const checkboxValues = watch([
    'providerConfigJson.pullKubernetesClusterMaps',
    'providerConfigJson.pullVulnerabilities',
    'providerConfigJson.pullIssues',
  ]);

  const validateCheckboxes = () => {
    return checkboxValues.some(value => value);
  };

  return (
    <FieldWrapper>
      <LabelWrapper>
        <Label required>Integration scope</Label>
        <SubHeading4>Choose which data to fetch from Wiz</SubHeading4>
      </LabelWrapper>
      <ToggleWrapper>
        <IntegrationLabel>
          <CheckboxControl
            Component={CheckboxToggle}
            defaultValue
            analyticsData={{
              [AnalyticsDataField.ConnectorToggleName]: 'Pull Kubernetes Cluster Maps',
              [AnalyticsDataField.ConnectorName]: 'Wiz',
            }}
            name="providerConfigJson.pullKubernetesClusterMaps"
          />
          <span>
            Kubernetes cluster data{' '}
            <InfoTooltip content="Fetch Kubernetes components to generate a cluster map and provide runtime context to risks" />
          </span>
        </IntegrationLabel>
        <IntegrationLabel>
          <CheckboxControl
            defaultValue
            Component={CheckboxToggle}
            name="providerConfigJson.pullVulnerabilities"
            analyticsData={{
              [AnalyticsDataField.ConnectorToggleName]: 'Pull Vulnerabilities',
              [AnalyticsDataField.ConnectorName]: 'Wiz',
            }}
          />
          Wiz vulnerabilities for container images
        </IntegrationLabel>
        {application.isFeatureEnabled(FeatureFlag.PullWizIssues) && (
          <IntegrationLabel>
            <CheckboxControl
              defaultValue={false}
              Component={CheckboxToggle}
              analyticsData={{
                [AnalyticsDataField.ConnectorToggleName]: 'Pull Issues',
                [AnalyticsDataField.ConnectorName]: 'Wiz',
              }}
              name="providerConfigJson.pullIssues"
            />
            Wiz issues for selected asset types
          </IntegrationLabel>
        )}
      </ToggleWrapper>
      {isSubmitted && !validateCheckboxes() && (
        <AlertBanner description="You must select at least one Integration scope" />
      )}
    </FieldWrapper>
  );
};

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FieldWrapper = styled.div`
  display: flex;
  margin: 7rem 0 2rem;
  flex-direction: column;
  gap: 2rem;
`;

const WizMultiSelect = () => {
  const { setValue, watch } = useFormContext();

  const [selectedIssueEntityTypesToPull, pullIssuesToggle] = watch([
    'providerConfigJson.issueEntityTypesToPull',
    'providerConfigJson.pullIssues',
  ]);
  const latestIssueEntityTypesToPull = useRef<{ label: string; value: string }[]>(
    selectedIssueEntityTypesToPull?.map(type => {
      return { label: type, value: type };
    })
  );

  const mappedIssueEntityTypesToPull = IssueEntityTypesToPull.map(issue => ({
    label: issue,
    value: issue,
  }));

  const defaultSelectedStatus = ['CONTAINER', 'CONTAINER_IMAGE'].map(issue => ({
    label: issue,
    value: issue,
  }));

  const options = useMemo(
    () => latestIssueEntityTypesToPull.current ?? defaultSelectedStatus,
    [pullIssuesToggle]
  );

  useEffect(
    () => setValue('providerConfigJson.issueEntityTypesToPull', pullIssuesToggle ? options : null),
    [pullIssuesToggle]
  );

  if (!pullIssuesToggle) {
    return null;
  }

  return (
    <MultiSelectLabel>
      <SelectControlV2
        multiple
        name="providerConfigJson.issueEntityTypesToPull"
        placeholder="Select asset types"
        options={mappedIssueEntityTypesToPull}
        onChange={(data: { label: string; value: string }[]) =>
          (latestIssueEntityTypesToPull.current = data.map(item => ({
            label: item.label,
            value: item.value,
          })))
        }
        rules={{
          required: {
            value: true,
            message:
              'When the Wiz issues scope is enabled, you must select the relevant asset types',
          },
        }}
      />
      <HeadingContainer>
        {selectedIssueEntityTypesToPull?.length < IssueEntityTypesToPull.length && (
          <TextButton
            size={Size.XXSMALL}
            onClick={event => {
              setValue('providerConfigJson.issueEntityTypesToPull', mappedIssueEntityTypesToPull);
              event.preventDefault();
            }}>
            Select all ({IssueEntityTypesToPull.length})
          </TextButton>
        )}
      </HeadingContainer>
    </MultiSelectLabel>
  );
};

const JFrogIntegrationScope = () => {
  const {
    watch,
    formState: { isSubmitted },
  } = useFormContext();

  const { application } = useInject();

  const checkboxValues = watch([
    'providerConfigJson.pullArtifactory',
    'providerConfigJson.pullXray',
  ]);

  const xrayEnabled = application.isFeatureEnabled(FeatureFlag.JFrogXray);
  const artifactsEnabled = application.isFeatureEnabled(FeatureFlag.JFrogSCAToggle);

  const checkboxesValid = useMemo(() => checkboxValues.length > 0, [checkboxValues]);

  return (
    <FieldWrapper>
      <LabelWrapper>
        <Label required>Integration scope</Label>
      </LabelWrapper>
      <ToggleWrapper>
        <IntegrationLabel>
          <CheckboxControl
            Component={CheckboxToggle}
            defaultValue={artifactsEnabled}
            name="providerConfigJson.pullArtifactory"
            disabled={!artifactsEnabled}
            analyticsData={{
              [AnalyticsDataField.ConnectorToggleName]: 'Pull Artifactory',
              [AnalyticsDataField.ConnectorName]: 'Jfrog',
            }}
          />
          <DisabledText data-disabled={dataAttr(!artifactsEnabled)}>
            Artifactory (Package registry)
          </DisabledText>
          <InfoTooltip
            delay={[500, 200]}
            interactive={true}
            content={
              <TooltipWrapper>
                Apiiro`s SCA examines packages in your artifactory to calculate an accurate
                dependency inventory and relationships
                <ExternalLink href="https://docs.apiiro.com/fix-open-source-risk/sca_matrix#connecting-to-private-package-registries">
                  Learn more
                </ExternalLink>
              </TooltipWrapper>
            }
          />
          <Tooltip
            content="Stay tuned to What’s new on Apiiro for updates"
            disabled={artifactsEnabled}>
            <Badge size={Size.XSMALL} color={BadgeColors.Purple}>
              {artifactsEnabled ? 'Preview' : 'Coming soon'}
            </Badge>
          </Tooltip>
        </IntegrationLabel>
        <IntegrationLabel>
          <CheckboxControl
            Component={CheckboxToggle}
            defaultValue={xrayEnabled}
            name="providerConfigJson.pullXray"
            disabled={!xrayEnabled}
            analyticsData={{
              [AnalyticsDataField.ConnectorToggleName]: 'Pull XRay',
              [AnalyticsDataField.ConnectorName]: 'Jfrog',
            }}
          />
          <DisabledText data-disabled={dataAttr(!xrayEnabled)}>
            Xray (Container security)
          </DisabledText>
          <Tooltip content="Stay tuned to What’s new on Apiiro for updates" disabled={xrayEnabled}>
            <Badge size={Size.XSMALL} color={BadgeColors.Purple}>
              {xrayEnabled ? 'Preview' : 'Coming soon'}
            </Badge>
          </Tooltip>
        </IntegrationLabel>
      </ToggleWrapper>
      {isSubmitted && !checkboxesValid && (
        <AlertBanner description="You must select at least one Integration scope" />
      )}
    </FieldWrapper>
  );
};

const IntegrationScope = ({ provider }: { provider: string }) => {
  const { application } = useInject();

  const supplyChainScmIntegrityToggleEnabled = application.isFeatureEnabled(
    FeatureFlag.SupplyChainScmIntegrityToggle
  );
  const secretsEnabled =
    provider === 'GitHub' ||
    (provider === 'GitLab' && application.isFeatureEnabled(FeatureFlag.GitlabSecretsIngestion));

  if (!supplyChainScmIntegrityToggleEnabled && !secretsEnabled) {
    return null;
  }

  return (
    <FieldWrapper>
      <LabelWrapper>
        <Label required>Integration scope</Label>
      </LabelWrapper>
      <ToggleWrapper>
        {supplyChainScmIntegrityToggleEnabled && (
          <>
            <IntegrationLabel>
              <CheckboxControl
                Component={CheckboxToggle}
                defaultValue
                analyticsData={{
                  [AnalyticsDataField.ConnectorToggleName]: 'Source Code Deep Analysis',
                  [AnalyticsDataField.ConnectorName]: humanize(provider),
                }}
                disabled
                name="sourceCodeDeepAnalysis"
              />
              Source code deep analysis and security scanning
              <InfoTooltip
                content={`Connect ${provider} to perform deep code analysis and security scans, build your inventory, and leverage prioritization context`}
              />
            </IntegrationLabel>
            <IntegrationLabel>
              <CheckboxControl
                defaultValue
                analyticsData={{
                  [AnalyticsDataField.ConnectorToggleName]: 'Source Code Deep Analysis',
                  [AnalyticsDataField.ConnectorName]: humanize(provider),
                }}
                Component={CheckboxToggle}
                name="providerConfigJson.supplyChainEnabled"
              />
              Source code integrity
              <InfoTooltip content="Monitor branch protection policies and repository access permissions" />
            </IntegrationLabel>
          </>
        )}
        <IntegrationLabel>
          <CheckboxControl
            Component={CheckboxToggle}
            defaultValue={secretsEnabled}
            name="providerConfigJson.secretsEnabled"
            disabled={!secretsEnabled}
            analyticsData={{
              [AnalyticsDataField.ConnectorToggleName]: 'Secrets Enabled',
              [AnalyticsDataField.ConnectorName]: humanize(provider),
            }}
          />
          {provider} secret scanning findings
          <InfoTooltip
            content={`Fetch, consolidate, and contextualize open issues from ${provider} secret detection`}
          />
          {provider === 'GitLab' && (
            <Badge size={Size.XSMALL} color={BadgeColors.Purple}>
              {secretsEnabled ? 'Preview' : 'Coming soon'}
            </Badge>
          )}
        </IntegrationLabel>
      </ToggleWrapper>
    </FieldWrapper>
  );
};

const UrlSelect = ({ isEdit }: { isEdit: boolean }) => {
  const { validateEmptyItem } = useValidation();
  const { setValue } = useFormContext();

  const urls = [
    { label: 'app.orcasecurity.io', value: 'https://app.orcasecurity.io' },
    { label: 'app.eu.orcasecurity.io', value: 'https://app.eu.orcasecurity.io' },
    { label: 'app.au.orcasecurity.io', value: 'https://app.au.orcasecurity.io' },
    { label: 'app.in.orcasecurity.io', value: 'https://app.in.orcasecurity.io' },
    { label: 'app.il.orcasecurity.io', value: 'https://app.il.orcasecurity.io' },
    { label: 'app.sa.orcasecurity.io', value: 'https://app.sa.orcasecurity.io' },
    { label: 'app.us.gov.orcasecurity.io', value: 'https://app.us.gov.orcasecurity.io' },
  ];

  const handleURLChanged = useCallback(
    (data: { label: string; value: string }) => {
      if (!data) {
        setValue('url', null);
        return;
      }

      setValue('url', {
        label: data.label,
        value: `${data.value}/?display_name=${crypto.randomUUID()}`,
      });
    },
    [setValue]
  );

  return (
    <FormLayoutV2.Label required>
      <Heading5>URL</Heading5>
      <SelectControlV2
        creatable
        name="url"
        placeholder="Select a server URL..."
        options={urls}
        isValidNewOption={(inputValue: string) => Boolean(inputValue)}
        rules={{
          required: true,
          validate: useConditionalValidation(validateEmptyItem, 'url'),
        }}
        disabled={isEdit}
        onChange={handleURLChanged}
      />
    </FormLayoutV2.Label>
  );
};

const ManagedSemgrep = () => {
  const { setValue } = useFormContext();

  const OPTIONS_NAMES = {
    SEMGREP_MANUAL: 'semgrep_manual',
    GITHUB_REPOSITORY: 'github_repository',
    UPLOAD_SEMGREP_RULESET: 'upload_semgrep_ruleset',
  };
  useEffect(() => {
    setValue('url', 'https://github.com/semgrep/semgrep-rules');
  }, []);

  const [optionSelected, setOptionSelected] = useState(OPTIONS_NAMES.SEMGREP_MANUAL);

  const handleOptionChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setOptionSelected(event.target.value);
  }, []);

  return (
    <ManagedSemgrepWrapper>
      <Heading5>Configure a Semgrep ruleset</Heading5>
      <RadioLabel>
        <Radio
          value={OPTIONS_NAMES.SEMGREP_MANUAL}
          onChange={handleOptionChange}
          checked={optionSelected === OPTIONS_NAMES.SEMGREP_MANUAL}
        />
        <ManagedSemgrepTitle>
          <>Semgrep standard open source rules</>
          <Tooltip content="https://github.com/semgrep/semgrep-rules">
            <CircleButton
              href="https://github.com/semgrep/semgrep-rules"
              size={Size.SMALL}
              variant={Variant.TERTIARY}>
              <SvgIcon name="External" />
            </CircleButton>
          </Tooltip>
        </ManagedSemgrepTitle>
      </RadioLabel>
      <ManagedSemgrepLabelContainer>
        <RadioLabel>
          <Radio
            value={OPTIONS_NAMES.GITHUB_REPOSITORY}
            onChange={handleOptionChange}
            checked={optionSelected === OPTIONS_NAMES.GITHUB_REPOSITORY}
          />
          <>GitHub public repository</>
        </RadioLabel>
        {optionSelected === OPTIONS_NAMES.GITHUB_REPOSITORY && (
          <InputControl
            name="providerConfigJson.githubRepository"
            placeholder="Enter a repository URL..."
          />
        )}
      </ManagedSemgrepLabelContainer>
      <ManagedSemgrepLabelContainer>
        <RadioLabel>
          <Radio
            value={OPTIONS_NAMES.UPLOAD_SEMGREP_RULESET}
            onChange={handleOptionChange}
            checked={optionSelected === OPTIONS_NAMES.UPLOAD_SEMGREP_RULESET}
          />
          <>Upload a .tar file</>
        </RadioLabel>
        {optionSelected === OPTIONS_NAMES.UPLOAD_SEMGREP_RULESET && (
          <span>
            <Paragraph>You can add a file up to 4mb (.tar)</Paragraph>
            <UploadFileControl
              name="file"
              label="Upload file"
              accept=".tar"
              maxSize={4}
              rules={{ required: true }}
            />
          </span>
        )}
      </ManagedSemgrepLabelContainer>
      <Divider />
      <>
        Apiiro's built-in Managed Semgrep automatically scans all your monitored code concurrently
        with Apiiro's native analysis according to your configured Semgrep rules and adds Apiiro
        context to get more informative and detailed code findings.
      </>
    </ManagedSemgrepWrapper>
  );
};

const ManagedSemgrepLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  ${Paragraph} {
    color: var(--color-blue-gray-60);
  }

  & > :nth-child(2) {
    padding-left: 6rem;
  }
`;

const RadioLabel = styled(InputClickableLabel)`
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 2rem;
  cursor: pointer;
`;

export const ManagedSemgrepTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--font-size-s);
  gap: 1rem;
`;

const ManagedSemgrepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  margin-bottom: 4rem;
`;

const MultiSelectLabel = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 4rem;
  gap: 1rem;

  ${Caption2} {
    color: var(--color-blue-gray-50);
    align-self: flex-end;
  }
`;

const HeadingContainer = styled.div`
  display: flex;

  ${TextButton} {
    margin-left: auto;
  }
`;

export const LabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 1rem;
`;

export const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${ExternalLink} {
    color: var(--color-blue-45);

    &:hover {
      color: var(--color-blue-45);
      text-decoration: underline;
    }
  }
`;

const TokenExpireDateContainer = styled.div`
  position: relative;

  > ${BaseIcon} {
    position: absolute;
    top: 8rem;
    right: 9rem;
  }

  ${Input} {
    font-size: var(--font-size-s);
  }
`;

const TokenExpireDate = () => {
  const { setValue } = useFormContext();

  const clearExpireDate = () => {
    setValue('tokenExpireDate', '');
  };

  return (
    <TokenExpireDateContainer>
      <Field>
        <Label>Token expiration date</Label>
        <Controller
          name="tokenExpireDate"
          rules={{ required: false, pattern: /\S/ }}
          render={({ field: { onChange, ...field } }) => (
            <Input
              {...field}
              type="date"
              onChange={event => {
                // @ts-expect-error
                onChange(event.target.value);
              }}
            />
          )}
        />
      </Field>
      <SvgIcon name="Close" onClick={clearExpireDate} />
    </TokenExpireDateContainer>
  );
};

const AuthMethodSimpleSelect = styled(SimpleSelect)`
  width: 100%;
`;

const DisabledText = styled.span`
  &[data-disabled] {
    color: var(--color-blue-gray-35);
  }
`;
