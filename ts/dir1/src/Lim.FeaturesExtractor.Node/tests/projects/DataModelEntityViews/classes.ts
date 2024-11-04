class UserClassWithConstructorProperties {
    constructor(public firstName: string, public lastName: string) {
    }
}

class UserClassWithPropertyDeclarations {
    firstName: string
    lastName: string

    constructor(fullName: string) {
        this.assignName(fullName);
    }

    private assignName(fullName: string) {
        [this.firstName, this.lastName] = fullName.split(" ", 1);
    }
}

class UserClassWithGetters {
    constructor(private firstName: string, private lastName: string) {
    }

    public get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}