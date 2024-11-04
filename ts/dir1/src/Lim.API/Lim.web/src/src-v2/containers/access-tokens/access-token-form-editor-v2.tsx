import { differenceInDays } from 'date-fns';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button, TextButton } from '@src-v2/components/button-v2';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { RadioTilesSelection } from '@src-v2/components/forms/radio-tiles-selection';
import { SvgIcon } from '@src-v2/components/icons';
import { DateTime } from '@src-v2/components/time';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Caption1, Heading1, Heading5 } from '@src-v2/components/typography';
import { UserScope } from '@src-v2/components/user-scope';
import { createTokenTypeCaption } from '@src-v2/containers/access-tokens/access-tokens-list-item';
import { ExtensionSelect } from '@src-v2/containers/access-tokens/extension-select';
import { JwtCopyBanner } from '@src-v2/containers/access-tokens/jwt-copy-banner';
import { PermissionsSection } from '@src-v2/containers/access-tokens/permissions/permissions-section';
import { RegenerationModal } from '@src-v2/containers/access-tokens/regeneration-modal';
import { FaultedIcon } from '@src-v2/containers/connectors/management/alert-icons';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useToggle } from '@src-v2/hooks';
import { AccessToken } from '@src-v2/services';

export const AccessTokenFormEditorV2 = observer(({ accessToken }: { accessToken: AccessToken }) => {
  const history = useHistory();
  const { accessTokens } = useInject();
  const [showRegenerationModal, toggleRegenerationModal] = useToggle();
  const { selectedOption, handleOptionChange } = useTokenTypeUpdate();
  const jwt = accessTokens.getJwt(accessToken.key);
  const isEditMode = accessToken.key;

  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();

  const [expirationTimeField, permissions] = watch(['expirationTime', 'permissions']);

  useEffect(() => {
    setValue('key', accessToken.key);
  }, [accessToken.key]);

  const regenerateToken = async expirationTime => {
    const { tokenKey } = await accessTokens.regenerateToken(accessToken.key, expirationTime);
    setValue('expirationTime', expirationTime);
    history.replace(`/settings/access-permissions/tokens/${tokenKey}/edit`);
    toggleRegenerationModal(false);
  };

  const handleExtensionValueChanged = useCallback(
    newValue => {
      setValue('expirationTime', newValue);
    },
    [setValue]
  );

  const isSubmitDisabled =
    !permissions ||
    !Object.keys(permissions)?.find(key => permissions[key].value !== NO_PERMISSION);

  const isTokenExpired = differenceInDays(expirationTimeField, new Date()) <= 0;

  if (isSubmitting) {
    return <Spinner />;
  }

  return (
    <>
      <FormLayoutV2.Container>
        <FormLayoutV2.Section>
          {isEditMode && (
            <Caption1>{createTokenTypeCaption(Object.keys(accessToken.permissions))}</Caption1>
          )}
          <Heading1>{isEditMode ? `Edit ` : 'New'} token</Heading1>
          {!isEditMode && (
            <RadioTilesSelection
              options={options}
              title="Select token type"
              selected={selectedOption}
              onChange={handleOptionChange}
            />
          )}
          <FormLayoutV2.Label>
            <Heading5>Token name</Heading5>
            <InputControl
              name="name"
              placeholder="Type a token name..."
              rules={{ required: true }}
              autoFocus
            />
          </FormLayoutV2.Label>
          <FormLayoutV2.Label>
            <Heading5>Token expiration</Heading5>
            {!isEditMode && <ExtensionSelect onChange={handleExtensionValueChanged} />}
          </FormLayoutV2.Label>
          <ExpirationTime>
            {isTokenExpired ? (
              <FaultedIcon content="" size={Size.XSMALL} disabled />
            ) : (
              <SvgIcon name="Info" size={Size.XSMALL} />
            )}
            {isTokenExpired && 'Token expired.'} Expiration date:
            <DateTime
              date={expirationTimeField}
              format="PPP"
              suffix={isTokenExpired || isEditMode ? '.' : ''}
            />
            {isEditMode && (
              <TextButton onClick={toggleRegenerationModal}>Regenerate the token</TextButton>
            )}
          </ExpirationTime>
          {jwt && <JwtCopyBanner jwt={jwt} />}
        </FormLayoutV2.Section>
        <PermissionsSection selectedOption={selectedOption} />
        {selectedOption === 'access-token' && <UserScope />}
      </FormLayoutV2.Container>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <Button
            to="/settings/access-permissions/tokens"
            variant={Variant.SECONDARY}
            size={Size.LARGE}>
            Cancel
          </Button>
          <Tooltip content="You must select a permission" disabled={!isSubmitDisabled}>
            <Button type="submit" size={Size.LARGE} disabled={isSubmitDisabled}>
              Save
            </Button>
          </Tooltip>
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
      {showRegenerationModal && (
        <RegenerationModal onRegenerate={regenerateToken} onClose={toggleRegenerationModal} />
      )}
    </>
  );
});

const Spinner = styled(LogoSpinner)`
  margin: auto;
  padding-bottom: 15rem;
`;

const ExpirationTime = styled(FormLayoutV2.Label)`
  flex-direction: row;
  align-items: center;
  font-size: var(--font-size-s);
  font-weight: 400;
`;

export const NO_PERMISSION = 'NoPermission';

export const permissionTypes = [
  { value: NO_PERMISSION, label: 'No Permission', icon: <SvgIcon name="Block" /> },
  {
    value: 'Write',
    label: 'Read/Write',
    icon: <SvgIcon name="ReadWrite" />,
  },
  { value: 'Read', label: 'Read', icon: <SvgIcon name="Visible" /> },
];

const options = [
  { value: 'access-token', label: 'Access Token', icon: <SvgIcon name="AccessToken" /> },
  { value: 'network-broker', label: 'Network Broker', icon: <SvgIcon name="Broker" /> },
  { value: 'webhook', label: 'Webhook', icon: <SvgIcon name="Webhook" /> },
];

// This hook set the token type state and unregister unwanted permissions
const useTokenTypeUpdate = () => {
  const { watch, unregister } = useFormContext();

  const [networkBrokerConfigurations, webhookConfigurations] = watch([
    `permissions.${resourceTypes.NetworkBrokerConfigurations}`,
    `permissions.${resourceTypes.GitLabResources}`,
  ]);

  // we assume that if there are broker configurations, so it's broker, same for webhook. otherwise its access token
  const defaultSelectedOption = useMemo(() => {
    if (networkBrokerConfigurations) {
      return options[1].value;
    }
    if (webhookConfigurations) {
      return options[2].value;
    }

    return options[0].value;
  }, [networkBrokerConfigurations, webhookConfigurations]);

  const [selectedOption, setSelectedOption] = useState(defaultSelectedOption);

  const handleOptionChange = useCallback(
    (newValue: string) => {
      setSelectedOption(newValue);
      const permissions = tokenTypeMapper.filter(item => item.key !== newValue);
      unregister(permissions.map(item => `permissions.${item.type}`));
    },
    [unregister]
  );

  return { selectedOption, handleOptionChange };
};

const tokenTypeMapper = [
  { key: 'access-token', type: resourceTypes.Global },
  { key: 'network-broker', type: resourceTypes.NetworkBrokerConfigurations },
  { key: 'webhook', type: resourceTypes.GitLabResources },
];
