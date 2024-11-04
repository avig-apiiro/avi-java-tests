export class Adder {
    private readonly a: number;

    constructor(a: number) {
        this.a = a;
    }

    public add(b: number): number {
        return this.a+b;
    }
}
