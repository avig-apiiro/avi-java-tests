import _ from 'lodash';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormFieldArray } from '@src-v2/components/forms/form-field-array';
import { VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { useConditionalValidation, useInject, useSuspense, useValidation } from '@src-v2/hooks';
import { ConfigurationAssetOption } from '@src-v2/types/app-creation-options';
import { StubAny } from '@src-v2/types/stub-any';

export const ApiGatewaysFields = ({ name }: { name: string }) => {
  const { applicationProfilesV2 } = useInject();
  const { apiGateways = [], apiGatewaysRoutes = [] } = useSuspense(
    applicationProfilesV2.getConfigurationOptions
  );

  const selectedApiGateways: {
    gateway: ConfigurationAssetOption;
    gatewayRoute: ConfigurationAssetOption;
  }[] = useWatch({ name }) ?? [];

  const availableApiGateways = useMemo(() => {
    if (!selectedApiGateways?.length) {
      return apiGateways;
    }

    const selectedGateways = selectedApiGateways.map(api => api?.gateway?.key).filter(Boolean);
    return apiGateways.filter(api => !selectedGateways.includes(api.key));
  }, [selectedApiGateways]);

  const routeOptionsByGroupKey = useMemo(() => {
    return _.groupBy(_.uniqBy(apiGatewaysRoutes, 'key'), 'groupKey');
  }, [apiGatewaysRoutes]);

  return (
    <FormFieldArray
      buttonText="Add API gateway"
      name={name}
      defaultFieldValue={{ gatewayRoute: null, gateway: null }}>
      {({ name }: { name: string }) => (
        <ApiGatewayField
          name={name}
          apiGatewayOptions={availableApiGateways}
          routeOptionsByGroupKey={routeOptionsByGroupKey}
        />
      )}
    </FormFieldArray>
  );
};

const ApiGatewayField = ({
  name,
  apiGatewayOptions,
  routeOptionsByGroupKey,
}: {
  name: string;
  apiGatewayOptions: ConfigurationAssetOption[];
  routeOptionsByGroupKey: Record<string, ConfigurationAssetOption[]>;
}) => {
  const { validateEmptyItem } = useValidation();

  const selectedGroupKey = useWatch({ name: `${name}.gateway` })?.groupKey;
  const routeOptions = useMemo(
    () => (selectedGroupKey ? routeOptionsByGroupKey[selectedGroupKey] : []),
    [selectedGroupKey, routeOptionsByGroupKey]
  );

  return (
    <>
      <GatewaySelect
        name={`${name}.gateway`}
        placeholder="Select a gateway..."
        options={apiGatewayOptions}
        rules={{ validate: useConditionalValidation(validateEmptyItem, name) }}
        getOptionLabel={(option: StubAny) => (
          <>
            <VendorIcon size={Size.XSMALL} name={option.providerGroup} />{' '}
            <ClampText>{option.name?.length ? option.name : option.key}</ClampText>
          </>
        )}
      />
      <RouteSelect
        name={`${name}.gatewayRoute`}
        disabled={!selectedGroupKey}
        placeholder="Choose route..."
        options={routeOptions}
        rules={{ validate: useConditionalValidation(validateEmptyItem, name) }}
        getOptionLabel={(option: StubAny) => (
          <ClampText>{option.name?.length ? option.name : option.key}</ClampText>
        )}
      />
    </>
  );
};

const GatewaySelect = styled(SelectControlV2)`
  min-width: 54rem;
  max-width: 54rem;
`;

const RouteSelect = styled(SelectControlV2)`
  flex-grow: 1;
`;
