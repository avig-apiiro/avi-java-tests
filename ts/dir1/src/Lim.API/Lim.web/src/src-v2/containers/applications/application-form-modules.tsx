import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { ClampText } from '@src-v2/components/clamp-text';
import { Combobox } from '@src-v2/components/forms';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { Select } from '@src-v2/components/forms/select';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Heading, Paragraph, Strong } from '@src-v2/components/typography';
import { ApplicationFormAdvancedDefinitions } from '@src-v2/containers/applications/application-form-advanced-definitions';
import {
  DropdownItemWithTooltip,
  MultiAssetCollectionChip,
  MultiAssetsCollection,
  ProviderChipWithTooltip,
  assetItemToString,
} from '@src-v2/containers/applications/multi-assets-collection';
import { AssetCollectionFormTagsEditor } from '@src-v2/containers/profiles/profile-tags/asset-collection-form-tags-editor';
import { ProfileTagsList } from '@src-v2/containers/profiles/profile-tags/profile-tags-list';
import { PersistentSearchCombobox } from '@src-v2/containers/select-input';
import { useInject, useValidation } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Dropdown } from '@src/src-v2/components/dropdown';

export const ApplicationFormModules = observer(() => {
  const { watch, resetField } = useFormContext();
  const { apiClient, application, applicationProfiles, applicationProfilesV2 } = useInject();
  const [modulesItems, setModulesItems] = useState([]);
  const { validateEmptySpace } = useValidation();

  const [moduleRepository, editable] = watch(['moduleRepository', 'editable']);

  useEffect(() => {
    void fetchAndSetItems();

    async function fetchAndSetItems() {
      const modules = await apiClient.get(`repositories/${moduleRepository?.key}/profile/modules`);
      setModulesItems(modules);
    }
  }, [moduleRepository?.key]);

  return (
    <>
      <Form.Fieldset as="label">
        <Heading>Name</Heading>
        <InputControlWrapper
          name="name"
          disabled={!editable}
          placeholder="Application Name"
          rules={{
            required: true,
            validate: validateEmptySpace,
          }}
        />
      </Form.Fieldset>
      <Form.Fieldset>
        <Heading>Modules</Heading>
        <Paragraph>Collect modules from a monorepo into an application</Paragraph>
        <AssetsCollectionContainer>
          <Controller
            name="moduleRepository"
            rules={{ required: true, pattern: /\S/ }}
            render={({ field: { onChange, ...field } }) => (
              <PersistentSearchCombobox
                {...field}
                // @ts-expect-error
                as={Select}
                popover={MultiAssetsCollectionPopover}
                disabled={!editable}
                placeholder="Add Repository"
                chip={ProviderChipWithTooltip}
                dropdownItem={DropdownItemWithTooltip}
                itemToString={assetItemToString}
                searchMethod={applicationProfiles.getRepositories}
                onSelect={event => {
                  onChange(event.selectedItem);
                  resetField('modulesGroup');
                }}
              />
            )}
          />
        </AssetsCollectionContainer>
        <AssetsCollectionContainer>
          <Controller
            name="modulesGroup"
            rules={{ required: true, pattern: /\S/ }}
            render={({ field: { onChange, ...field } }) => (
              <Combobox
                {...field}
                popover={MultiAssetsCollectionPopover}
                as={MultiAssetsCollection}
                items={modulesItems}
                itemToString={item => item?.root}
                dropdownItem={ModuleDropdownItem}
                placeholder="Add Modules"
                moduleRepository={moduleRepository}
                chip={ModuleChip}
                onSelect={event => onChange(event.selectedItems)}
              />
            )}
          />
        </AssetsCollectionContainer>

        {application.isFeatureEnabled(FeatureFlag.MonorepoProjects) && (
          <AssetsCollectionContainer>
            <Controller
              name="projects"
              rules={{ required: false, pattern: /\S/ }}
              render={({ field: { onChange, ...field } }) => (
                <PersistentSearchCombobox
                  {...field}
                  // @ts-expect-error
                  as={MultiAssetsCollection}
                  disabled={!editable}
                  popover={MultiAssetsCollectionPopover}
                  placeholder="Add Projects"
                  chip={ProviderChipWithTooltip}
                  dropdownItem={props => (
                    <DropdownItemWithTooltip {...props} tooltipContent={ProjectTooltipContent} />
                  )}
                  itemToString={item => item?.name}
                  searchMethod={applicationProfiles.getProjects}
                  onSelect={event => onChange(event.selectedItems)}
                />
              )}
            />
          </AssetsCollectionContainer>
        )}
      </Form.Fieldset>
      <TagManagementContainer>
        <Heading>Tags management</Heading>
        <AssetCollectionFormTagsEditor optionsFetcher={applicationProfilesV2.getTagsOptions} />
      </TagManagementContainer>
      <ApplicationFormAdvancedDefinitions />
    </>
  );
});

export const TagManagementContainer = styled(Form.Fieldset)`
  width: 50%;

  ${ProfileTagsList} {
    margin-bottom: 4rem;
  }
`;

function ModuleChip({ item, ...props }) {
  return (
    // @ts-expect-error
    <MultiAssetCollectionChip {...props}>
      <ClampText>{item?.root ?? item?.name}</ClampText>
    </MultiAssetCollectionChip>
  );
}

function ModuleDropdownItem({ item, ...props }) {
  return (
    <Dropdown.Item {...props}>
      <ClampText>{item.value.root}</ClampText>
    </Dropdown.Item>
  );
}

const AssetsCollectionContainer = styled.div`
  display: inline-flex;
  margin-right: 8rem;
`;

const MultiAssetsCollectionPopover = styled(Combobox.Popover)`
  ${(Popover as any).Content} {
    max-width: 100rem;
    width: 100rem;
  }
`;
const InputControlWrapper = styled(InputControl)`
  width: 85rem;
`;

const ProjectTooltipContent = styled(({ item, ...props }) => (
  <div {...props}>
    <Paragraph>
      Connection: <Strong>{item.serverUrl}</Strong>
    </Paragraph>
    <Paragraph>
      Project: <Strong>{item.name}</Strong>
      <ActivityIndicator active={item.isMonitored} />
    </Paragraph>
  </div>
))`
  ${Paragraph} {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    font-weight: 300;
    margin-bottom: 0;
    gap: 1rem;

    ${Strong} {
      font-weight: 500;
    }

    ${ActivityIndicator} {
      width: 1rem;
      height: 1rem;
      border: none;
      margin-top: 0.5rem;
    }
  }
`;
