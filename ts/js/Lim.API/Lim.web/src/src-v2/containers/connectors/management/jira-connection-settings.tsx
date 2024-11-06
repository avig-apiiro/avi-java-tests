import { useCallback, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Combobox, FormContext, Input } from '@src-v2/components/forms';
import { CheckboxControl, RadioControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2, InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading1, SubHeading4 } from '@src-v2/components/typography';
import { FieldItem } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';

const MONITOR = {
  ALL_NEW: 'monitorAllNew',
  DISABLE_NEW: 'disableMonitorNew',
};

interface JiraConnectionSettings {
  monitorNew: string;
  apiiroToJira: {
    setTicketDueDateBasedOnSla?: boolean;
    autoCloseJiraTicketWhenRiskResolved?: boolean;
    commentOnCloseJiraTicketWhenRiskResolved?: boolean;
    reopenJiraTicketIfTicketIsClosedAndRiskInCodeIsStillOpen?: boolean;
    syncRiskMetadataToJiraTicket?: boolean;
  };
  jiraToApiiro: {
    reflectJiraTicketStatus?: boolean;
    syncJiraCommentsAndCustomRiskDefinitions?: boolean;
  };
}

export const JiraConnectionSettingsPage = () => {
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  const { connectors, toaster } = useInject();
  const history = useHistory();

  const [connection, currentServerSettings]: readonly [any, any] = useSuspense([
    [connectors.getConnection, { key: connectionUrl }],
    [connectors.getJiraServerSettings, { serverUrl: connectionUrl }],
  ] as const);

  const pageTitle = connection.displayName ? connection.displayName : connection.url;

  const createServerSettingPayload = ({
    monitorNew,
    apiiroToJira,
    jiraToApiiro,
  }: JiraConnectionSettings) => ({
    monitorNew: Boolean(monitorNew === MONITOR.ALL_NEW),
    apiiroToJiraSettings: {
      setTicketDueDateBasedOnSla: Boolean(apiiroToJira.setTicketDueDateBasedOnSla),
      autoCloseJiraTicketWhenRiskResolved: Boolean(
        apiiroToJira.autoCloseJiraTicketWhenRiskResolved
      ),
      commentOnCloseJiraTicketWhenRiskResolved: Boolean(
        apiiroToJira.commentOnCloseJiraTicketWhenRiskResolved
      ),
      syncRiskMetadataToJiraTicket: Boolean(apiiroToJira.syncRiskMetadataToJiraTicket),
    },
    jiraToApiiroSettings: {
      reflectJiraTicketStatus: Boolean(jiraToApiiro.reflectJiraTicketStatus),
      syncJiraCommentsAndCustomRiskDefinitions: Boolean(
        jiraToApiiro.syncJiraCommentsAndCustomRiskDefinitions
      ),
    },
  });

  const handleSubmit = useCallback(
    async (params: JiraConnectionSettings) => {
      try {
        const serverSettings = createServerSettingPayload(params);
        await connectors.setJiraServerSettings({
          serverUrl: connectionUrl,
          serverSettings,
        });
        toaster.success('Changes saved successfully!');
        history.push(`/connectors/manage/server/${connectionUrl}/issue-projects`);
      } catch (err) {
        toaster.error('Something went wrong');
      }
    },
    [connectionUrl]
  );

  const defaultValues = useMemo<JiraConnectionSettings>(
    () => ({
      monitorNew: currentServerSettings.monitorNew ? MONITOR.ALL_NEW : MONITOR.DISABLE_NEW,
      apiiroToJira: currentServerSettings.apiiroToJiraSettings,
      jiraToApiiro: currentServerSettings.jiraToApiiroSettings,
    }),
    [currentServerSettings]
  );

  const breadcrumbs = [
    { label: 'Connectors', to: '/connectors/connect' },
    { label: 'Manage', to: '/connectors/manage' },
    { label: pageTitle, to: `/connectors/manage/server/${connectionUrl}/settings` },
  ];

  useBreadcrumbs({ breadcrumbs });

  return (
    <Page title="Manage Server">
      <FormContext onSubmit={handleSubmit} defaultValues={defaultValues}>
        <StickyHeader>
          <FormControls />
        </StickyHeader>
        <PageContent>
          <FormContainer>
            {/*Auto monitoring for newly added projects*/}
            <FormLayoutV2.Section>
              <Heading1>Auto monitoring for newly added projects</Heading1>
              <SubHeading4>
                Choose a monitoring policy for new projects that are added to this connection,
              </SubHeading4>
              <SettingsFieldSet>
                <InputClickableLabel>
                  <RadioControl name="monitorNew" value={MONITOR.ALL_NEW} /> Auto monitor new
                  projects
                </InputClickableLabel>
                <InputClickableLabel>
                  <RadioControl name="monitorNew" value={MONITOR.DISABLE_NEW} /> Disable automatic
                  monitoring
                </InputClickableLabel>
              </SettingsFieldSet>
            </FormLayoutV2.Section>

            {/*Apiiro to Jira*/}
            <FormLayoutV2.Section>
              <Heading1>Apiiro to Jira</Heading1>
              <SubHeading4>Reflect actions from Apiiro on linked tickets</SubHeading4>
              <SettingsFieldSet>
                {/*<InputClickableLabel>*/}
                {/*  <CheckboxControl name="apiiroToJira.setTicketDueDateBasedOnSla" /> Set ticket due*/}
                {/*  date based on SLA*/}
                {/*</InputClickableLabel>*/}
                <InputClickableLabel>
                  <CheckboxControl name="apiiroToJira.autoCloseJiraTicketWhenRiskResolved" />{' '}
                  Automatically close Jira ticket when risk is accepted, ignored or resolved in code
                </InputClickableLabel>
                <InputClickableLabel>
                  <CheckboxControl name="apiiroToJira.commentOnCloseJiraTicketWhenRiskResolved" />{' '}
                  Automatically only comment on Jira ticket when risk is accepted, ignored or
                  resolved in code
                </InputClickableLabel>
                <InputClickableLabel>
                  <CheckboxControl name="apiiroToJira.syncRiskMetadataToJiraTicket" /> Sync risk
                  metadata (comments, due date) to Jira ticket
                </InputClickableLabel>
              </SettingsFieldSet>
            </FormLayoutV2.Section>

            {/*Jira to Apiiro*/}
            <FormLayoutV2.Section>
              <Heading1>Jira to Apiiro</Heading1>
              <SubHeading4>Reflect actions from linked tickets on a risk</SubHeading4>
              <SettingsFieldSet>
                <InputClickableLabel>
                  <CheckboxControl name="jiraToApiiro.reflectJiraTicketStatus" /> Reflect Jira
                  ticket status
                </InputClickableLabel>
                <InputClickableLabel>
                  <CheckboxControl name="jiraToApiiro.syncJiraCommentsAndCustomRiskDefinitions" />{' '}
                  Sync Jira comments and custom risk definitions to risk timeline
                </InputClickableLabel>
              </SettingsFieldSet>
            </FormLayoutV2.Section>
          </FormContainer>
        </PageContent>
      </FormContext>
    </Page>
  );
};

const FormContainer = styled(FormLayoutV2.Container)`
  ${Combobox} {
    width: auto;
    max-width: unset;
  }
  ${FieldItem} ${Combobox}:first-child ${Input} {
    width: 62rem;
  }
`;

const FormControls = () => {
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  return (
    <>
      <Button
        to={`/connectors/manage/server/${connectionUrl}/issue-projects`}
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
`;

const SettingsFieldSet = styled.div`
  display: flex;
  flex-direction: column;

  ${InputClickableLabel} {
    margin-bottom: 4rem;
  }
`;
