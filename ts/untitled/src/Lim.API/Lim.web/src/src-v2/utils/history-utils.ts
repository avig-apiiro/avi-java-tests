import _ from 'lodash';
import _qs, { IParseOptions, IStringifyOptions } from 'qs';

export function makeUrl(pathname: string | URL, query: any): string {
  const queryString = _.isObject(query) ? qs.stringify(query) : query;
  return (queryString ? `${pathname}?${queryString}` : pathname).toString();
}

export const qs = {
  stringify: (object: {}, options?: IStringifyOptions) =>
    _qs.stringify(object, { skipNulls: true, ...options }),
  parse: (string: string, options?: IParseOptions) =>
    _qs.parse(string, { ignoreQueryPrefix: true, arrayLimit: 200, ...options }),
};
