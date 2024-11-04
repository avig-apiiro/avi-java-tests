export abstract class BaseClassOther {
    abstract otherFunction(): string;
}

export interface OtherInterface {
    other: string;
    otherNumber: number;
    otherBoolean: boolean;

    foo(number, string): string;
}
