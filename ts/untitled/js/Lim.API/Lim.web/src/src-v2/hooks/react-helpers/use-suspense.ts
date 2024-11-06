import { useInject } from '@src-v2/hooks/use-inject';
import { AsyncCache } from '@src-v2/services';
import { StubAny } from '@src-v2/types/stub-any';

type UnwrapPromiseArray<T> = {
  [K in keyof T]: T[K] extends { query: (args?: any) => Promise<infer O> }
    ? O
    : T[K] extends (args?: any) => Promise<infer P>
      ? P
      : T[K] extends readonly [(any?: StubAny) => Promise<infer Q>, any?]
        ? Q
        : T[K];
};

export function useSuspense<T, P>(asyncFunc: (args?: P) => Promise<T>, args?: P): T;
// eslint-disable-next-line no-redeclare
export function useSuspense<T extends ReadonlyArray<any>>(args: T): UnwrapPromiseArray<T>;
// eslint-disable-next-line no-redeclare
export function useSuspense(functionOrArray: unknown, params?: unknown) {
  const { asyncCache } = useInject();

  switch (typeof functionOrArray) {
    case 'function':
      return suspenseSingleRequest(asyncCache, functionOrArray, params);
    case 'object': {
      if (Array.isArray(functionOrArray)) {
        return suspenseMultiRequests(asyncCache, functionOrArray);
      }
      break;
    }
    default:
      break;
  }

  throw Error(`Argument of type ${typeof functionOrArray} is unsupported`);
}

function suspenseSingleRequest(asyncCache: AsyncCache, asyncFunc: StubAny, args: StubAny) {
  return asyncCache.suspend(asyncFunc, args).read();
}

function suspenseMultiRequests(
  asyncCache: AsyncCache,
  functions: (() => Promise<any>)[] | [func: () => Promise<any>, params: any, options?: any][]
) {
  return functions
    .map(functionOrRequest => {
      if (typeof functionOrRequest === 'function') {
        return asyncCache.suspend(functionOrRequest);
      }

      const [query, params, options] = functionOrRequest;
      return asyncCache.suspend(query, params, options?.ttl, options);
    })
    .map(suspended => suspended.read());
}
