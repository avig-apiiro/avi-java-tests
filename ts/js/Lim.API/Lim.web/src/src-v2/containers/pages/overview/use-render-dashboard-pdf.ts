import { useCallback, useEffect, useState } from 'react';
import { css } from 'styled-components';
import { useInject } from '@src-v2/hooks';
import { sleep } from '@src-v2/utils/async-utils';

export const useRenderDashboardPdf = (titleText: string) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const { pdfService } = useInject();

  const handleDownloadPdf = useCallback(async () => {
    setIsDownloadingPdf(true);
    const rootDiv = document.querySelector('[data-pdf]').cloneNode(true) as HTMLElement;
    const title = document.createElement('h1');
    title.textContent = titleText;

    rootDiv.prepend(title);

    if (rootDiv) {
      await pdfService.htmlToPdf(rootDiv, dashboardPdfStyle as unknown as string);
    }

    setIsDownloadingPdf(false);
  }, [pdfService]);

  useEffect(() => {
    let isMounted = true;

    const updatePdfReady = async () => {
      if (isMounted) {
        while (isMounted) {
          if (document.querySelector('[data-loading]')) {
            await sleep(500);
            continue;
          }
          if (isMounted) {
            setIsPdfReady(true);
          }
          break;
        }
      }
    };

    void updatePdfReady();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isPdfReady, handleDownloadPdf, isDownloadingPdf };
};

const dashboardPdfStyle = css`
  width: 100px;

  [class*='CardTiles'] {
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    gap: 0;
  }

  [class*='CardTiles'] > [class*='Card--'] {
    transform: scale(0.85) translate(-40px);
    box-shadow: none;
    border: 1px solid #e2e2e9;
  }

  [class*='OverviewTile--'] {
    overflow: hidden;
    page-break-inside: avoid;
  }

  h1 {
    font-size: 20px;
    font-weight: 600;
    line-height: 7rem;
  }
`;
