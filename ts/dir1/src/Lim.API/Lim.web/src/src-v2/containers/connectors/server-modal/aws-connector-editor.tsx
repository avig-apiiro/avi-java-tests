import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Resolver, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Collapsible } from '@src-v2/components/collapsible';
import { FileReaderButton } from '@src-v2/components/file-reader-button';
import { Radio } from '@src-v2/components/forms';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ListItem, OrderedList, Paragraph } from '@src-v2/components/typography';
import { ConnectorEditor } from '@src-v2/containers/connectors/server-modal/connector-editor';
import { useInject } from '@src-v2/hooks';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { dataAttr } from '@src-v2/utils/dom-utils';

export function AwsConnectorEditor({
  providerGroup,
  isEdit,
}: {
  providerGroup: ProviderGroup;
  isEdit: boolean;
}) {
  const {
    application: { isSaas },
  } = useInject();
  const { setValue } = useFormContext();
  const [connectionMethod, setConnectionMethod] = useState(
    isSaas ? AWS_CONNECTION_METHOD.trust : AWS_CONNECTION_METHOD.legacy
  );

  useEffect(() => {
    setValue('additionalData', null);
    setValue('url', connectionMethod);
  }, [connectionMethod]);

  if (!isSaas) {
    return <ConnectorEditor providerGroup={providerGroup} isEdit={isEdit} />;
  }

  return (
    <Container>
      {Boolean(providerGroup.supportedResources?.length) && (
        <Paragraph>Supported resources: {providerGroup.supportedResources.join(', ')}</Paragraph>
      )}

      <CollapsibleHeader>
        <Paragraph>
          <Radio
            defaultChecked
            name="connectorType"
            onChange={() => setConnectionMethod(AWS_CONNECTION_METHOD.trust)}
          />
          Connect using a trust relationship with Apiiro's AWS account
        </Paragraph>
        <Paragraph>Via assume role functionality</Paragraph>
      </CollapsibleHeader>
      <CollapsibleContainer open={connectionMethod === AWS_CONNECTION_METHOD.trust}>
        <OrderedList>
          <ListItem>Create an IAM role</ListItem>
          <ListItem>When prompted for a "Trusted entity type" select "AWS account"</ListItem>
          <ListItem>
            Choose "Another AWS account" and enter "057144201055" for the account id
          </ListItem>
          <ListItem>Check the box "Require external ID", and choose an id</ListItem>
          <ListItem>Attach a needed policy for accessing API gateway/EKS/both</ListItem>
        </OrderedList>
        <Field>
          <LabelWithInfoTooltip>
            <Label required>Upload your CSV file</Label>
            <InfoTooltip
              content={
                <div>
                  <Paragraph>
                    The format for the CSV file is specified <b>in the example</b> below. Each line
                    in the file includes the RoleArn and ExternalId for an entry. The title line is
                    case-sensitive and must be included in the CSV.
                  </Paragraph>
                  <br />
                  <Paragraph>RoleArn,ExternalId</Paragraph>
                  <Paragraph>arn:aws:iam::111:role/apiiro_connect,1111</Paragraph>
                </div>
              }
            />
          </LabelWithInfoTooltip>
          <AwsAssumeRoleFilePicker />
        </Field>
      </CollapsibleContainer>
      <CollapsibleHeader>
        <Paragraph>
          <Radio
            name="connectorType"
            onChange={() => setConnectionMethod(AWS_CONNECTION_METHOD.legacy)}
          />
          Connect with user credentials (legacy)
        </Paragraph>
        <Paragraph>Via access key id & secret</Paragraph>
      </CollapsibleHeader>
      <CollapsibleContainer open={connectionMethod === AWS_CONNECTION_METHOD.legacy}>
        <ConnectorEditor providerGroup={providerGroup} isEdit={isEdit} />
      </CollapsibleContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${Collapsible.Body} {
    padding-left: 6.5rem;
  }
`;

const CollapsibleHeader = styled.label`
  display: block;
  cursor: pointer;

  ${Paragraph} {
    &:first-child {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    &:last-child {
      color: var(--color-blue-gray-45);
      font-size: var(--font-size-s);
      text-indent: 6.5rem;
    }
  }
`;

const CollapsibleContainer = styled(({ open, ...props }) => {
  const { getContentProps } = useCollapsible({ open });
  return <Collapsible.Body {...props} {...getContentProps()} />;
})`
  font-size: var(--font-size-s);

  ${OrderedList} {
    margin-bottom: 4rem;

    ${ListItem} {
      margin-left: 3rem;
    }
  }
`;

const LabelWithInfoTooltip = styled.div`
  display: flex;
`;

function AwsAssumeRoleFilePicker(props) {
  const { setValue, setError, getFieldState } = useFormContext();

  const handleFileChange = useCallback(
    (additionalData, description) => {
      setValue('additionalData', additionalData);
      setValue('description', description);
    },
    [setValue]
  );

  const handleError = useCallback(
    errorMessage =>
      setError('additionalData', {
        type: 'fileError',
        message: errorMessage,
      }),
    [setError]
  );

  const fieldError = getFieldState('additionalData')?.error;

  return (
    <Tooltip content={fieldError} disabled={!fieldError}>
      <FileReaderButton
        {...props}
        data-status={dataAttr(Boolean(fieldError), 'failure')}
        onChange={handleFileChange}
        onError={handleError}
      />
    </Tooltip>
  );
}

// @ts-expect-error
export const awsConnectorResolver: Resolver = (data, context, options) => {
  // If the connection method is 'trust' then additionalData is required and other fields are not, otherwise validate as usual
  if (data.url === AWS_CONNECTION_METHOD.trust) {
    return {
      values: data,
      errors: _.isEmpty(data.additionalData)
        ? { additionalData: 'Please upload your CSV file' }
        : {},
    };
  }

  const errors = {};

  const entries = Object.entries(options.fields);

  entries
    .filter(
      ([fieldName, field]) =>
        // @ts-expect-error
        field.validate?.validateMaxLength &&
        // @ts-expect-error
        field.validate.validateMaxLength(data[fieldName]) !== true
    )
    .forEach(
      ([fieldName, field]) =>
        (errors[fieldName] = {
          type: 'validateMaxLength',
          // @ts-expect-error
          message: field.validate.validateMaxLength(data[fieldName]),
        })
    );

  entries
    .filter(([fieldName, field]) => field.required && _.isEmpty(data[fieldName]))
    .forEach(([fieldName]) => (errors[fieldName] = true));

  return {
    values: data,
    errors,
  };
};

const AWS_CONNECTION_METHOD = {
  trust: 'trust',
  legacy: 'legacy',
};
