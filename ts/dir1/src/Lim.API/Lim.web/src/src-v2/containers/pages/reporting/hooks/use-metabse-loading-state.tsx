import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DefaultErrorFallback } from '@src-v2/components/async-boundary';
import { useInject } from '@src-v2/hooks';

export const useMetabaseLoadingState = (urlFetcher: () => Promise<string>) => {
  const { reporting } = useInject();
  const path = useParams<{ dashboard: string }>();

  const [state, setState] = useState({
    ready: false,
    pageLoading: true,
    error: null,
    iframeUrl: null,
  });

  useEffect(() => {
    (async () => {
      try {
        setState(prevState => ({ ...prevState, loading: true }));

        const url = await urlFetcher();
        const response = await fetch(url, { method: 'HEAD' });
        const error = !response.ok || response.status === 504 ? <DefaultErrorFallback /> : null;

        setState({
          pageLoading: false,
          error,
          ready: false,
          iframeUrl: error ? null : url,
        });
      } catch {
        setState({
          pageLoading: false,
          ready: false,
          error: 'Failed to load reports. Please try again.',
          iframeUrl: null,
        });
      }
    })();
  }, [reporting, path]);

  return [state, setState] as const;
};
