import _ from 'lodash';

export function isEmptyDeep(value: any): boolean {
  if (!value) {
    return true;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'function') {
    return false;
  }

  const objectValues = _.isArray(value) ? value : Object.values(value);
  return objectValues.length === 0 || objectValues.every(isEmptyDeep);
}
