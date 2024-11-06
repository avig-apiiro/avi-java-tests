import { Button } from '@src-v2/components/button-v2';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';

export const ReleasesFirstTimeLayout = ({ onClick }: { onClick: () => void }) => (
  <GeneralErrorLayout
    title="No release assessment created yet"
    description={
      <>
        <GeneralErrorLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/customize-apiiro/release-page">
            see the Apiiro User Docs
          </ExternalLink>
        </GeneralErrorLayout.Text>
      </>
    }>
    <Button variant={Variant.PRIMARY} onClick={onClick}>
      Create release assessment
    </Button>
  </GeneralErrorLayout>
);
