import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { CircleButton } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { SvgIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ArtifactAddCodeAssetModal } from '@src-v2/containers/pages/artifacts/artifact-add-code-asset-modal';
import { ArtifactsTable } from '@src-v2/containers/pages/artifacts/artifacts-table';
import { ApplicationsView } from '@src-v2/containers/profiles/consumable-profiles-view';
import { LocationCell, ModuleNameCell } from '@src-v2/containers/risks/risks-common-cells';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { ArtifactCodeAssets } from '@src-v2/types/artifacts/artifacts-types';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Column } from '@src-v2/types/table';
import { pocTooltipText } from '@src-v2/utils/exposure-path-poc';

export const ArtifactsCodeAssets = () => {
  const { artifacts } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();

  const handleOpenModal = () => {
    setModal(<ArtifactAddCodeAssetModal onClose={closeModal} onSubmit={() => {}} />);
  };
  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'artifacts-code-assets-table' }}>
      <ArtifactsTable
        tableColumns={artifactsCodeAssetsTableColumns}
        filterFetcher={null}
        dataFetcher={artifacts.getArtifactConnectionsCodeAssets}
        itemTypeDisplayName={{ singular: 'code asset', plural: 'code assets' }}
        openModal={handleOpenModal}
        addButtonText="Match code assets"
      />
      {modalElement}
    </AnalyticsLayer>
  );
};

export const artifactsCodeAssetsTableColumns: Column<ArtifactCodeAssets>[] = [
  {
    label: 'Matched asset',
    width: '25rem',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <ClampText>{data.matchedAsset}</ClampText>
      </Table.FlexCell>
    ),
  },
  {
    label: 'Repository',
    width: '35rem',
    Cell: LocationCell as any,
  },
  {
    label: 'Risk level',
    Cell: ({ data, ...props }) => (
      <Table.CenterCell {...props}>
        <Tooltip
          content={`${data.repositoryRisk?.combinedRiskLevel === 'None' ? 'No' : data.repositoryRisk?.combinedRiskLevel} Risk`}>
          <RiskIcon riskLevel={data.repositoryRisk?.combinedRiskLevel} />
        </Tooltip>
      </Table.CenterCell>
    ),
    width: '25rem',
    resizeable: false,
  },
  {
    label: 'Code module',
    minWidth: '28rem',
    sortable: false,
    Cell: ({ data }) => <ModuleNameCell moduleName={data.moduleName} />,
  },
  {
    label: 'Applications',
    width: '28rem',
    Cell: ({ data }) => (
      <Table.FlexCell {...data}>
        {Boolean(data.assetCollections?.length) && (
          <ApplicationsView applications={data.assetCollections} />
        )}
      </Table.FlexCell>
    ),
  },
  {
    label: 'Match type',
    width: '25rem',
    Cell: ({ data, ...props }) => {
      const { application } = useInject();
      return (
        <Table.FlexCell {...props}>
          <Tooltip
            content={
              application.isFeatureEnabled(FeatureFlag.PocExposurePathData)
                ? pocTooltipText(data.repositoryName)
                : undefined
            }
            disabled={data.matchType.toLowerCase() !== 'automatic'}>
            <ClampText>{data.matchType}</ClampText>
          </Tooltip>
        </Table.FlexCell>
      );
    },
  },
  {
    key: 'actions-menu',
    label: '',
    width: '10rem',
    draggable: false,
    resizeable: false,
    Cell: ({ data, ...props }) => {
      const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

      return (
        <>
          <Table.FlexCell {...props} data-action-menu data-pinned-column>
            <CircleButton
              size={Size.MEDIUM}
              variant={Variant.TERTIARY}
              onClick={() => setConfirmationModalOpen(true)}>
              <SvgIcon name="Trash" />
            </CircleButton>
          </Table.FlexCell>
          {confirmationModalOpen && (
            <DeleteLinkModal
              {...{ artifactCodeAsset: data, onClose: () => setConfirmationModalOpen(false) }}
            />
          )}
        </>
      );
    },
  },
];

function DeleteLinkModal({
  artifactCodeAsset,
  onClose,
}: {
  artifactCodeAsset: ArtifactCodeAssets;
  onClose?: () => void;
}) {
  const { artifacts, toaster } = useInject();
  const { artifactKey } = useParams<{ artifactKey: string }>();

  return (
    <ConfirmationModal
      title="Unmatch Entity?"
      submitText="Unmatch"
      onClose={onClose}
      onSubmit={async () => {
        const params = [
          {
            repositoryKey: artifactCodeAsset.repositoryKey,
            ...(Boolean(artifactCodeAsset.moduleName) && {
              moduleNames: [artifactCodeAsset.moduleName],
            }),
          },
        ];

        try {
          await artifacts.removeArtifactCodeAsset(artifactKey, params);
          onClose?.();
          toaster.success('Code asset unmatched successfully.');
        } catch {
          toaster.error('Failed to unmatch code asset.');
        }
      }}>
      Are you sure you want to unmatch {artifactCodeAsset.repositoryName}?
    </ConfirmationModal>
  );
}
