import { Button } from '@src-v2/components/button-v2';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';

export const UserGroupsFirstTimeLayout = () => (
  <GeneralErrorLayout
    title="No user group created yet"
    description={
      <>
        <GeneralErrorLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/rbac/rbac_groups#create-and-define-user-groups">
            see the Apiiro User Docs
          </ExternalLink>
        </GeneralErrorLayout.Text>
      </>
    }>
    <Button variant={Variant.PRIMARY} to="/settings/access-permissions/user-groups/create">
      Create user group
    </Button>
  </GeneralErrorLayout>
);
