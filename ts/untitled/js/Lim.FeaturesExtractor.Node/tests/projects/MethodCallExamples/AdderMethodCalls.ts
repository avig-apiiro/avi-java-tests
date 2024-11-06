import {Adder} from "./Adder";


export function myMethod(a: number, b: number) : number {
    const adder = new Adder(3);
    return adder.add(b);
}
