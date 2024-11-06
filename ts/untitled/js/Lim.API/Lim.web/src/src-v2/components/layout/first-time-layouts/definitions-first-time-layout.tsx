import { Button } from '@src-v2/components/button-v2';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink } from '@src-v2/components/typography';

export const DefinitionsFirstTimeLayout = ({ onClick }: { onClick: () => void }) => (
  <GeneralErrorLayout
    title="No definition created yet"
    description={
      <>
        <GeneralErrorLayout.Text>
          For more information,{' '}
          <ExternalLink href="https://docs.apiiro.com/customize-apiiro/definitions">
            see the Apiiro User Docs
          </ExternalLink>
        </GeneralErrorLayout.Text>
      </>
    }>
    <Button variant={Variant.PRIMARY} onClick={onClick}>
      Create definition
    </Button>
  </GeneralErrorLayout>
);
