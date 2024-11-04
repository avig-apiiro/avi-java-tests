import _ from 'lodash';

export function toRem(pixels: number | string, unitSuffix = true) {
  const { fontSize } = getDocumentStyle();
  const value = parseFloat(pixels?.toString()) / parseFloat(fontSize);
  return unitSuffix ? `${value}rem` : value;
}

export function fromRem(rem: string | number, unitSuffix = true) {
  const { fontSize } = getDocumentStyle();
  const value = parseFloat(rem.toString()) * parseFloat(fontSize);
  return unitSuffix ? `${value}px` : value;
}

export const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str?.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash * 31 + char) % 1000000007; // Use a large prime number as the modulus
  }
  return hash;
};

/**
 * Utility for conditionally joining classNames together
 * The function takes any number of arguments which can be a string or object
 * @returns {string}
 */
export function classNames(...args: (string | string[] | Record<string, boolean>)[]): string {
  const classes = [];

  for (const argument of args) {
    if (!argument) {
      continue;
    }

    if (typeof argument === 'string') {
      classes.push(argument);
    } else if (Array.isArray(argument)) {
      const innerClass = classNames(...argument);
      if (innerClass) {
        classes.push(innerClass);
      }
    } else if (typeof argument === 'object') {
      if (argument.toString !== Object.prototype.toString) {
        classes.push(argument.toString());
      } else {
        for (const key of Object.keys(argument)) {
          if (argument[key]) {
            classes.push(_.kebabCase(key));
          }
        }
      }
    }
  }

  return classes.join(' ');
}

function getDocumentStyle() {
  return getComputedStyle(document.documentElement);
}

const CachedCssVariables: Record<string, string> = {};

export function getCssVariable(variableName: string) {
  if (!CachedCssVariables[variableName]) {
    const docStyle = getComputedStyle(document.documentElement);
    CachedCssVariables[variableName] = docStyle.getPropertyValue(variableName);
  }

  return CachedCssVariables[variableName];
}
