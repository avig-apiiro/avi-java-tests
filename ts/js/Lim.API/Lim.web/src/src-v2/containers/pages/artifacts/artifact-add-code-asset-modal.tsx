import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Combobox } from '@src-v2/components/forms';
import {
  BaseGroupItemLabel,
  RadioGroupControl,
  SelectControlV2,
} from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { VendorIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Heading5 } from '@src-v2/components/typography';
import { ArtifactRepositoryTooltip } from '@src-v2/containers/pages/artifacts/components/artifact-repository-tooltip';
import { useInject, useSuspense } from '@src-v2/hooks';

interface ArtifactAddCodeAssetModalProps {
  onClose: () => void;
  onSubmit: (data) => void;
}

const options = [
  { value: 'code-repository', label: 'Code repository' },
  { value: 'code-modules', label: 'Code modules' },
];
export const ArtifactAddCodeAssetModal = styled(
  ({ onSubmit, onClose, ...props }: ArtifactAddCodeAssetModalProps) => {
    const { artifacts, toaster } = useInject();
    const { artifactKey } = useParams<{ artifactKey: string }>();
    const artifact = useSuspense(artifacts.getArtifact, { key: artifactKey });

    const handleSubmit = async data => {
      const repositories = []
        .concat(data.codeAssetRepositorySelect || [])
        .map(repository => ({ repositoryKey: repository.key }));
      const moduleNames = data.codeAssetModuleSelect?.map(assetModule => assetModule.name);
      const params =
        repositories.length > 0
          ? repositories
          : [
              {
                repositoryKey: data.codeAssetRepositorySelect?.key,
                ...(Boolean(moduleNames) && { moduleNames }),
              },
            ];
      try {
        await artifacts.addArtifactCodeAsset(artifactKey, params);
        toaster.success('Artifact source assets saved successfully.');
        onClose();
      } catch {
        toaster.error('Artifact code asset could not be saved.');
      }
    };

    return (
      <ConfirmationModal
        {...props}
        title="Match source code assets"
        subtitle={`Select assets to match to ${artifact.packageId}`}
        confirmOnClose
        submitText="Match"
        onSubmit={handleSubmit}
        onClose={onClose}>
        <AddCodeAssetContent />
      </ConfirmationModal>
    );
  }
)`
  width: 135rem;
  min-width: 135rem;

  ${Modal.Header} {
    padding-bottom: 1rem;
  }
`;

export const AddCodeAssetContent = () => {
  const { applicationProfiles, apiClient } = useInject();
  const { watch } = useFormContext();
  const selectedAssetType = watch('codeAssetTypeRadio');
  const selectedRepository = watch('codeAssetRepositorySelect');
  const [modulesItems, setModulesItems] = useState([]);

  useEffect(() => {
    async function fetchAndSetItems() {
      const key = selectedRepository?.[0]?.key ?? selectedRepository?.key;
      const modules = await apiClient.get(`repositories/${key}/profile/modules`);
      setModulesItems(modules);
    }

    if (selectedAssetType === 'code-modules') {
      fetchAndSetItems();
    }
  }, [selectedAssetType, selectedRepository]);

  return (
    <AddCodeAssetContentContainer>
      <FormLayoutV2.Label>
        <Heading5>Asset type</Heading5>
        <RadioGroupControl
          name="codeAssetTypeRadio"
          options={options}
          defaultValue={options[0].value}
          data-horizontal
        />
      </FormLayoutV2.Label>
      <FormLayoutV2.Label required>
        <Heading5>Repository</Heading5>
        <SelectControlV2
          rules={{ required: true, pattern: /\S/ }}
          multiple={selectedAssetType !== 'code-modules'}
          name="codeAssetRepositorySelect"
          searchMethod={applicationProfiles.getRepositoryProfiles}
          placeholder="Type to select..."
          option={({ data }) => (
            <Tooltip content={<ArtifactRepositoryTooltip repositoryProfile={data} />}>
              <OptionContentContainer>
                <VendorIcon name={data.provider} /> {data.name}
              </OptionContentContainer>
            </Tooltip>
          )}
        />
      </FormLayoutV2.Label>
      {selectedAssetType === 'code-modules' && (
        <FormLayoutV2.Label htmlFor="codeAssetModuleSelect" disabled={!selectedRepository} required>
          <Heading5>Modules</Heading5>
          <Tooltip content="Select a repository first" disabled={selectedRepository}>
            <SelectControlStyled>
              <SelectControlV2
                rules={{ required: true, pattern: /\S/ }}
                disabled={!selectedRepository}
                multiple
                placeholder="Type to select..."
                name="codeAssetModuleSelect"
                options={modulesItems}
                formatOptionLabel={(option: any) => <ClampText>{option.name}</ClampText>}
              />
            </SelectControlStyled>
          </Tooltip>
        </FormLayoutV2.Label>
      )}
    </AddCodeAssetContentContainer>
  );
};

const OptionContentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
`;

const AddCodeAssetContentContainer = styled.div`
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${Combobox} {
    width: 100%;
  }

  ${BaseGroupItemLabel} {
    font-size: var(--font-size-s);
    font-weight: 400;
    color: var(--color-blue-gray-60);
  }
`;

const SelectControlStyled = styled.div``;
