import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading3, SubHeading3 } from '@src-v2/components/typography';
import { AssetsConfigurationSelectionModal } from '@src-v2/containers/profiles/asset-selection-modal/assets-configuration-selection-modal';
import {
  AssetsConfigurationDisplay,
  useWatchAssetsConfiguration,
} from '@src-v2/containers/profiles/assets-selection/assets-configuration-display';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumable } from '@src-v2/types/profiles/lean-consumable';
import { RepositoryGroup } from '@src-v2/types/profiles/repository-profile-response';
import { FindingTag, TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { isEmptyDeep } from '@src-v2/utils/object-utils';
import { entries } from '@src-v2/utils/ts-utils';

export type AssetsConfiguration = {
  repositories?: LeanConsumable[];
  applications?: LeanApplication[];
  projects?: LeanConsumable[];
  repositoryGroups?: RepositoryGroup[];
  applicationTags?: TagResponse[];
  repositoryTags?: TagResponse[];
  findingTags?: FindingTag[];
  source?: string;
  externalIdentifier?: string;
  currentStateHash?: string;
};

export type AssetConfigurationCategory = keyof AssetsConfiguration;

type AssetsConfigurationSectionProps = {
  title: string;
  subtitle: string;
  supportedCategories: AssetConfigurationCategory[];
  disabled?: boolean;
};

export function AssetsConfigurationSection<T extends Partial<AssetsConfiguration>>({
  title,
  subtitle,
  supportedCategories,
  disabled,
}: AssetsConfigurationSectionProps) {
  const [modalElement, setModal, closeModal] = useModalState();
  const assetsConfiguration = useWatchAssetsConfiguration<T>(supportedCategories);
  const { setValue } = useFormContext<T>();

  const isConfigEmpty = isEmptyDeep(assetsConfiguration);

  const openAssetsSelectionModal = useCallback(() => {
    setModal(
      <AssetsConfigurationSelectionModal
        title={title}
        subtitle={subtitle}
        defaultValues={assetsConfiguration}
        assetCategories={supportedCategories}
        onSubmit={applyAssetsSelection}
        onClose={closeModal}
      />
    );

    function applyAssetsSelection(config: Partial<AssetsConfiguration>) {
      // @ts-expect-error
      entries(config).forEach(([fieldKey, fieldValue]) => setValue(fieldKey, fieldValue));
      closeModal();
    }
  }, [assetsConfiguration, setModal, closeModal]);

  return (
    <FormLayoutV2.Section>
      <HeadingsContainer>
        <Heading3>{title}</Heading3>
        <SubHeading3 data-variant={Variant.SECONDARY}>{subtitle}</SubHeading3>
      </HeadingsContainer>
      {!isConfigEmpty && <AssetsConfigurationDisplay assetsConfiguration={assetsConfiguration} />}

      <OpenModalButton
        disabled={disabled}
        variant={Variant.SECONDARY}
        startIcon={isConfigEmpty ? 'Plus' : 'Edit'}
        onClick={openAssetsSelectionModal}>
        {isConfigEmpty ? 'Select assets' : 'Edit mapping'}
      </OpenModalButton>

      {modalElement}
    </FormLayoutV2.Section>
  );
}

const HeadingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OpenModalButton = styled(Button)`
  width: fit-content;
`;
