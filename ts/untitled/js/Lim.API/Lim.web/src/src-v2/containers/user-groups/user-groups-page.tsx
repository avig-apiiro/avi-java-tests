import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Skeleton } from '@src-v2/components/animations/skeleton';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Badge } from '@src-v2/components/badges';
import { Button } from '@src-v2/components/button-v2';
import { ProfileCard } from '@src-v2/components/cards/profile-card';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import { SvgIcon } from '@src-v2/components/icons';
import { InfiniteScroll } from '@src-v2/components/infinite-scroll';
import { ErrorLayout, Gutters } from '@src-v2/components/layout';
import { UserGroupsFirstTimeLayout } from '@src-v2/components/layout/first-time-layouts/user-groups-first-time-layout';
import { Page } from '@src-v2/components/layout/page';
import { ResultsCounter } from '@src-v2/components/persistent-search-state/persistent-search-filters';
import { ScrollSyncContext } from '@src-v2/components/scroll-sync';
import { TableControls } from '@src-v2/components/table/table-addons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Subtitle, Title } from '@src-v2/components/typography';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { usePersistentSearchState } from '@src-v2/hooks/use-search-state';
import { StubAny } from '@src-v2/types/stub-any';
import { preventDefault } from '@src-v2/utils/dom-utils';

export const UserGroupsPage = observer(() => {
  const { userGroups, rbac } = useInject();
  const { activeFilters } = useFilters();
  const [modalElement, setModal, closeModal] = useModalState();

  const searchState = useSuspense(userGroups.getApiiroUserGroups, {});

  const handleSubmitDelete = useCallback(
    (itemKey: string) => {
      userGroups.deleteUserGroup(itemKey);
      userGroups.invalidateGroups();
      closeModal();
    },
    [userGroups, closeModal]
  );

  const handleGroupDelete = useCallback(
    (item: StubAny) =>
      setModal(
        <ConfirmationModal
          title={`Delete ${item.name}?`}
          submitStatus="failure"
          submitText="Delete"
          onSubmit={() => handleSubmitDelete(item.key)}
          onClose={closeModal}>
          {item.assignedRoles?.length > 0 && <p>This group is assigned to roles. </p>}
          <p>Are you sure you want to delete this group?</p>
        </ConfirmationModal>
      ),
    [closeModal, setModal, handleSubmitDelete]
  );

  return (
    <Page title="User groups">
      {searchState.total === 0 ? (
        <UserGroupsFirstTimeLayout />
      ) : (
        <Gutters>
          <UserGroupsPageTableControls>
            <SearchFilterInput
              defaultValue={activeFilters?.searchTerm}
              placeholder="Search by group name"
            />
            <UserGroupsPageTableEndControls>
              <AsyncBoundary pendingFallback={<Skeleton.Text length={15} />}>
                <ResultsCounter
                  count={searchState?.count}
                  total={searchState?.total}
                  itemName="user groups"
                />
              </AsyncBoundary>
              {rbac.canEdit(resourceTypes.Global) && (
                <Button to="/settings/access-permissions/user-groups/create">Create Group</Button>
              )}
            </UserGroupsPageTableEndControls>
          </UserGroupsPageTableControls>
          <AsyncBoundary>
            <ConsumablesInfiniteScroll handleGroupDelete={handleGroupDelete} />
          </AsyncBoundary>
        </Gutters>
      )}
      {modalElement}
    </Page>
  );
});

const ConsumablesInfiniteScroll = observer(
  ({ handleGroupDelete }: { handleGroupDelete: Function }) => {
    const history = useHistory();
    const { activeFilters } = useFilters();
    const { searchTerm } = activeFilters;
    const { userGroups, rbac } = useInject();

    const searchState = usePersistentSearchState(userGroups.getApiiroUserGroups, {
      searchTerm,
    });

    const handleEditGroup = (key: string) => {
      userGroups.invalidateEditGroup();
      history.push(`/settings/access-permissions/user-groups/${key}/edit`);
    };

    return (
      <InfiniteScroll searchState={searchState}>
        {searchState.count === 0 ? (
          <ErrorLayout.NoResults />
        ) : (
          <ScrollSyncContext>
            <CardsContainer>
              {searchState.items.map(item => (
                <ProfileCard key={item.key}>
                  <Header>
                    <Description>
                      <Title>
                        {item.name}
                        {item.isAdminBySelf && <Badge>Administered by me</Badge>}
                      </Title>
                      <Subtitle>{item.description}</Subtitle>
                    </Description>
                    <Tooltip
                      content="Contact your admin to edit or delete a group"
                      disabled={rbac.canEdit(resourceTypes.Global) || item.isAdminBySelf}>
                      <DropdownMenu
                        data-name="team-actions"
                        disabled={!rbac.canEdit(resourceTypes.Global) && !item.isAdminBySelf}
                        onClick={preventDefault}
                        onItemClick={preventDefault}>
                        <Dropdown.Item onClick={() => handleEditGroup(item.key)}>
                          <SvgIcon name="Edit" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleGroupDelete(item)}>
                          <SvgIcon name="Trash" /> Delete
                        </Dropdown.Item>
                      </DropdownMenu>
                    </Tooltip>
                  </Header>
                  <Content>
                    <ContentItem>
                      {item.adminsCount ?? 0} {item.adminsCount === 1 ? 'admin' : 'admins'}
                    </ContentItem>
                    <ContentItem>
                      {item.membersCount ?? 0} {item.membersCount === 1 ? 'user' : 'users'}
                    </ContentItem>
                    <ContentItem>
                      {item.rolesCount ?? 0}{' '}
                      {item.rolesCount === 1 ? 'role assignment' : 'role assignments'}
                    </ContentItem>
                  </Content>
                </ProfileCard>
              ))}
            </CardsContainer>
          </ScrollSyncContext>
        )}
      </InfiniteScroll>
    );
  }
);

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12rem;
  gap: 4rem;

  ${ProfileCard} {
    gap: 0;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  line-height: 1;
`;

const Content = styled.div`
  display: flex;
  font-size: var(--font-size-s);
  color: var(--color-blue-gray-60);
`;

const ContentItem = styled.span`
  &:not(:last-child):after {
    content: '·';
    margin: 0 4rem;
  }
`;

const Description = styled.div`
  width: 100%;

  ${Title} {
    display: flex;
    align-items: center;
    line-height: 7rem;
    gap: 3rem;
  }
`;

const UserGroupsPageTableControls = styled(TableControls)`
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const UserGroupsPageTableEndControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;
`;
