import { useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { DualListBox } from '@src-v2/components/forms/dual-list-box';
import { Modal } from '@src-v2/components/modals';
import {
  SubNavigationMenu,
  SubNavigationMenuOptionType,
} from '@src-v2/components/sub-navigation-menu';
import {
  ApplicationListBoxControl,
  ConsumableListBoxControl,
  RepositoryGroupsListBoxControl,
} from '@src-v2/containers/profiles/asset-selection-modal/consumable-asset-list-box';
import {
  ApplicationTagsListBoxControl,
  FindingTagsListBoxControl,
  RepositoryTagsListBoxControl,
} from '@src-v2/containers/profiles/asset-selection-modal/tags-assets-list-box';
import {
  AssetConfigurationCategory,
  AssetsConfiguration,
} from '@src-v2/containers/profiles/assets-selection/assets-configuration-section';
import { useInject } from '@src-v2/hooks';
import { ApplicationProfileResponse } from '@src-v2/types/profiles/application-profile-response';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { RepositoryProfileResponse } from '@src-v2/types/profiles/repository-profile-response';
import { humanize } from '@src-v2/utils/string-utils';

type AssetsConfigurationSelectionModalProps = {
  title: string;
  subtitle: string;
  defaultValues?: Partial<AssetsConfiguration>;
  assetCategories: AssetConfigurationCategory[];
  onSubmit: (payload: AssetsConfiguration) => void;
  onClose: () => void;
};

export function AssetsConfigurationSelectionModal({
  title,
  subtitle,
  defaultValues,
  assetCategories,
  onSubmit,
  onClose,
}: AssetsConfigurationSelectionModalProps) {
  return (
    <SelectionModal
      title={title}
      subtitle={subtitle}
      defaultValues={defaultValues}
      submitText="Apply selection"
      onSubmit={onSubmit}
      onClose={onClose}>
      <AssetsModalContent assetCategories={assetCategories} />
    </SelectionModal>
  );
}

function AssetsModalContent({
  assetCategories,
}: {
  assetCategories: AssetConfigurationCategory[];
}) {
  const formValues = useWatch<AssetsConfiguration>();

  const subMenuOptions = useMemo(
    () =>
      assetCategories.map(category => {
        const valuesLength = formValues?.[category]?.length;
        return {
          key: category,
          label: `${humanize(category)}${valuesLength ? ` (${valuesLength})` : ''}`,
        };
      }),
    [formValues]
  );

  const [selectedCategory, setSelectedCategory] = useState<SubNavigationMenuOptionType>(
    subMenuOptions[0]
  );

  return (
    <>
      <SubNavigationMenu
        options={subMenuOptions}
        currentOption={selectedCategory}
        onChange={setSelectedCategory}
      />

      <DualListBoxSwitch name={selectedCategory.key as AssetConfigurationCategory} />
    </>
  );
}

function DualListBoxSwitch({ name }: { name: AssetConfigurationCategory }) {
  const { projects, repositoryProfiles } = useInject();
  switch (name) {
    case RepositoryProfileResponse.profileType: {
      return (
        <ConsumableListBoxControl
          key={name}
          name={name}
          searchMethod={repositoryProfiles.searchLeanRepositories}
        />
      );
    }
    case ProjectProfile.profileType: {
      return (
        <ConsumableListBoxControl
          key={name}
          name={name}
          searchMethod={projects.searchLeanProjects}
        />
      );
    }
    case ApplicationProfileResponse.profileType: {
      return <ApplicationListBoxControl />;
    }
    case 'repositoryGroups': {
      return <RepositoryGroupsListBoxControl />;
    }
    case 'applicationTags':
      return <ApplicationTagsListBoxControl />;
    case 'repositoryTags':
      return <RepositoryTagsListBoxControl />;
    case 'findingTags': {
      return <FindingTagsListBoxControl />;
    }
    default: {
      return null;
    }
  }
}

const SelectionModal = styled(ConfirmationModal)`
  width: 310rem;

  ${Modal.Title} {
    font-size: var(--font-size-xl);
    line-height: 7rem;

    ${Modal.Subtitle} {
      color: var(--color-blue-gray-55);
    }
  }

  ${Modal.Content} {
    display: flex;
    gap: 4rem;
    padding-bottom: 0;

    > ${DualListBox.Container}:last-child {
      flex-grow: 1;
    }
  }
`;
