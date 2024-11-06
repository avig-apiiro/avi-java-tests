import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { CircleButton } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ArtifactAddCloudToolModal } from '@src-v2/containers/pages/artifacts/artifact-add-cloud-tool-modal';
import { ArtifactPlainTable } from '@src-v2/containers/pages/artifacts/artifacts-table';
import { ServerUrlCell } from '@src-v2/containers/risks/risks-common-cells';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { ArtifactCloudTool } from '@src-v2/types/artifacts/artifacts-types';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export const ArtifactsCloudTools = () => {
  const { application, artifacts } = useInject();
  const { artifactKey } = useParams<{ artifactKey: string }>();
  const [modalElement, setModal, closeModal] = useModalState();

  const artifactCloudToolTable = useSuspense(artifacts.getArtifactCloudTool, { key: artifactKey });
  const isArtifactMatchSourceAssets = application.isFeatureEnabled(
    FeatureFlag.ArtifactMatchSourceAssets
  );

  const handleOpenModal = () => {
    setModal(<ArtifactAddCloudToolModal onClose={closeModal} onSubmit={() => {}} />);
  };

  const dataModelsWithKey = useMemo(
    () =>
      artifactCloudToolTable.map((data, index) => ({
        key: `${artifactKey}-${index}`,
        ...data,
      })),
    [artifactCloudToolTable]
  );

  const clientTableModel = useClientDataTable<ArtifactCloudTool & { key: string }>(
    dataModelsWithKey,
    {
      key: 'artifactCloudTool',
      columns: tableColumns,
    }
  );

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'artifacts-cloud-tools-table' }}>
      <ArtifactPlainTable
        dataModel={clientTableModel}
        itemTypeDisplayName={{ singular: 'source asset', plural: 'source assets' }}
        searchable={false}
        openModal={isArtifactMatchSourceAssets ? handleOpenModal : null}
        addButtonText="Match source assets"
      />
      {isArtifactMatchSourceAssets ? modalElement : null}
    </AnalyticsLayer>
  );
};

export const tableColumns = [
  {
    key: 'cloud-tools-source-column',
    label: 'Source',
    Cell: ({ data, ...props }: { data: ArtifactCloudTool }) => (
      <Table.FlexCell {...props}>
        <VendorIcon name={data.source} size={Size.SMALL} />
      </Table.FlexCell>
    ),
  },
  {
    key: 'cloud-tools-artifact-name-column',
    label: 'Artifact name',
    Cell: ({ data, ...props }: { data: ArtifactCloudTool }) => (
      <Table.FlexCell {...props}>
        <ClampText>{data.name}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    key: 'cloud-tools-type-column',
    label: 'Type',
    Cell: ({ data, ...props }: { data: ArtifactCloudTool }) => (
      <Table.FlexCell {...props}>
        <ClampText>{data.type}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    key: 'cloud-tools-server-url-column',
    label: 'Server URL',
    minWidth: '20rem',
    Cell: ServerUrlCell,
  },
  {
    key: 'cloud-tools-match-type-column',
    label: 'Match type',
    Cell: ({ data, ...props }: { data: ArtifactCloudTool }) => (
      <Table.FlexCell {...props}>
        <ClampText>{data.matchType}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    key: 'actions-menu',
    label: '',
    width: '10rem',
    draggable: false,
    resizeable: false,
    Cell: ({ data, ...props }) => {
      const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
      const { application } = useInject();
      const isArtifactMatchSourceAssets = application.isFeatureEnabled(
        FeatureFlag.ArtifactMatchSourceAssets
      );

      return (
        <>
          <Table.FlexCell {...props} data-action-menu data-pinned-column>
            {isArtifactMatchSourceAssets ? (
              <CircleButton
                size={Size.MEDIUM}
                variant={Variant.TERTIARY}
                onClick={() => setConfirmationModalOpen(true)}>
                <SvgIcon name="Trash" />
              </CircleButton>
            ) : null}
          </Table.FlexCell>
          {confirmationModalOpen && (
            <DeleteLinkModal
              {...{ artifactCloudTool: data, onClose: () => setConfirmationModalOpen(false) }}
            />
          )}
        </>
      );
    },
  },
];

function DeleteLinkModal({
  artifactCloudTool,
  onClose,
}: {
  artifactCloudTool: ArtifactCloudTool;
  onClose?: () => void;
}) {
  const { artifacts, toaster } = useInject();
  const { artifactKey } = useParams<{ artifactKey: string }>();

  return (
    <ConfirmationModal
      title="Unmatch source asset?"
      onClose={onClose}
      submitText="Unmatch"
      onSubmit={async () => {
        try {
          await artifacts.removeArtifactCloudTool(artifactKey, [artifactCloudTool.key]);
          onClose?.();
          toaster.success('Source asset unmatched successfully.');
        } catch {
          toaster.error('Failed to unmatch this source asset.');
        }
      }}>
      Unmatching this source asset splits this asset and generates a separate artifact for the
      source asset you remove.
      <br />
      Are you sure?
    </ConfirmationModal>
  );
}
