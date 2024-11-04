import bullsEyeUrl from '@src-v2/assets/images/empty-state/bulls-eye.svg';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { ExternalLink } from '@src-v2/components/typography';

export const OopsSomethingWrongLayout = () => {
  return (
    <GeneralErrorLayout
      image={bullsEyeUrl}
      title="Oops! Something went wrong"
      description={
        <>
          <GeneralErrorLayout.Text>You can refresh or try again later</GeneralErrorLayout.Text>
          <GeneralErrorLayout.Text>
            Having issues?{' '}
            <ExternalLink href="https://apiiro.atlassian.net/servicedesk/customer/portals">
              Contact our support
            </ExternalLink>
          </GeneralErrorLayout.Text>
        </>
      }
    />
  );
};
