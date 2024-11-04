import unauthorizationImageUrl from '@src-v2/assets/images/empty-state/unauthorization.svg';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { ExternalLink } from '@src-v2/components/typography';

export const UnauthorizationLayout = () => {
  return (
    <>
      <GeneralErrorLayout.ApiiroLogo />
      <GeneralErrorLayout
        image={unauthorizationImageUrl}
        title="You are not authorized to view this content"
        description={
          <>
            <GeneralErrorLayout.Text>
              Please contact your admin or{' '}
              <ExternalLink href="https://apiiro.atlassian.net/servicedesk/customer/portals">
                contact our support
              </ExternalLink>
            </GeneralErrorLayout.Text>
          </>
        }
      />
    </>
  );
};
