import astronoutImageUrl from '@src-v2/assets/images/empty-state/astronout.svg';
import { GeneralErrorLayout } from '@src-v2/components/layout';
import { ExternalLink } from '@src-v2/components/typography';

export const ConnectionLostLayout = () => {
  return (
    <GeneralErrorLayout
      image={astronoutImageUrl}
      title="Connection lost"
      description={
        <>
          <GeneralErrorLayout.Text>
            Please check your network or VPN connection.{'\n'}If server update is in progress, you
            will be redirected once done.
          </GeneralErrorLayout.Text>
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
