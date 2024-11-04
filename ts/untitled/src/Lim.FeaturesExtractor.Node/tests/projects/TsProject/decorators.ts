function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        hello = "override";
    };
}

@classDecorator
class DecoratedClass {
    hello: string;

    constructor(m: string) {
        this.hello = m;
    }
}
