import { Button } from '@src-v2/components/button-v2';
import { ConnectEmptyLayout } from '@src-v2/components/layout';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink } from '@src-v2/components/typography';

export const ApplicationFirstTimeLayout = () => (
  <ConnectEmptyLayout
    title="Create your first Apiiro Application!"
    description={
      <>
        <ConnectEmptyLayout.Text>
          Aggregate your relevant code repos, modules, and projects into a single Apiiro Application
          entity.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          Once created, you can scope the risks, reports, dashboards, and Explorer queries based on
          that specific Application to streamline how you analyze and measure risk across your
          various environments.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/understand_inventory/app_customization">
            see the Apiiro User Docs
          </ExternalLink>
        </ConnectEmptyLayout.Text>
      </>
    }>
    <Button to="/profiles/applications/create" size={Size.LARGE}>
      Create Application
    </Button>
  </ConnectEmptyLayout>
);
