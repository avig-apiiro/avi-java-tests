export abstract class BaseClassOther {
    abstract otherFunction(): string;
}

export interface IBar {
    foo: () => number;
}

export interface IADUser {
    member: number,
    notMember: (number) => string;
    anotherMember: string;
    anotherNotMember: (para1: string, para2: string) => void;
}

export interface WithAnotherInterface {
    user: IADUser,
    notUser: string,
    method: () => IADUser
}

export interface OtherInterface {
    other: string;
    otherNumber: number;
    otherBoolean: boolean;

    foo(number, string): string;
}
