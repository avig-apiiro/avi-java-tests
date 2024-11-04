import { Button } from '@src-v2/components/button-v2';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';

export const TokenFirstTimeLayout = () => (
  <GeneralErrorLayout
    title="No tokens created yet"
    description={
      <>
        <GeneralErrorLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/admin-apiiro/access-tokens">
            see the Apiiro User Docs
          </ExternalLink>
        </GeneralErrorLayout.Text>
        <GeneralErrorLayout.Text>
          or the{' '}
          <ExternalLink href="https://docs.apiiro.com/apiiro-api/api">
            Apiiro API documentation
          </ExternalLink>
        </GeneralErrorLayout.Text>
      </>
    }>
    <Button variant={Variant.PRIMARY} to="/settings/access-permissions/tokens/create">
      Create token
    </Button>
  </GeneralErrorLayout>
);
