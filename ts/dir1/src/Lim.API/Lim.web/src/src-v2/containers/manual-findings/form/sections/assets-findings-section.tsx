import { capitalize } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SelectV2 } from '@src-v2/components/select/select-v2';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading3, Heading4, Heading5 } from '@src-v2/components/typography';
import {
  Tags,
  TrashCircleButton,
  useFieldToComponent,
} from '@src-v2/containers/manual-findings/form/components/use-field-to-component';
import { StubAny } from '@src-v2/types/stub-any';

export enum FindingAssets {
  RelatedAsset = 'Related',
  AffectedAsset = 'Affected',
}

export const AssetFindingsSection = () => {
  const { watch } = useFormContext();
  const assetFindings = watch('assetFindings');
  const { append, remove } = useFieldArray({ name: 'assetFindings' });

  return (
    <FormLayoutV2.Section>
      <Heading3>Assets details</Heading3>
      {assetFindings?.map((asset: { role: string }, index: number) => (
        <PlainAssetFinding
          key={`assetFinding-${index}`}
          role={asset.role.toLowerCase()}
          index={index}
          remove={remove}
        />
      ))}

      <AddAssetMenu append={role => append({ role, type: { label: 'URL', value: 'URL' } })} />
    </FormLayoutV2.Section>
  );
};

const PlainAssetFinding = ({
  remove,
  index,
  role,
}: {
  remove: () => void;
  index: number;
  role: string;
}) => {
  return (
    <FormLayoutV2.Section>
      <AffectedAssetHeader>
        <Heading4>{capitalize(role)} asset</Heading4>
        {index > 0 && <TrashCircleButton remove={remove} index={index} />}
      </AffectedAssetHeader>
      <AssetFindingRowWrapper>
        <FormLayoutV2.Label required={index === 0}>
          <Heading5>Type</Heading5>
          <AssetFindingType name={`assetFindings.${index}.type`} index={index} />
        </FormLayoutV2.Label>
        <FormLayoutV2.Label>
          <Heading5>&nbsp;</Heading5>
          <SelectedTypeComponent name={`assetFindings.${index}.type`} index={index} />
        </FormLayoutV2.Label>
      </AssetFindingRowWrapper>
      <AssetFindingRow>
        <FormLayoutV2.Label>
          <Heading5>Importance</Heading5>
          <AssetFindingImportance index={index} />
        </FormLayoutV2.Label>
        <FormLayoutV2.Label>
          <Heading5>IP address</Heading5>
          <AssetFindingIpAddress index={index} />
        </FormLayoutV2.Label>
      </AssetFindingRow>
      <AssetFindingTags index={index} />
    </FormLayoutV2.Section>
  );
};

const AssetFindingTags = ({ index }: { index: number }) => (
  <Tags
    remove={() => {}}
    index={index}
    name={`assetFindings.${index}`}
    shouldShowRemoveIconAtFirstPlace={false}
  />
);

const AddAssetMenu = ({ append }: { append: (asset: string) => void }) => (
  <DropdownMenu noArrow icon="Plus" label="Add asset" variant={Variant.PRIMARY} size={Size.SMALL}>
    <Dropdown.Item onClick={() => append(FindingAssets.AffectedAsset)}>
      {`${FindingAssets.AffectedAsset} asset`}
    </Dropdown.Item>
    <Dropdown.Item onClick={() => append(FindingAssets.RelatedAsset)}>
      {`${FindingAssets.RelatedAsset} asset`}
    </Dropdown.Item>
  </DropdownMenu>
);

export const assetFindingTypeToPlaceholder = {
  URL: 'https://',
  FQDN: 'Enter the FQDN (e.g. www.example.com)...',
  Host: 'Enter the host name...',
  Repository: 'Select a repository...',
  Application: 'Select the application associated with the finding...',
  'IP address': 'Specify the IP address...',
  CIDR: 'Type a CIDR (e.g. 10.0.0.0/24)...',
  'Cloud resource': 'Specify the cloud resource...',
  API: 'Type an API',
  Other: 'Specify the asset name...',
};

const AssetFindingType = ({ name, index }: { name: string; index: number }) => {
  const { watch, setValue } = useFormContext();
  const assetFindings = watch('assetFindings');

  const selectedTypes = assetFindings?.map(({ type }: { type: StubAny }) => type.value);

  const isOptionDisabled = useCallback(
    ({ value }: { value: string }) => {
      const isAppOrRepoSelected = selectedTypes?.some(
        (type: string, idx: number) =>
          (type === 'Application' || type === 'Repository') && idx !== index
      );

      return isAppOrRepoSelected && (value === 'Application' || value === 'Repository');
    },
    [selectedTypes]
  );

  const mappedAssetFindings = useMemo(
    () =>
      Object.keys(assetFindingTypeToPlaceholder).map(type => ({
        label: type,
        value: type,
      })),
    []
  );

  return (
    <SelectControlV2
      options={mappedAssetFindings}
      fitMenuToContent
      name={name}
      searchable={false}
      isOptionDisabled={isOptionDisabled}
      clearable={false}
      formatOptionLabel={(data: { label: string; value: string }) => (
        <TypeOptionItem name={name} isOptionDisabled={isOptionDisabled(data)} {...data} />
      )}
      onChange={() => setValue(`assetFindings.${index}.name`, '')}
    />
  );
};

const SelectedTypeComponent = ({ name, index }: { name: string; index: number }) => {
  const { watch } = useFormContext();
  const getComponent = useFieldToComponent();
  const selectedType: { label: string; value: string } = watch(name);

  const Component = getComponent(selectedType);
  const placeholder =
    assetFindingTypeToPlaceholder[selectedType.value as keyof typeof assetFindingTypeToPlaceholder];

  return (
    <>
      {Component && (
        <Component
          rules={{ required: true }}
          placeholder={placeholder}
          name={`assetFindings.${index}.name`}
        />
      )}
    </>
  );
};

const TypeOptionItem = ({
  name,
  isOptionDisabled,
  value,
  ...props
}: {
  name: string;
  isOptionDisabled: boolean;
  value: string;
}) => (
  <AssetFindingTypeRow {...props}>
    {value}
    {isOptionDisabled && (
      <InfoTooltip content="A finding can only be linked to one repository or application" />
    )}
  </AssetFindingTypeRow>
);

const AssetFindingTypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AssetFindingImportance = ({ index }: { index: number }) => {
  const { watch } = useFormContext();
  const assetType: { label: string; value: string } = watch(`assetFindings.${index}.type`);

  const findingImportance = [
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  const isDisabled = assetType.value === 'Repository' || assetType.value === 'Application';

  return (
    <SelectControlV2
      options={findingImportance}
      name={`assetFindings.${index}.importance`}
      searchable={false}
      disabled={isDisabled}
    />
  );
};

const AssetFindingIpAddress = ({ index }: { index: number }) => {
  const { watch } = useFormContext();
  const assetType: { label: string; value: string } = watch(`assetFindings.${index}.type`);

  const isDisabled =
    assetType.value === 'CIDR' ||
    assetType.value === 'IP address' ||
    assetType.value === 'Repository' ||
    assetType.value === 'Application';

  return (
    <SelectControlV2
      creatable
      multiple
      placeholder="Specify the asset’s IP addresses..."
      name={`assetFindings.${index}.IPAddress`}
      clearable={false}
      disabled={isDisabled}
    />
  );
};

const AssetFindingRow = styled.div`
  display: flex;
  gap: 2rem;

  & > * {
    flex: 1;
  }
`;

const AssetFindingRowWrapper = styled.div`
  display: flex;
  gap: 1rem;

  ${FormLayoutV2.Label}:first-child {
    ${SelectV2.Container} {
      width: 56rem;
    }
  }

  ${FormLayoutV2.Label}:last-child {
    flex: 1;
  }
`;

const AffectedAssetHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
