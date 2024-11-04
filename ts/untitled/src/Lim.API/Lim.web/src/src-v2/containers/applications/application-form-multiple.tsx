import { observer } from 'mobx-react';
import { forwardRef, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { Combobox } from '@src-v2/components/forms';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Heading, Paragraph, Strong } from '@src-v2/components/typography';
import { ApplicationFormAdvancedDefinitions } from '@src-v2/containers/applications/application-form-advanced-definitions';
import {
  DropdownItemWithTooltip,
  DropdownItemWithVendorIcon,
  MultiAssetsCollection,
  ProviderChipWithTooltip,
  assetItemToString,
} from '@src-v2/containers/applications/multi-assets-collection';
import { AssetCollectionFormTagsEditor } from '@src-v2/containers/profiles/profile-tags/asset-collection-form-tags-editor';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { PersistentSearchCombobox } from '@src-v2/containers/select-input';
import { useInject, useSuspense, useValidation } from '@src-v2/hooks';

export const ApplicationFormMultiple = observer(() => {
  const { applicationProfiles, applicationProfilesV2, asyncCache, repositoryProfiles } =
    useInject();
  const { key } = useParams<{ key: string }>();

  const { watch, trigger } = useFormContext();
  const { validateEmptySpace } = useValidation();

  const [repositoriesData, projectsData, repositoryGroupsData, editable]: [
    any[],
    any[],
    any[],
    boolean,
  ] = watch(['repositories', 'projects', 'repositoryGroups', 'editable']);

  const isRequiredField = useMemo(
    () =>
      !(repositoriesData?.length > 0) &&
      !(projectsData?.length > 0) &&
      !(repositoryGroupsData?.length > 0),
    [repositoriesData, projectsData, repositoryGroupsData]
  );
  const repositoryGroupsOptions = useSuspense(repositoryProfiles.searchRepositoryGroups);

  useEffect(() => {
    if (!key) {
      return;
    }
    return () =>
      asyncCache.invalidateAll(applicationProfiles.getProfileExtendedConfiguration, { key });
  }, [key]);

  useEffect(() => {
    if (!isRequiredField) {
      trigger(['repositories', 'projects', 'repositoryGroups']);
    }
  }, [isRequiredField]);

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
          data-test-marker="application-name-input"
        />
      </Form.Fieldset>
      <Form.Fieldset>
        <Heading>Multiple Assets</Heading>
        <Paragraph>
          Collect repositories, repository groups and projects into an application
        </Paragraph>
        <AssetsCollections data-test-marker="collections-combobox">
          <Controller
            name="repositories"
            rules={{ required: isRequiredField, pattern: /\S/ }}
            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
              <PersistentSearchCombobox
                {...field}
                // @ts-expect-error
                as={MultiAssetsCollection}
                error={error}
                disabled={!editable}
                popover={MultiAssetsCollectionPopover}
                placeholder="Add Repositories"
                chip={ProviderChipWithTooltip}
                dropdownItem={DropdownItemWithTooltip}
                itemToString={item => item?.name}
                searchMethod={applicationProfiles.getRepositories}
                onSelect={event => onChange(event.selectedItems)}
              />
            )}
          />

          <Controller
            name="projects"
            rules={{ required: isRequiredField, pattern: /\S/ }}
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
          <Controller
            name="repositoryGroups"
            rules={{ required: isRequiredField, pattern: /\S/ }}
            render={({ field: { onChange, ...field } }) => (
              <SearchCombobox
                {...field}
                // @ts-expect-error
                as={MultiAssetsCollection}
                disabled={!editable}
                popover={MultiAssetsCollectionPopover}
                items={repositoryGroupsOptions.items}
                totalCount={repositoryGroupsOptions.total}
                itemToString={assetItemToString}
                dropdownItem={GroupedDropdownItem}
                placeholder="Add Repository Groups"
                onSelect={event => onChange(event.selectedItems)}
                chip={ProviderChipWithTooltip}
                isGroup
              />
            )}
          />
        </AssetsCollections>
      </Form.Fieldset>
      <TagManagementContainer>
        <Heading>Tags management</Heading>
        <AssetCollectionFormTagsEditor optionsFetcher={applicationProfilesV2.getTagsOptions} />
      </TagManagementContainer>
      <ApplicationFormAdvancedDefinitions />
    </>
  );
});

const AssetsCollections = styled.div`
  display: flex;
  gap: 8rem;
`;

export const GroupedDropdownItem = forwardRef((props, ref) => (
  // @ts-expect-error
  <DropdownItemWithVendorIcon {...props} ref={ref} isGroup />
));

export const MultiAssetsCollectionPopover = styled(Combobox.Popover)`
  ${(Popover as any).Content} {
    max-width: 100rem;
    width: 100rem;
  }
`;

const InputControlWrapper = styled(InputControl)`
  width: 85rem;
`;

export const TagManagementContainer = styled.div`
  width: 50%;
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
      height: 1rem;
      width: 1rem;
      border: none;
      margin-top: 0.5rem;
    }
  }
`;
