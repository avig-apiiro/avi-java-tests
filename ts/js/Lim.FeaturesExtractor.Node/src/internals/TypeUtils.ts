export function isDefined<T>(value: T | undefined): value is T {
    return value != undefined;
}

export function instanceOfChecker<T>(TClass: new (...args: any[]) => T) {
    return function isOfType(value: any): value is T {
        return value instanceof TClass;
    }
}