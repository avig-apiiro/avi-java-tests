import { css } from 'styled-components';
import { Toaster } from '@src-v2/services/toaster';
import { StubAny } from '@src-v2/types/stub-any';

export class PdfService {
  private toaster;

  constructor({ toaster }: { toaster: Toaster }) {
    this.toaster = toaster;
  }

  htmlToPdf(rootDiv: HTMLElement, additionalCSS: StubAny, title = document.title, frontpage = '') {
    if (!rootDiv) {
      return '';
    }

    const clonedRootDiv = rootDiv.cloneNode(true) as HTMLElement;
    const pageStyles = this.extractCSS(rootDiv.ownerDocument, additionalCSS);
    const htmlToPrint = `<html><head><title>${title}</title><style>${printSettingsStyles}${pageStyles}</style></head><body>${frontpage}<div>${clonedRootDiv.innerHTML}</div></body></html>`;

    try {
      const blob = new Blob([htmlToPrint], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const printWindow = window.open(url, '_blank');

      if (printWindow) {
        printWindow.onload = () => this.initiatePrintProcess(printWindow, url);
      } else {
        throw new Error('Failed to open new window');
      }
    } catch (e) {
      this.toaster.error('Failed to create PDF');
      console.error(e);
    }
  }

  private initiatePrintProcess(printWindow: StubAny, url: string) {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      this.closePrintWindow(printWindow, url);
    }, 200);
  }

  private closePrintWindow(printWindow: StubAny, url: string) {
    printWindow.close();
    URL.revokeObjectURL(url);
  }

  private extractCSS(document: Document, additionalCSS: string): string {
    let cssText = '';
    const { styleSheets } = document;

    for (let i = 0; i < styleSheets.length; i++) {
      let rules;
      try {
        rules = styleSheets[i].cssRules;
      } catch {
        continue;
      }

      for (let j = 0; j < rules.length; j++) {
        cssText += `${rules[j].cssText}\n`;
      }
    }

    return cssText + additionalCSS;
  }
}

const printSettingsStyles = css`
  body {
    width: 210mm;
    height: 297mm;
  }

  body * {
    visibility: hidden;
  }

  @media print {
    body * {
      visibility: unset;
    }
  }
`;
