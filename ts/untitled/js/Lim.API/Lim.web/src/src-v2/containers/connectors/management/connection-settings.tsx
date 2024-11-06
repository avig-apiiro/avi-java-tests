import { animated } from '@react-spring/web';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { CorneredCard } from '@src-v2/components/cards/cornered-card';
import { ProfileCard } from '@src-v2/components/cards/profile-card';
import { FormContext } from '@src-v2/components/forms';
import {
  CheckboxControl,
  RadioControl,
  SelectControlV2,
} from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { getRepositoryBannerText } from '@src-v2/components/marketing/marketing-utils';
import { UpgradeRequestModal } from '@src-v2/components/marketing/upgrade-request-modal';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Light, Subtitle, Title } from '@src-v2/components/typography';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { useCollapsible } from '@src-v2/hooks/use-collapsible';
import { useModalState } from '@src-v2/hooks/use-modal-state';

const MONITOR = {
  ALL_NEW: 'monitorAllNew',
  DISABLE_NEW: 'disableMonitorNew',
  NEW_BY_GROUP: 'monitorNewByGroup',
};

export const ConnectionSettings = () => {
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  const {
    connectors,
    subscription: { limitations },
    toaster,
  } = useInject();
  const history = useHistory();

  const [connection, repositoryGroups, monitorNewStatus]: readonly [any, any, any] = useSuspense([
    [connectors.getConnection, { key: connectionUrl }],
    [connectors.getRepositoriesGroups, { key: connectionUrl }],
    [connectors.getMonitorNewStatus, { key: connectionUrl }],
  ] as const);

  const [modalElement, setModal, closeModal] = useModalState();
  const pageTitle = connection.displayName ? connection.displayName : connection.url;
  const hasCustomGroupsOption = connection.providerGroup !== 'Github';

  const handleAutoMonitorToggle = useCallback(
    (serverUrl, shouldMonitor, monitorArchived?: boolean) => {
      limitations.limitMultiMonitorOptions
        ? setModal(
            // @ts-ignore
            <UpgradeRequestModal
              title="Upgrade to automatically monitor new repositories"
              description={getRepositoryBannerText(limitations)}
              onClose={closeModal}
            />
          )
        : connectors.setServerMonitorNew({
            serverUrl,
            shouldMonitor,
            monitorArchived,
          });
    },
    [limitations, setModal, connectors]
  );

  const handleSubmit = useCallback(
    params => {
      submit(params);

      async function submit({ monitorNewMode: { value, includeArchived }, selectedGroups }) {
        const selectedGroupKeys = selectedGroups?.map(group => group.key);
        try {
          switch (value) {
            case MONITOR.ALL_NEW:
              await handleAutoMonitorToggle(connectionUrl, true, includeArchived);

              break;
            case MONITOR.DISABLE_NEW:
              await handleAutoMonitorToggle(connectionUrl, false);
              break;
            case MONITOR.NEW_BY_GROUP:
              await connectors.setServerMonitorNewRepositoriesGroups({
                serverUrl: connectionUrl,
                groupsKeys: selectedGroupKeys,
                shouldMonitor: true,
                monitorArchived: includeArchived,
              });
              break;
            default:
              break;
          }
          toaster.success('Changes saved successfully!');
          history.push(`/connectors/manage/server/${connectionUrl}/repositories`);
        } catch (err) {
          toaster.error('Something went wrong');
        }
      }
    },
    [handleAutoMonitorToggle, connectionUrl]
  );

  const getDefaultValue = useCallback(() => {
    if (monitorNewStatus.monitorAllNew) {
      return MONITOR.ALL_NEW;
    }
    if (monitorNewStatus.repositoriesGroupsWithMonitorNew.length > 0) {
      return MONITOR.NEW_BY_GROUP;
    }
    return MONITOR.DISABLE_NEW;
  }, [monitorNewStatus]);

  useBreadcrumbs({
    breadcrumbs: [
      { label: 'Manage', to: '/connectors/manage' },
      {
        label: pageTitle,
        to: `/connectors/manage/server/${connectionUrl}/repositories`,
      },
    ],
  });

  return (
    <Page title="Manage Server">
      <FormContext
        onSubmit={handleSubmit}
        defaultValues={{
          monitorNewMode: {
            value: getDefaultValue(),
            includeArchived: monitorNewStatus.monitorArchivedRepositories,
          },
          selectedGroups: monitorNewStatus.repositoriesGroupsWithMonitorNew.map(
            (group: string) => ({
              key: group,
              label: group,
            })
          ),
        }}>
        <StickyHeader title={pageTitle}>
          <FormControls connectionUrl={connectionUrl} />
        </StickyHeader>
        <PageContent>
          <>
            <FormCard>
              <div>
                <Title>Auto monitoring for newly added repositories and projects</Title>
                <Light>
                  Choose a monitoring policy for new repositories that are added to this connection.
                  {'\n'}
                  To monitor a specific repository, click the monitoring column for the relevant
                  repository.
                </Light>
              </div>
              <SettingsFieldSet>
                <CollapsibleOptions
                  value={MONITOR.ALL_NEW}
                  option={
                    <Label>
                      <RadioControl name="monitorNewMode.value" value={MONITOR.ALL_NEW} />
                      Monitor new repositories and projects
                    </Label>
                  }
                  collapsedContent={
                    <Label>
                      <CheckboxControl name="monitorNewMode.includeArchived" />
                      Include archived repositories
                    </Label>
                  }
                />

                {hasCustomGroupsOption && (
                  <CollapsibleOptions
                    value={MONITOR.NEW_BY_GROUP}
                    option={
                      <Label>
                        <RadioControl name="monitorNewMode.value" value={MONITOR.NEW_BY_GROUP} />
                        Monitor new repositories and projects in specific repository groups
                      </Label>
                    }
                    collapsedContent={
                      <>
                        <Label>
                          <CheckboxControl name="monitorNewMode.includeArchived" />
                          Include archived repositories
                        </Label>
                        <RepositoryGroupsSelector repositoryGroups={repositoryGroups} />
                      </>
                    }
                  />
                )}
                <Label>
                  <RadioControl name="monitorNewMode.value" value={MONITOR.DISABLE_NEW} />
                  Disable automatic monitoring for new repositories and projects
                </Label>
              </SettingsFieldSet>
            </FormCard>
          </>
        </PageContent>
      </FormContext>
      {modalElement}
    </Page>
  );
};

const RepositoryGroupsSelector = styled(({ repositoryGroups, ...props }) => (
  <SelectControlV2
    {...props}
    multiple
    name="selectedGroups"
    placeholder="Add Repo Groups"
    options={repositoryGroups?.map((group: string) => ({
      key: group,
      label: group,
    }))}
    clearable={false}
  />
))`
  margin: 0 6rem 3rem 0;
`;

const CollapsibleOptions = ({ option, collapsedContent, value }) => {
  const { watch } = useFormContext();
  const selectedValue = watch('monitorNewMode');
  const { getContentProps } = useCollapsible({
    open: selectedValue.value === value,
    overflow: 'visible',
  });

  return (
    <>
      {option}
      <AnimationWrapper {...getContentProps()}>{collapsedContent}</AnimationWrapper>
    </>
  );
};

const FormControls = ({ connectionUrl }) => {
  return (
    <>
      <Button
        to={`/connectors/manage/server/${connectionUrl}/repositories`}
        variant={Variant.SECONDARY}
        size={Size.LARGE}>
        Cancel
      </Button>
      <Button type="submit" variant={Variant.PRIMARY} size={Size.LARGE}>
        Save
      </Button>
    </>
  );
};

const PageContent = styled(Gutters)`
  padding-top: 10rem;

  ${CorneredCard} {
    --card-ribbon-color: var(--color-green-40);
    width: 200rem;
    min-height: 43rem;
    margin-bottom: 10rem;

    &[data-faulted] {
      --card-ribbon-color: var(--color-red-45);
    }
  }

  ${Title} {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 1rem;

    &.active {
      border-bottom: 0.5rem solid var(--color-grayscale-70);
    }
  }
`;

const FormCard = styled(ProfileCard)`
  margin-bottom: 4rem;
  padding-bottom: 0;
  padding-left: 8rem;
  gap: 8rem;

  ${Subtitle} {
    font-size: var(--font-size-s);
    color: var(--color-blue-gray-60);
  }

  ${Light} {
    white-space: break-spaces;
  }

  ${Form.Fieldset} {
    padding-bottom: 0;
  }
`;

const AnimationWrapper = styled(animated.div)`
  margin-left: 7rem;
`;

const Label = styled.label`
  display: flex;
  gap: 3rem;
  align-items: center;
  margin-bottom: 4rem;
`;

const SettingsFieldSet = styled.div`
  margin-bottom: 4rem;
`;
