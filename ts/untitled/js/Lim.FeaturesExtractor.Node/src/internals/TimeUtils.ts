export function hrtimeToString([seconds, nanos]: [number, number]): string {
    return `${hrtimeToNumber([seconds, nanos]).toPrecision(3)}s`;
}

export function hrtimeToNumber([seconds, nanos]: [number, number]): number {
    return seconds + (nanos / 1e9);
}
