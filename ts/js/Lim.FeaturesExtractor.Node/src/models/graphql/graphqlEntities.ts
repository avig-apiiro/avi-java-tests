import {CodeReference} from "../CodeReference";
import {EntityKey} from "../entities/EntityKey";

// NOTE: These types should be JSON-compatible with their C# counterparts!

export enum GqlOperationType {
    Query = 1,
    Mutation,
    Subscription
}

export interface GqlTypeReferenceSource {
    getTypeReferences(): readonly GqlTypeReference[];
}

export abstract class GqlDeclaration {
    protected constructor(
        public readonly codeReference: CodeReference
    ) {}
}

export class GqlObjectType extends GqlDeclaration implements GqlTypeReferenceSource {
    constructor(
        public readonly entityKey: EntityKey,
        public readonly name: string,
        public readonly fields: GqlField[],
        public interfaces: GqlNamedTypeReference[]
    ) {
        super(CodeReference.fromEntityKey(entityKey));
    }

    getTypeReferences(): readonly GqlTypeReference[] {
        return [
            ...this.fields.map(_ => _.type),
            ...this.interfaces
        ]
    }

    toJSON() {
        return {
            codeReference: this.codeReference,
            name: this.name,
            fields: this.fields,
            interfaces: this.interfaces.length > 0 ? this.interfaces : undefined
        }
    }
}

export class GqlField extends GqlDeclaration {
    constructor(
        codeReference: CodeReference,
        public readonly name: string,
        public readonly type: GqlTypeReference,
        public resolverReference?: CodeReference
    ) {
        super(codeReference);
    }
}

export class GqlResolverClass extends GqlDeclaration implements  GqlTypeReferenceSource {
    constructor(
        public readonly entityKey: EntityKey,
        public readonly targetType: GqlTypeReference | undefined,
        public readonly resolvers: GqlResolverSnippet[]
    ) {
        super(CodeReference.fromEntityKey(entityKey));
    }

    getTypeReferences(): readonly GqlTypeReference[] {
        const typeReferences = this.resolvers.map(_ => _.type);
        if (this.targetType) {
            typeReferences.push(this.targetType);
        }
        return typeReferences;
    }

}

export class GqlResolverSnippet extends GqlDeclaration {
    constructor(
        codeReference: CodeReference,
        public readonly operationType: GqlOperationType | undefined,
        public readonly name: string,
        public readonly type: GqlTypeReference
    ) {
        super(codeReference);
    }
}

export abstract class GqlTypeReference {
    abstract toString(): string;
    abstract getEssentialType(): GqlNamedTypeReference;

    toJSON() {
        return this.toString();
    }
}

export class GqlNamedTypeReference extends GqlTypeReference {
    constructor(
        public readonly name: string
    ) {
        super();
    }

    public toString(): string {
        return this.name;
    }

    getEssentialType(): GqlNamedTypeReference {
        return this;
    }
}

export class GqlListTypeReference extends GqlTypeReference {
    constructor(
        public readonly elementType: GqlTypeReference
    ) {
        super();
    }

    toString(): string {
        return `[${this.elementType.toString()}]`;
    }

    getEssentialType(): GqlNamedTypeReference {
        return this.elementType.getEssentialType();
    }
}

export class GqlClassTypeReference extends GqlTypeReference {
    private _target: GqlNamedTypeReference | undefined;

    constructor(
        public readonly targetKey: EntityKey
    ) {
        super();
    }

    public isResolved(): boolean {
        return this._target != undefined;
    }

    public resolve(target: GqlNamedTypeReference) {
        this._target = target;
    }

    toString(): string {
        if (!this._target) {
            return `<${this.targetKey.keyString()}>`;
        }
        return this._target.toString();
    }

    getEssentialType(): GqlNamedTypeReference {
        if (!this._target) {
            throw new Error(`Unresolved type reference: ${this}`)
        }
        return this._target;
    }
}