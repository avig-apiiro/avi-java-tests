import { action, observable } from 'mobx';
import { StubAny } from '@src-v2/types/stub-any';
import { safeParse } from '@src-v2/utils/json-utils';
import { suspendPromise } from '@src-v2/utils/react-suspend';

type Listener = (...args: StubAny[]) => void;

export class AsyncCache {
  #cache = new WeakMap();
  #listeners = new Map();

  suspend<T>(
    asyncFunc: (...args: any) => Promise<T>,
    params?: StubAny,
    ttl = 1800,
    ...rest: StubAny[]
  ) {
    const cacheMap = this.#getCacheMap(asyncFunc);
    const cacheKey = JSON.stringify(params);
    if (!cacheMap.has(cacheKey) || cacheMap.get(cacheKey).until < Date.now()) {
      this.#callListeners(asyncFunc, params);
      cacheMap.set(cacheKey, {
        until: Date.now() + ttl * 1000,
        value: suspendPromise(asyncFunc(params, ...rest)),
      });
    }
    return cacheMap.get(cacheKey).value;
  }

  invalidate(asyncFunc: Function, params: StubAny) {
    if (this.#cache.has(asyncFunc)) {
      this.#callListeners(asyncFunc, params);
      const cacheKey = JSON.stringify(params);
      return this.#cache.get(asyncFunc).delete(cacheKey);
    }
    return false;
  }

  invalidateAll = action(
    function (asyncFunc: Function) {
      if (this.#cache.has(asyncFunc)) {
        for (const cacheKey of this.#cache.get(asyncFunc).keys()) {
          this.#callListeners(asyncFunc, safeParse(cacheKey));
          this.#cache.get(asyncFunc).delete(cacheKey);
        }
        this.#callListeners(asyncFunc);
      }
      return this.#cache.delete(asyncFunc);
    }.bind(this)
  );

  addListener(asyncFunc: Function, listener: Listener) {
    if (this.#listeners.has(asyncFunc)) {
      this.#listeners.get(asyncFunc).add(listener);
    } else {
      this.#listeners.set(asyncFunc, new Set([listener]));
    }
  }

  removeListener(asyncFunc: Function, listener: Listener) {
    return this.#listeners.get(asyncFunc)?.delete(listener) ?? false;
  }

  #callListeners(asyncFunc: Function, ...rest: StubAny[]) {
    this.#listeners.get(asyncFunc)?.forEach((listener: Listener) => listener(...rest));
  }

  #getCacheMap(asyncFunc: Function) {
    if (!this.#cache.has(asyncFunc)) {
      this.#cache.set(asyncFunc, observable.map({}, { deep: false }));
    }
    return this.#cache.get(asyncFunc);
  }
}
