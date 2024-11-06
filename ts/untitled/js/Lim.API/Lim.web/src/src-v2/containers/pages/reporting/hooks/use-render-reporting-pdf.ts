import { RefObject, useState } from 'react';
import { css } from 'styled-components';
import {
  backPage,
  frontPageHtml,
  pdfLogo,
} from '@src-v2/containers/pages/reporting/assets/static-html-strings-for-pdf';
import { useInject } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

export const useRenderReportingPdf = (
  iframeRef: RefObject<HTMLIFrameElement>,
  isCustomReport?: boolean
) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { pdfService, session } = useInject();

  const handleDownloadPdf = (reportName: string, description: string) => {
    setIsDownloadingPdf(true);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const iframeDocument = iframeRef.current.contentWindow.document;
      const rootDiv = iframeDocument.querySelector(`main`)?.cloneNode(true);
      const containerWidth = parseFloat(
        getComputedStyle(iframeRef.current).width.replace('px', '')
      );
      if (rootDiv) {
        const frontPage = frontPageHtml(reportName, description, session.data.environmentName);
        adjustReportForPrint(rootDiv as HTMLElement, isCustomReport, containerWidth);
        const title = `Apiiro - ${reportName} - ${new Date()}`;
        pdfService.htmlToPdf(
          rootDiv as HTMLElement,
          pdfStyles as unknown as string,
          title,
          frontPage
        );
      }
      setIsDownloadingPdf(false);
    }
  };

  return { handleDownloadPdf, isDownloadingPdf, iframeRef };
};

const pdfStyles = css`
  * {
    page-break-inside: avoid !important;
  }

  body {
    transform: translate(-10%, -15%) scale(0.75);
    width: 900px;
  }

  [data-testid='fixed-width-filters'] {
    display: none;
  }

  h2 {
    height: 40px;
  }

  [data-testid='legend-caption'] {
    line-height: 3;
  }

  [data-testid='legend-item'] * {
    line-height: 3;
  }

  [data-testid='legend-item'] div {
    display: flex;
    align-items: center !important;
  }

  .shrink-below-content-size {
    width: fit-content;
  }

  th > button {
    height: 40px;
    line-height: 3;
  }

  .DashCard {
    page-break-inside: avoid !important;
  }

  [class*='Heading1'] {
    font-size: 22px;
    margin-top: 48px;
  }

  [class*='SubHeading4'] {
    font-size: 14px;
  }
`;

function adjustReportForPrint(
  rootDiv: HTMLElement,
  isCustomReport: boolean,
  containerWidth: number
) {
  const titleElement = document.querySelector('h1').cloneNode(true) as HTMLElement;
  const logoContainer = document.createElement('div');
  const pdfPageWidth = 1400;
  const bottomMargin = 500;

  logoContainer.style.marginBottom = '20px';
  logoContainer.innerHTML = pdfLogo;
  titleElement.prepend(logoContainer);
  rootDiv.prepend(titleElement);

  const cards = rootDiv.querySelectorAll('.DashCard');
  let lastCardBottom = 0;
  let lastCard: HTMLElement | undefined;

  const scaleRatio = pdfPageWidth / containerWidth;

  cards.forEach((card: HTMLElement) => {
    normalizeCardResolution(card, scaleRatio);

    const transformMatch = card.style.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);

    if (transformMatch) {
      const [currentX, currentYValue] = [transformMatch[1], parseFloat(transformMatch[2])];
      const newY = `${currentYValue + 20 * Math.floor(currentYValue / 50 + 1)}px`;
      card.style.transform = `translate(${currentX}, ${newY})`;
      const cardBottom = currentYValue + card.offsetHeight;

      if (cardBottom > lastCardBottom) {
        lastCardBottom = cardBottom;
        lastCard = card;
      }
    }
  });

  if (!isCustomReport && lastCard && lastCard.parentElement) {
    const backpageContainer = document.createElement('div');
    backpageContainer.innerHTML = backPage(scaleRatio * (lastCardBottom + bottomMargin));
    lastCard.parentElement.appendChild(backpageContainer);
  }
}

function normalizeCardResolution(card: StubAny, widthRatio: number) {
  card.style.scale = widthRatio;
  card.style.transformOrigin = 'top left';
  card.style.height = `calc(${card.style.height} + 40px)`;
}
