import { Button } from '@src-v2/components/button-v2';
import { ConnectEmptyLayout } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';

export const OrgTeamFirstTimeLayout = () => (
  <ConnectEmptyLayout
    title="Create your first Apiiro Team!"
    description={
      <>
        <ConnectEmptyLayout.Text>
          Group your relevant code and security contributors into Apiiro Teams. Leverage the Apiiro
          Inventory and Risk findings for the associated repositories and applications your people
          are working on.
        </ConnectEmptyLayout.Text>
        <ConnectEmptyLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/understand_inventory/organization_teams/teams">
            see the Apiiro User Docs
          </ExternalLink>
        </ConnectEmptyLayout.Text>
      </>
    }>
    <Button variant={Variant.PRIMARY} to="/profiles/teams/create">
      Create Team
    </Button>
  </ConnectEmptyLayout>
);
