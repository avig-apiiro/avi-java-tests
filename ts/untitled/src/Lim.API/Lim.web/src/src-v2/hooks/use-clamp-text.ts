import { MutableRefObject, useCallback, useLayoutEffect, useState } from 'react';
import { useResizeObserver } from '@src-v2/hooks/dom-events/use-resize-observer';
import { StubAny } from '@src-v2/types/stub-any';

type TextClampOptions = {
  ellipsis?: string;
  suffix?: string;
  separator?: string;
  lines?: number;
  elementSizeBoundToContent?: boolean;
};

export function useTextClamp(
  ref: MutableRefObject<HTMLElement>,
  textContent: string,
  options: TextClampOptions = {}
) {
  const { ellipsis, suffix, separator, lines, elementSizeBoundToContent } = options;
  const [clampedText, setClampedText] = useState(null);

  useLayoutEffect(
    () => setClampedText(clampTextByElement(ref.current, textContent, options)),
    [ref.current, textContent, ellipsis, suffix, separator, lines, elementSizeBoundToContent]
  );

  useResizeObserver(
    ref,
    useCallback(
      ({ target }: StubAny) => setClampedText(clampTextByElement(target, textContent, options)),
      [textContent, ellipsis, suffix, separator, lines, elementSizeBoundToContent]
    )
  );

  return [clampedText, clampedText !== textContent];
}

let FontMetricsCanvas: StubAny = null;

function clampTextByElement(
  element: HTMLElement,
  rawTextContent: string,
  {
    ellipsis = '\u2026',
    suffix = '',
    separator = '',
    lines = 1,
    elementSizeBoundToContent = true,
  } = {}
) {
  const textContent = rawTextContent ?? '';
  if (typeof textContent !== 'string' && typeof textContent !== 'number') {
    throw TypeError('clampTextByElement only support string textContent');
  }

  if (lines <= 1) {
    return fastClampTextByElement(element, textContent, {
      ellipsis,
      suffix,
      separator,
      lines,
      elementSizeBoundToContent,
    });
  }

  const originalText = element.textContent;
  element.textContent = textContent + suffix;

  if (!hasOverflow()) {
    return textContent;
  }

  const tokensArray = textContent.split(separator);

  let end = tokensArray.length;
  let distance = end;

  while (distance > 0) {
    distance = Math.floor(distance / 2);
    element.textContent = tokensArray.slice(0, end).join(separator) + ellipsis + suffix;
    end += hasOverflow() ? -distance : distance;
  }

  while (hasOverflow() && end > 0) {
    element.textContent = tokensArray.slice(0, --end).join(separator) + ellipsis + suffix;
  }

  const clampedText = element.textContent;
  element.textContent = originalText;
  return clampedText;

  function hasOverflow() {
    return lines > 1
      ? element.scrollHeight > element.offsetHeight
      : element.scrollWidth > element.offsetWidth;
  }
}

function fastClampTextByElement(
  element: HTMLElement,
  textContent: string,
  {
    ellipsis = '\u2026',
    suffix = '',
    separator = '',
    elementSizeBoundToContent = true,
  }: TextClampOptions = {}
) {
  if (FontMetricsCanvas === null) {
    FontMetricsCanvas = document.createElement('canvas');
  }

  if (elementSizeBoundToContent) {
    element.textContent = textContent + suffix;
  }

  const elementOffsetWidth = element.offsetWidth;
  if (!elementOffsetWidth) {
    return textContent;
  }

  const {
    font,
    fontSize: rawFontSize,
    fontWeight: rawFontWeight = '400',
  } = getComputedStyle(element);

  const fontSize = Number.parseInt(rawFontSize.replace('px', ''));
  const fontWeight = Number.parseInt(rawFontWeight.toString());
  const maxCharactersLength = elementOffsetWidth / ((fontSize / 2) * (fontWeight / 400 + 0.25));

  const canvasContext = FontMetricsCanvas.getContext('2d');
  canvasContext.font = font;

  // Bagout early if text clearly doesn't need clamping
  if (
    textContent.length <= maxCharactersLength ||
    estimateTextLength(textContent) <= elementOffsetWidth
  ) {
    return textContent;
  }

  const tokensArray = textContent.split(separator);
  const ellipsisAndSuffix = ellipsis + suffix;
  let start = 0;
  let end = tokensArray.length;
  let clampedText = '';

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const testText = tokensArray.slice(0, mid).join(separator) + ellipsisAndSuffix;
    if (estimateTextLength(testText) <= elementOffsetWidth) {
      clampedText = testText; // This fits, save it
      start = mid + 1; // Try to fit more
    } else {
      end = mid - 1; // Fit fewer tokens
    }
  }

  if (clampedText === '') {
    clampedText =
      ellipsis + suffix.slice(Math.max(1, suffix.length - maxCharactersLength), suffix.length);
  }

  if (elementSizeBoundToContent) {
    element.textContent = clampedText;
  }

  return clampedText;

  function estimateTextLength(clampedText: string) {
    return Math.round(canvasContext.measureText(clampedText).width);
  }
}
