import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button } from '@src-v2/components/button-v2';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { DateTime } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { ExtensionSelect } from '@src-v2/containers/access-tokens/extension-select';
import { JwtCopyBanner } from '@src-v2/containers/access-tokens/jwt-copy-banner';
import { RegenerationModal } from '@src-v2/containers/access-tokens/regeneration-modal';
import { ScopesEditor } from '@src-v2/containers/access-tokens/scopes-editor';
import { useInject, useToggle } from '@src-v2/hooks';
import { AccessToken } from '@src-v2/services';

export const AccessTokenFormEditor = ({ accessToken }: { accessToken: AccessToken }) => {
  const history = useHistory();
  const { accessTokens } = useInject();
  const jwt = accessTokens.getJwt(accessToken.key);
  const [showRegenerationModal, toggleRegenerationModal] = useToggle();
  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();

  useEffect(() => {
    setValue('key', accessToken.key);
  }, [accessToken?.key]);

  useEffect(() => accessToken.key && accessTokens.clearJwt, [accessToken]);

  const handleExtensionValueChanged = useCallback(
    newValue => {
      setValue('expirationTime', newValue);
    },
    [setValue]
  );

  const regenerateToken = async expirationTime => {
    const { tokenKey } = await accessTokens.regenerateToken(accessToken.key, expirationTime);
    history.replace(`/settings/access-permissions/tokens/${tokenKey}/edit`);
    toggleRegenerationModal(false);
  };

  if (isSubmitting) {
    return <Spinner />;
  }

  return (
    <>
      <EditorPanel>
        <Group>
          <StepTitle>Step 1</StepTitle>
          <Heading>Name</Heading>
          <InputControl
            name="name"
            placeholder="e.g. used to display applications at risk in the board dashboard"
            rules={{ required: true }}
            autoFocus
          />
        </Group>

        <Group>
          <StepTitle>Step 2</StepTitle>
          <Heading>Expiration</Heading>
          {accessToken.key ? (
            <Paragraph>
              This token expired on <DateTime date={accessToken.expirationTime} format="PPP" />. To
              set a new expiration date, you must{' '}
              <RegenerateLink onClick={toggleRegenerationModal}>
                regenerate the token.
              </RegenerateLink>
            </Paragraph>
          ) : (
            <Paragraph as="div">
              This token will expire in
              <ExtensionSelect onChange={handleExtensionValueChanged} />
            </Paragraph>
          )}
        </Group>

        <Group>
          <StepTitle>Step 3</StepTitle>
          <Heading>Permissions</Heading>
          <ScopesEditor />
        </Group>
      </EditorPanel>

      <InformationPanel>
        <TokenInformation>
          <Heading>Token Information</Heading>
          {accessToken.createdBy && <Paragraph>Created By: {accessToken.createdBy}</Paragraph>}
          <Paragraph>
            Expiration date: <DateTime date={watch('expirationTime')} format="PPP" />
          </Paragraph>
          {accessToken.lastUsedTime && (
            <Paragraph>
              Last Used on: <DateTime date={accessToken.lastUsedTime} format="PPP" />
            </Paragraph>
          )}

          {jwt && <JwtCopyBanner jwt={jwt} />}
        </TokenInformation>

        <ButtonsContainer>
          <Button
            to="/settings/access-permissions/tokens"
            variant={Variant.SECONDARY}
            size={Size.LARGE}>
            Cancel
          </Button>
          <Button type="submit" size={Size.LARGE}>
            Save
          </Button>
        </ButtonsContainer>
      </InformationPanel>

      {showRegenerationModal && (
        <RegenerationModal onRegenerate={regenerateToken} onClose={toggleRegenerationModal} />
      )}
    </>
  );
};

const Spinner = styled(LogoSpinner)`
  margin: auto;
  padding-bottom: 15rem;
`;

const EditorPanel = styled.div`
  width: 60%;
  padding: 0 25rem 15rem 0;
  border-right: 1px solid var(--color-blue-gray-45);
`;

const InformationPanel = styled.div`
  display: flex;
  width: 40%;
  padding: 0 0 15rem 25rem;
  flex-direction: column;
  justify-content: space-between;
`;

const TokenInformation = styled.div`
  ${Heading} {
    margin-bottom: 4rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 3rem;
`;

const Group = styled.div`
  padding: 8rem 0;

  &:first-child {
    padding-top: 0;
  }

  ${Heading} {
    margin-bottom: 5rem;
  }

  ${ExtensionSelect} {
    margin-left: 2rem;
  }
`;

const StepTitle = styled.div`
  margin-bottom: 1rem;
  font-size: var(--font-size-xs);
  color: var(--color-blue-gray-45);
`;

const RegenerateLink = styled.span`
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;
