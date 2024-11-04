import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useMemo, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { BaseIcon, VendorIcon } from '@src-v2/components/icons';
import { StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { ConfirmationMultiBranchModal } from '@src-v2/components/multi-branch/confirmation-modal';
import { MultiBranch } from '@src-v2/components/multi-branch/multi-branch';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Title } from '@src-v2/components/typography';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const MultiBranchPage = observer(() => {
  const history = useHistory();
  const params = useParams<{ key: string; providerRepositoryKey: string }>();
  const { state, pathname } = useLocation<{
    isSingleConnection?: boolean;
    isAllRepositories?: boolean;
  }>();
  const { connectors, application } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();

  const {
    key: repositoryKey,
    name: repositoryName,
    server,
  } = useSuspense(connectors.getProviderRepositoryData, {
    key: params?.providerRepositoryKey,
  });

  const [changedData, setChangedData] = useState({
    branchesToMonitor: [],
    branchesToUnmonitor: [],
    branchTags: {},
  });

  const { branchesToMonitor, branchesToUnmonitor, branchTags } = changedData;

  const hasChanges = useMemo(
    () =>
      !_.isEmpty(branchesToMonitor) ||
      !_.isEmpty(branchesToUnmonitor) ||
      !_.isEmpty(Object.keys(branchTags)),
    [changedData]
  );

  const handleOpenModal = useCallback(() => {
    setModal(
      <ConfirmationMultiBranchModal
        repositoryKey={repositoryKey}
        repositoryName={repositoryName}
        changedData={changedData}
        onClose={closeModal}
      />
    );
  }, [repositoryKey, changedData, closeModal, setModal]);

  const breadcrumbs = useMemo(() => {
    if (pathname.includes('connectors')) {
      if (state?.isSingleConnection) {
        return [
          {
            label: server.providerGroup,
            to: `/connectors/manage/${encodeURIComponent(server.providerGroup)}`,
            isPinned: true,
          },
          state?.isAllRepositories
            ? {
                label: 'All repositories',
                to: '/connectors/manage/repositories',
                isPinned: true,
              }
            : {
                label: server.url,
                to: `/connectors/manage/server/${encodeURIComponent(server.url)}/repositories`,
                isPinned: true,
              },
        ];
      }
      return [
        { label: 'Manage', to: `/connectors/manage`, isPinned: true },
        {
          label: server.url,
          to: `/connectors/manage/server/${encodeURIComponent(server.url)}/repositories`,
          isPinned: true,
        },
      ];
    }

    return [
      {
        label: repositoryName,
        to: `/profiles/repositories/${encodeURIComponent(params?.key)}/profile`,
        isPinned: true,
      },
    ];
  }, [repositoryName, params, server, state, pathname]);

  useBreadcrumbs({ breadcrumbs });

  if (!params) {
    history.push('/connectors/manage');
  }

  return (
    <Page title="Configure Branch Monitoring">
      <MultiBranchStickyHeader
        title={
          <>
            Branch Monitoring - <VendorIcon name={server.providerGroup} /> {repositoryName}
          </>
        }>
        <Button variant={Variant.SECONDARY} to="/connectors/manage/repositories">
          Cancel
        </Button>
        <Button onClick={handleOpenModal} disabled={!hasChanges}>
          Save
        </Button>
      </MultiBranchStickyHeader>

      <AsyncBoundary>
        <MultiBranch
          repositoryKey={params?.providerRepositoryKey}
          changedData={changedData}
          setChangedData={setChangedData}
          maxMonitorSize={application.configuration.maxRepositoriesPerProviderRepository}
        />
        {modalElement}
      </AsyncBoundary>
    </Page>
  );
});

const MultiBranchStickyHeader = styled(StickyHeader)`
  ${Title} {
    display: flex;
    align-items: center;
    font-size: 9rem;
    font-weight: 600;
    gap: 2rem;

    ${BaseIcon} {
      position: relative;
      top: 0.5rem;
      width: 7rem;
      height: 7rem;
    }
  }
`;
