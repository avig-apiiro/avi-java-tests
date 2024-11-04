export function mapBy<T, K>(items: Iterable<T>, keyFunc: (item: T) => K): Map<K, T>;
export function mapBy<T, K, V>(items: Iterable<T>, keyFunc: (item: T) => K, valueFunc: (item: T) => V): Map<K, V>;
export function mapBy<T, K>(items: Iterable<T>, keyFunc: (item: T) => K, valueFunc: (item: T) => unknown = item => item): Map<K, unknown> {
    return buildMap(
        items,
        keyFunc,
        valueFunc,
        (item, value) => value);
}

export function groupBy<T, K>(items: Iterable<T>, keyFunc: (item: T) => K): Map<K, T[]>;
export function groupBy<T, K, V>(items: Iterable<T>, keyFunc: (item: T) => K, valueFunc: (item: T) => V): Map<K, V[]>;
export function groupBy<T, K>(items: Iterable<T>, keyFunc: (item: T) => K, valueFunc: (item: T) => unknown = item => item): Map<K, unknown[]> {
    return buildMap(
        items,
        keyFunc,
        (item) => [valueFunc(item)],
        (item, group) => {
            group.push(valueFunc((item)));
            return group;
        });
}

function buildMap<T, K, V>(items: Iterable<T>, keyFunc: (item: T) => K, newKeyFunc: (item: T) => V, repeatKeyFunc: (item: T, value: V) => V): Map<K, V> {
    const map = new Map<K, V>();
    for (const item of items) {
        const key = keyFunc(item);
        const existingValue = map.get(key);
        if (existingValue === undefined) {
            map.set(key, newKeyFunc(item));
        } else {
            const newValue = repeatKeyFunc(item, existingValue);
            if (newValue !== existingValue) {
                map.set(key, newValue);
            }
        }
    }
    return map;
}
