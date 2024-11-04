import _ from 'lodash';
import React, { useEffect } from 'react';
import { useQueryParams, useToggle } from '@src-v2/hooks';

type ParamTuple = [string, string];

const baseParams: ParamTuple[] = [
  ['header', 'false'],
  ['logo', 'false'],
  ['top_nav', 'false'],
];

const breakoutPathName = '/proxy/reporting/question';

const cleanupWindowLoaction = () => {
  const urlWithoutSearchParams = window.location.pathname + window.location.hash;
  window.history.replaceState({}, '', urlWithoutSearchParams);
};

const makeReportingUrl = (paramsTuples: ParamTuple[]) => {
  let queryString = '';
  paramsTuples.forEach((param: ParamTuple, index: number) => {
    const key = encodeURIComponent(param[0]);
    const value = encodeURIComponent(param[1]);
    queryString += `${index > 0 ? '&' : ''}${key}=${value}`;
  });
  return queryString;
};

export const useUpdateIframeQueryParamsFromReferer = (
  iframeRef: React.MutableRefObject<HTMLIFrameElement>
) => {
  const { queryParams } = useQueryParams();
  const [hasBeenUpdated, toggleHasBeenUpdated] = useToggle(false);

  useEffect(() => {
    if (!hasBeenUpdated && iframeRef?.current?.contentWindow?.location) {
      toggleHasBeenUpdated(true);

      const baseUrl = new URL(iframeRef.current.contentWindow.location.href);
      const currentSearchParams = new URLSearchParams(window.location.search);
      const currentHash = window.location.hash;
      const currentParamsTuples = [...baseParams, ...Array.from(currentSearchParams.entries())];

      if (currentSearchParams.toString() && !currentHash) {
        iframeRef.current.contentWindow.location.search = makeReportingUrl(currentParamsTuples);
        cleanupWindowLoaction();
      } else if (currentHash) {
        baseUrl.pathname = breakoutPathName;
        baseUrl.hash = currentHash;
        iframeRef.current.contentWindow.location.href = baseUrl.toString();
      }
    }
  }, [
    queryParams,
    iframeRef.current?.contentWindow?.location.search,
    iframeRef.current?.contentWindow?.location.hash,
  ]);
};
