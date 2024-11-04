import { Button } from '@src-v2/components/button-v2';
import { ConnectEmptyLayout } from '@src-v2/components/layout';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink } from '@src-v2/components/typography';

export const ApplicationGroupFirstTimeLayout = () => (
  <ConnectEmptyLayout
    title="Create your first Apiiro Application Group!"
    description={
      <>
        <ConnectEmptyLayout.Text>
          Application Groups let you aggregate the applications that belong to a specific business
          initiative in your organization and build an additional hierarchy within the application
          domain to measure and track risk posture.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          You can filter by Application Group in the Dashboard, All risks, Coverage, Reports, and
          Solutions pages.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/understand_inventory/app_customization">
            see the Apiiro User Docs
          </ExternalLink>
        </ConnectEmptyLayout.Text>
      </>
    }>
    <Button to="/profiles/groups/create" size={Size.LARGE}>
      Create Application Group
    </Button>
  </ConnectEmptyLayout>
);
