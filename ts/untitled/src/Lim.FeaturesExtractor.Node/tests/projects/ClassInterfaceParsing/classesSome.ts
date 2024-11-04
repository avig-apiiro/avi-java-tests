import baseClasses, {BaseExplicitExport} from "./baseClassess";
import * as classesOther from "./classesOther";
import {Controller, JsonController} from "routing-controllers";

export abstract class BaseClassSome {
    abstract someFunction(): string;
}

interface SomeBaseInterface {
    somethingBasic: string
}

interface SomeInterface extends SomeBaseInterface {
    something: string
}

export class ClassExtendThisFile extends BaseClassSome {
    someFunction(): string {
        return "";
    }
}

export class ClassExtendOtherFile extends classesOther.BaseClassOther {
    otherFunction(): string {
        return "";
    }
}

export class ClassImplementsThisFile implements SomeInterface {
    something: string = "";
    somethingBasic: string;

    doSomething(): string {
        return "";
    }
}

export class ClassImplementsOtherFile implements classesOther.OtherInterface {
    other: string = "";
    otherNumber: number;
    otherBoolean: boolean;

    doSomething(): string {
        return "";
    }

    foo(number, string): string {
        return "";
    }
}

export class ClassExtendsImplementsThisFile extends BaseClassSome implements SomeInterface {
    something: string = "";
    somethingBasic: string;

    constructor(public input: string) {
        super();
    }

    someFunction(): string {
        return "";
    }
}

export class ExtendDefaultBase extends baseClasses {
    extendBaseClasses: string;
}

export class ExtendBaseExplicitExport extends BaseExplicitExport {
    extendBaseExplicitExport;
    string;
}


@JsonController()
export class RoutingControllerNoPath extends baseClasses {
}

@Controller("/dummyroute")
export class RoutingControllerWithPath extends baseClasses {
}