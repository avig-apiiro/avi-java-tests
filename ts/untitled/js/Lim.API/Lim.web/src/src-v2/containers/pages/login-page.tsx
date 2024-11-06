import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { CardLayout, PageSpinner } from '@src-v2/components/layout';
import LoginForm from '@src-v2/containers/login-form';
import { useInject, useQueryParams } from '@src-v2/hooks';

const LoginPage = () => {
  const { session, toaster } = useInject();
  const {
    queryParams: { returnUrl = '/' },
  } = useQueryParams();

  useEffect(() => {
    if (session.serverAuthentication && !session.connected) {
      if (session.gatewayAuthentication && !document.cookie.includes('refreshed')) {
        document.cookie = `refreshed=true; expires=${new Date(
          new Date().getTime() + 10 * 60 * 1000
        ).toUTCString()}`;
        window.location.reload();
        return;
      }
      // @ts-expect-error
      session.login({ returnUrl }).catch(error => {
        toaster.error('Something went wrong');
        console.error('Login failed', error);
      });
    }
  }, [session.serverAuthentication, session.connected, session.gatewayAuthentication]);

  if (session.connected) {
    return <Redirect to={returnUrl} />;
  }

  if (session.serverAuthentication) {
    return <PageSpinner />;
  }

  if (window.location.hostname.endsWith('.apiiro.com') && !document.cookie.includes('refreshed')) {
    document.cookie = `refreshed=true; expires=${new Date(
      new Date().getTime() + 10 * 60 * 1000
    ).toUTCString()}`;
    // @ts-expect-error
    window.location.href = returnUrl;
    return <PageSpinner />;
  }

  return (
    <CardLayout>
      <LoginForm />
    </CardLayout>
  );
};

export default LoginPage;
