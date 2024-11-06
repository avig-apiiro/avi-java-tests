import { Button } from '@src-v2/components/button-v2';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';

export const RolesPermissionsFirstTimeLayout = () => (
  <GeneralErrorLayout
    title="No roles created yet"
    description={
      <>
        <GeneralErrorLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/rbac/rbac_roles">
            see the Apiiro User Docs
          </ExternalLink>
        </GeneralErrorLayout.Text>
      </>
    }>
    <Button variant={Variant.PRIMARY} to="/settings/access-permissions/roles/create">
      Create role
    </Button>
  </GeneralErrorLayout>
);
