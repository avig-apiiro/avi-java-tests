import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button } from '@src-v2/components/button-v2';
import { Gutters } from '@src-v2/components/layout';
import { ReleasesFirstTimeLayout } from '@src-v2/components/layout/first-time-layouts/releases-first-time-layout';
import { Page } from '@src-v2/components/layout/page';
import { UpgradeButton } from '@src-v2/components/marketing/upgrade-button';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { releasesTableColumns } from '@src-v2/containers/releases/releases-table-columns';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Release } from '@src-v2/types/releases/release';
import { ReleaseEditModal } from '@src/blocks/ReleasesPage/blocks/ReleaseEditModal';

export default observer(() => {
  const [modalElement, setModal, closeModal] = useModalState();
  const history = useHistory();
  const {
    application,
    releases,
    rbac,
    subscription: {
      limitations: { releasesMaxCount },
    },
  } = useInject();

  const dataModel = useDataTable(releases.searchReleases, {
    columns: releasesTableColumns,
    hasToggleColumns: false,
    isPinFeatureEnabled: false,
  });

  const releasesCount = dataModel.searchState.total;

  const handleCreateRelease = useCallback(() => {
    setModal(
      <ReleaseEditModal
        isEdit={false}
        initialValue={generateEmptyRelease()}
        onCancel={closeModal}
        onSave={async (release: Release) => {
          await releases.upsertRelease(release);
          closeModal();
        }}
      />
    );
  }, [setModal, closeModal]);

  const handleRowClick = useCallback((release: Release) => {
    history.push(`/releases/${release.key}`);
  }, []);

  return (
    <Page title="Releases">
      {dataModel.searchState.loading ? (
        <SpinnerContainer>
          <LogoSpinner />
        </SpinnerContainer>
      ) : application.isFeatureEnabled(FeatureFlag.EmptyStates) &&
        (!releasesCount || releasesCount === 0) ? (
        <ReleasesFirstTimeLayout onClick={handleCreateRelease} />
      ) : (
        <>
          <Gutters>
            <FluidTableControls>
              <TableSearch placeholder="Search..." />
              <TableControls.Actions>
                {!_.isNil(releasesMaxCount) && releasesCount >= releasesMaxCount ? (
                  <UpgradeButton>Create release</UpgradeButton>
                ) : (
                  <Button
                    onClick={handleCreateRelease}
                    disabled={!rbac.canEdit(resourceTypes.Releases)}>
                    Create release
                  </Button>
                )}
              </TableControls.Actions>
            </FluidTableControls>

            <DataTable dataModel={dataModel}>
              {(item: Release) => (
                <DataTable.Row
                  key={item.key}
                  data={item}
                  onClick={item.isDone ? () => handleRowClick(item) : undefined}
                />
              )}
            </DataTable>

            {dataModel.searchState.items.length > 0 && (
              <TablePagination searchState={dataModel.searchState} />
            )}
          </Gutters>
        </>
      )}
      {modalElement}
    </Page>
  );
});

const generateEmptyRelease = () => ({
  status: 'InProgress',
  name: '',
  baseline: {
    identifier: '',
    commitSha: '',
    refType: 'branch',
  },
  candidate: {
    identifier: '',
    commitSha: '',
    refType: 'branch',
  },
  providerRepositoryKey: '',
});

const SpinnerContainer = styled.div`
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;
