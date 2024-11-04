export function suspendPromise<T>(promise: Promise<T>): Promise<T> & { read: () => T } {
  let status = 'pending';
  let result: T | Error;

  const suspender = promise.then(
    res => {
      status = 'fulfilled';
      result = res;
    },
    (err: Error) => {
      status = 'rejected';
      result = err;
    }
  );

  return Object.assign(promise, {
    read() {
      switch (status) {
        case 'pending':
          throw suspender;
        case 'rejected':
          throw result;
        case 'fulfilled':
          return result as T;
        // no default
      }
    },
  });
}
