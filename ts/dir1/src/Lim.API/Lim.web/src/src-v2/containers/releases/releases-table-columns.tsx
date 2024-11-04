import { useCallback } from 'react';
import styled from 'styled-components';
import { Clamp, ClampText } from '@src-v2/components/clamp-text';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { SeverityTag } from '@src-v2/components/tags';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { SubHeading4 } from '@src-v2/components/typography';
import { ConsumableProfileView } from '@src-v2/containers/profiles/consumable-profiles-view';
import { ReleaseSideView } from '@src-v2/containers/releases/release-side-view';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { noRisk } from '@src-v2/data/risk-data';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { Release, ReleaseSide } from '@src-v2/types/releases/release';
import { Column } from '@src-v2/types/table';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { ReleaseEditModal } from '@src/blocks/ReleasesPage/blocks/ReleaseEditModal';

const ActionsMenuCell = ({ data, ...props }: { data: Release }) => {
  const { rbac, releases } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();

  const handleEditRelease = useCallback(() => {
    setModal(
      <ReleaseEditModal
        isEdit
        initialValue={data}
        onCancel={closeModal}
        onSave={async (release: Release) => {
          await releases.upsertRelease(release);
          closeModal();
        }}
      />
    );
  }, [closeModal, setModal, data]);

  const handleDeleteRelease = useCallback(
    () =>
      setModal(
        <ConfirmationModal
          title={`Delete ${data.name}?`}
          submitStatus="failure"
          submitText="Delete"
          onClose={closeModal}
          onSubmit={async () => {
            await releases.deleteRelease({ key: data.key });
            closeModal();
          }}>
          Are you sure you want to delete this release?
        </ConfirmationModal>
      ),
    [setModal, closeModal, data]
  );

  return (
    <Table.FlexCell {...props}>
      <DropdownMenu {...props} onClick={stopPropagation} onItemClick={stopPropagation}>
        {data.status?.startsWith('Error') && (
          <Dropdown.Item
            disabled={!rbac.canEdit(resourceTypes.Releases)}
            onClick={handleEditRelease}>
            <SvgIcon size={Size.SMALL} name="Edit" />
            Edit release
          </Dropdown.Item>
        )}
        <Dropdown.Item
          disabled={!rbac.canEdit(resourceTypes.Releases)}
          onClick={handleDeleteRelease}>
          <SvgIcon size={Size.SMALL} name="Trash" />
          Delete
        </Dropdown.Item>
      </DropdownMenu>

      {modalElement}
    </Table.FlexCell>
  );
};

export const releasesTableColumns: Column<Release>[] = [
  {
    key: 'assessment-name',
    label: 'Assessment name',
    Cell: ({ data, ...props }) => {
      return (
        <Table.Cell {...props}>
          <ClampText lines={2}>{data.name}</ClampText>
        </Table.Cell>
      );
    },
  },
  {
    key: 'related-repository',
    label: 'Repository',
    width: '55rem',
    Cell: ({ data, ...props }: { data: Release }) => {
      return (
        <Table.Cell {...props}>
          {data.relatedRepositoryProfile ? (
            <ConsumableProfileView profile={data.relatedRepositoryProfile} />
          ) : (
            'Repository not found'
          )}
        </Table.Cell>
      );
    },
  },
  {
    key: 'comparison',
    label: 'Baseline → Candidate',
    width: '80rem',
    Cell: styled(({ data, ...props }: { data: Release }) => (
      <FlexCell {...props}>
        <ReleaseSideView showRef side={data.baseline} /> →{' '}
        <ReleaseSideView showRef side={data.candidate} />
      </FlexCell>
    ))`
      gap: 1rem;
    `,
  },
  {
    key: 'result',
    label: 'Result',
    Cell: styled(({ data, ...props }: { data: Release }) => (
      <FlexCell {...props}>
        {data.isRepositoryMonitored ? (
          data.isDone ? (
            <>
              <ReleaseSeverityTag side={data.baseline} />→
              <ReleaseSeverityTag side={data.candidate} />
            </>
          ) : data.status.startsWith('Error') ? (
            <Tooltip content="Release assessment failed, please check provided parameters">
              <SvgIcon name="Warning" />
            </Tooltip>
          ) : (
            'In progress'
          )
        ) : (
          <>
            Missing data{' '}
            <SubHeading4>
              (repository not {data.relatedRepositoryProfile ? 'monitored' : 'found'})
            </SubHeading4>
          </>
        )}
      </FlexCell>
    ))`
      gap: 1rem;
    `,
  },
  { key: 'actions-menu-cell', label: '', Cell: ActionsMenuCell, width: '10rem' },
];

const FlexCell = styled(Table.FlexCell)`
  gap: 1rem;

  ${Clamp} {
    min-width: 6rem;
    width: fit-content;
  }
`;

const ReleaseSeverityTag = ({ side }: { side: ReleaseSide }) => {
  const riskLevel = side.risk?.combinedRiskLevel ?? noRisk;
  return <SeverityTag riskLevel={riskLevel}>{riskLevel}</SeverityTag>;
};
