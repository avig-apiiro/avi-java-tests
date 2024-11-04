import { MouseEvent } from 'react';

export const downloadFile = (filename: string, content: any, type = 'octet/stream') => {
  const element = document.createElement('a');
  const blob = new Blob([].concat(content), { type });
  const url = URL.createObjectURL(blob);
  document.body.appendChild(element);
  element.download = filename;
  element.href = url;
  element.click();
  setTimeout(() => {
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  }, 0);
};

export function preventDefault(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

export function stopPropagation(event: MouseEvent<HTMLElement>) {
  event.stopPropagation();
}

export function dataAttr(
  condition: boolean,
  value: string | number = '',
  elseValue: string | number = null
) {
  return condition ? value : elseValue;
}
