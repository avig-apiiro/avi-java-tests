import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Banner, WarningBanner } from '@src-v2/components/banner';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Combobox } from '@src-v2/components/forms';
import { BaseGroupItemLabel, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { VendorIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { EllipsisText, Heading4, Heading5, SubHeading3 } from '@src-v2/components/typography';
import { ArtifactCloudToolAssetTooltip } from '@src-v2/containers/pages/artifacts/components/artifact-cloud-tool-asset-tooltip';
import { ArtifactCloudToolBannerTooltip } from '@src-v2/containers/pages/artifacts/components/artifact-cloud-tool-banner-tooltip';
import { useInject, useSuspense } from '@src-v2/hooks';
import { SearchParams } from '@src-v2/services';
import { Artifact, ArtifactAsset, ArtifactServer } from '@src-v2/types/artifacts/artifacts-types';
import { StubAny } from '@src-v2/types/stub-any';
import { makeUrl } from '@src-v2/utils/history-utils';

interface ArtifactAddCloudToolModalProps {
  onClose: () => void;
  onSubmit: (data: StubAny) => void;
}

export const ArtifactAddCloudToolModal = styled(
  ({ onSubmit, onClose, ...props }: ArtifactAddCloudToolModalProps) => {
    const { artifacts, toaster } = useInject();
    const { artifactKey } = useParams<{ artifactKey: string }>();
    const artifact = useSuspense(artifacts.getArtifact, { key: artifactKey });

    const handleSubmit = async (data: StubAny) => {
      const cloudToolKeys =
        data.cloudToolConnectionsSelect?.map((cloudTool: StubAny) => cloudTool.key) || [];
      try {
        await artifacts.addArtifactCloudTools(artifactKey, cloudToolKeys);
        toaster.success('Assets matched successfully.');
        onClose();
      } catch {
        toaster.error('Assets could not be matched.');
      }
    };

    return (
      <ConfirmationModal
        {...props}
        title="Match source assets"
        subtitle={
          <SubHeading3>
            Select a source asset to match to {artifact.packageId}.
            <br />
            This matching merges them into a single Apiiro artifact.
          </SubHeading3>
        }
        confirmOnClose
        submitText="Match"
        onSubmit={handleSubmit}
        onClose={onClose}>
        <AddCloudToolContent />
      </ConfirmationModal>
    );
  }
)`
  width: 135rem;
  min-width: 135rem;

  ${Modal.Header} {
    padding-bottom: 1rem;
  }

  ${SubHeading3} {
    color: var(--color-blue-gray-55);
    font-weight: 300;
    margin-bottom: 2rem;
  }
`;

export const AddCloudToolContent = () => {
  const [selectedArtifacts, setSelectedArtifacts] = useState<Artifact[]>([]);
  const { artifacts } = useInject();
  const { artifactKey } = useParams<{ artifactKey: string }>();
  const artifact = useSuspense(artifacts.getArtifact, { key: artifactKey });
  const { watch, setValue } = useFormContext();
  const selectedConnection = watch('connectionSelect');
  const selectedAssets = watch('assetsSelect');
  const availableServers = useSuspense(artifacts.getArtifactAvailableServers);

  const availableServersOptions = useMemo(
    () =>
      availableServers.map((server, index) => ({
        label: server.serverUrl,
        value: `{server.serverUrl}-${index}`,
        ...server,
      })),
    [availableServers]
  );

  const handleArtifactAvailableAssets = useCallback(
    (props: SearchParams) =>
      selectedConnection
        ? artifacts.getArtifactAvailableAssets({
            key: artifactKey,
            provider: selectedConnection?.provider,
            serverUrl: selectedConnection?.serverUrl,
            ...props,
          })
        : null,
    [artifactKey, selectedConnection?.provider, selectedConnection?.serverUrl]
  );

  const handleAssetsChange = useCallback(
    async (newSelectedAssets: ArtifactAsset[]) => {
      const oldKeys = new Set(selectedAssets.map((asset: ArtifactAsset) => asset.artifactKey));
      const newKeys = new Set(newSelectedAssets.map((asset: ArtifactAsset) => asset.artifactKey));

      const addedKeys = Array.from(newKeys).filter(key => !oldKeys.has(key));
      const removedKeys = Array.from(oldKeys).filter(key => !newKeys.has(key as string));

      if (addedKeys.length > 0) {
        const [addedKey] = addedKeys;
        const newArtifact = await artifacts.getArtifact({ key: addedKey });
        setSelectedArtifacts(prevArtifacts => [...prevArtifacts, newArtifact]);
      }

      if (removedKeys.length > 0) {
        setSelectedArtifacts(prevArtifacts =>
          prevArtifacts.filter(artifact => !removedKeys.includes(artifact.key))
        );
      }
    },
    [artifacts, selectedArtifacts]
  );

  return (
    <AddCloudToolContentContainer>
      {selectedAssets?.length > 0 && (
        <WarningBanner
          title={`Matching the selected assets merges the listed artifacts and their data into ${artifact.packageId}`}
          description={
            <>
              {selectedArtifacts.map((artifact: Artifact) => (
                <SelectedAssetsList>
                  <Tooltip content={<ArtifactCloudToolBannerTooltip artifact={artifact} />}>
                    <TextButton
                      mode={LinkMode.EXTERNAL}
                      underline
                      to={makeUrl(`/inventory/artifacts/${artifact.key}/risks`, {})}>
                      {artifact.displayName}
                    </TextButton>
                  </Tooltip>
                </SelectedAssetsList>
              ))}
            </>
          }
        />
      )}
      <FormLayoutV2.Label required>
        <Heading5>Connection</Heading5>
        <SelectControlV2
          name="connectionSelect"
          searchable
          clearable
          placeholder="Type to select..."
          rules={{ required: true, pattern: /\S/ }}
          onChange={() => {
            setValue('assetsSelect', []);
            setSelectedArtifacts([]);
          }}
          options={availableServersOptions}
          option={({ data }: { data: ArtifactServer }) => (
            <>
              <VendorIcon name={data.provider} /> <ClampText>{data.serverUrl}</ClampText>
            </>
          )}
        />
      </FormLayoutV2.Label>
      <FormLayoutV2.Label required disabled={!selectedConnection}>
        <Heading5>Assets</Heading5>
        <Tooltip content="Select a connection first" disabled={selectedConnection}>
          <span>
            <SelectControlV2
              name="assetsSelect"
              clearable
              searchable
              multiple
              disabled={!selectedConnection}
              keyBy="key"
              onChange={handleAssetsChange}
              placeholder="Type to select..."
              rules={{ required: true, pattern: /\S/ }}
              searchMethod={handleArtifactAvailableAssets}
              formatOptionLabel={(artifactAsset: ArtifactAsset) => {
                return (
                  <Tooltip
                    disabled={
                      !artifactAsset.artifactRepositoryName && !artifactAsset.clusterNames?.length
                    }
                    content={<ArtifactCloudToolAssetTooltip artifactAsset={artifactAsset} />}>
                    <EllipsisText>{artifactAsset.displayName}</EllipsisText>
                  </Tooltip>
                );
              }}
            />
          </span>
        </Tooltip>
      </FormLayoutV2.Label>
    </AddCloudToolContentContainer>
  );
};

const SelectedAssetsList = styled.li`
  color: var(--color-blue-65);
  list-style-type: disc;
`;

const AddCloudToolContentContainer = styled.div`
  margin-top: 2rem;
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

  ${WarningBanner} {
    ${Heading4} {
      margin-bottom: 2rem;
    }

    ${Banner.Content} {
      width: 100%;
      overflow-x: hidden;
    }

    ${TextButton} {
      max-width: 95%;
    }
  }
`;
