type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export const entries = <T extends object>(obj: T) => Object.entries(obj ?? {}) as Entries<T>;

export function isTypeOf<T>(objectOfType: any, propertyToCheckFor: keyof T): objectOfType is T {
  return propertyToCheckFor in objectOfType;
}
