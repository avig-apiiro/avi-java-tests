import { useEffect } from 'react';
import { sleep } from '@src-v2/utils/async-utils';

export const useReportingReady = (iframeRef, isPageLoading, onReady) => {
  useEffect(() => {
    let isMounted = true;
    const startTime = performance.now();

    const checkForCompletion = async () => {
      // Wait for METABASE loader to appear
      while (
        !iframeRef.current?.contentDocument?.querySelector(`[data-testid="loading-spinner"]`)
      ) {
        await sleep(100);
        if (!isMounted) {
          return;
        }
      }

      // Wait for METABASE loader to disappear
      while (iframeRef.current?.contentDocument?.querySelector(`[data-testid="loading-spinner"]`)) {
        await sleep(100);
        if (!isMounted) {
          return;
        }
      }

      const checkStillWaiting = () => {
        if (!isMounted) {
          return;
        }
        const stillWaitingPresent = Boolean(
          findElementByText('Still Waiting…', iframeRef.current.contentDocument)
        );
        if (stillWaitingPresent) {
          setTimeout(checkStillWaiting, 100);
        } else {
          const endTime = performance.now();
          const totalTime = endTime - startTime;
          onReady?.(totalTime);
        }
      };

      await sleep(500);
      checkStillWaiting();
    };

    if (!isPageLoading) {
      checkForCompletion();
    }

    return () => {
      isMounted = false;
    };
  }, [isPageLoading, iframeRef]);
};

function findElementByText(text, parent = document) {
  const xpath = `//*[contains(text(), '${text}')]`;
  const elements = parent.evaluate(xpath, parent, null, XPathResult.ANY_TYPE, null);
  return elements.iterateNext();
}
