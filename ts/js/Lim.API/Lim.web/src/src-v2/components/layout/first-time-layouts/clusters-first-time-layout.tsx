import electricWireConnect from '@src-v2/assets/images/empty-state/electric-wire-connect.svg';
import { Button } from '@src-v2/components/button-v2';
import { ConnectEmptyLayout } from '@src-v2/components/layout';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink } from '@src-v2/components/typography';

export const ClustersFirstTimeLayout = () => (
  <ConnectEmptyLayout
    title="Connect your Kubernetes cluster data"
    image={electricWireConnect}
    description={
      <>
        <ConnectEmptyLayout.Text>
          Map your code components to Kubernetes clusters, including workloads, networking, secrets,
          and other resources.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          Leverage the power of Apiiro to get runtime context from your clusters, including whether
          risks are in deployed or internet-exposed components to improve prioritization and reduce
          triage time for all security issues.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          You can connect a cloud environment or security tool to import your Kubernetes
          architecture.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/integrations/runtime/intro_runtimetools">
            see the Apiiro User Docs
          </ExternalLink>
        </ConnectEmptyLayout.Text>
      </>
    }>
    <Button to="/connectors/connect/Runtime/KubernetesClusters" size={Size.LARGE}>
      Connect Kubernetes cluster
    </Button>
  </ConnectEmptyLayout>
);
