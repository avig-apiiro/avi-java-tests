import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import NoMonitoredBranches from '@src-v2/assets/images/empty-state/no-monitored-branches.svg';
import NoScmConnectedImage from '@src-v2/assets/images/empty-state/no-scm-connected.svg';
import { Button } from '@src-v2/components/button-v2';
import { Collapsible } from '@src-v2/components/collapsible';
import { ConnectEmptyLayout } from '@src-v2/components/layout';
import { NoScmConnectedFooter } from '@src-v2/components/layout/first-time-layouts/no-scm-connected/no-scm-connected-footer';
import { VerticalSteps } from '@src-v2/components/layout/first-time-layouts/no-scm-connected/vertical-steps';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, Heading2, TextLink } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';

export const NoScmConnectedLayout = observer(() => {
  const { application } = useInject();
  const { pathname } = useLocation();
  const hasScmConnected = pathname.includes('monitor');

  const verticalSteps = [
    {
      label: 'Connect SCM',
      checked: hasScmConnected,
    },
    {
      label: 'Monitor your repositories',
      checked: application.integrations?.hasMonitoredRepositories,
    },
  ];

  return (
    <Container>
      <ConnectEmptyLayout
        image={hasScmConnected ? NoMonitoredBranches : NoScmConnectedImage}
        title={<Title>Welcome to Apiiro!</Title>}
        description={
          <>
            <Heading2>
              {hasScmConnected ? 'Monitor your repositories' : 'Connect your SCM'}
            </Heading2>
            <VerticalSteps steps={verticalSteps} />
          </>
        }>
        <Button
          to={hasScmConnected ? '/connectors/manage' : '/connectors/connect/SourceCode'}
          size={Size.LARGE}
          endIcon="Arrow">
          {hasScmConnected ? 'Monitor repositories' : 'Connect SCM'}
        </Button>
        {!hasScmConnected && (
          <CustomCollapsible title="Using Network Broker?">
            <BrokerContainer>
              <TextLink to="settings/access-permissions/tokens/create">Create a token</TextLink> and{' '}
              <TextLink to="/connectors/connect/NetworkBroker">connect Network Broker</TextLink>.
              {'\n'}For more information,{' '}
              <ExternalLink href="https://docs.apiiro.com/understand_inventory/app_customization">
                see the Apiiro User Docs
              </ExternalLink>
            </BrokerContainer>
          </CustomCollapsible>
        )}
      </ConnectEmptyLayout>
      <NoScmConnectedFooter />
    </Container>
  );
});

const Container = styled.div`
  display: grid;
  grid-template-rows: calc(100vh - 37rem - var(--top-bar-height)) 37rem;

  ${ConnectEmptyLayout} {
    height: 100%;
    padding-left: 3rem;
  }

  ${VerticalSteps} {
    margin: 5rem 0 1rem;
  }

  ${Collapsible.Head} {
    flex-direction: row-reverse;
    gap: 1rem;

    ${Collapsible.Chevron} {
      --icon-size: 4rem;
    }

    ${Collapsible.Title} {
      font-size: var(--font-size-xs);
      font-weight: 400;
      line-height: 4rem;
      color: var(--color-blue-gray-60);

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const Title = styled.div`
  font-size: 8rem;
  font-weight: 700;
  line-height: 11rem;
`;

const BrokerContainer = styled.div`
  color: var(--color-blue-gray-50);
  font-size: 3rem;
  padding-left: 5rem;
  white-space: pre;

  ${TextLink} {
    text-decoration: underline;
  }
`;

// this is for the collapsible to open down and not pushing all element up
const CustomCollapsible = styled(Collapsible)`
  height: 0;
`;
