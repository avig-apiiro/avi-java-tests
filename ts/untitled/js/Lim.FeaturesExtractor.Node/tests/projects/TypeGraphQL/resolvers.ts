import {Resolver, FieldResolver, Query, Mutation, Root} from "type-graphql";
import {NamedObject, ObjectWithPrimitiveFields} from "./entities";

@Resolver()
export class TopLevelResolver {
    items: NamedObject[];

    @Query()
    public simpleQuery(): NamedObject {
        return this.items[0];
    }

    @Query(type => [NamedObject])
    public async asyncTypedQuery() {
        return this.items;
    }

    @Query(() => [NamedObject])
    public syncTypedQuery() {
        return this.items;
    }

    @Query(type => [NamedObject], { name: "getObjects"})
    public namedQuery() {
        return this.items;
    }

    @Mutation()
    public createObject(): boolean {
        return false;
    }
}

@Resolver(of => ObjectWithPrimitiveFields)
export class TypeResolver {
    @FieldResolver(type => [NamedObject])
    public nestedArrayField(@Root() parent: ObjectWithPrimitiveFields) {
        return [];
    }

    @Query()
    public queryOnTypeResolver(): ObjectWithPrimitiveFields {
        return new ObjectWithPrimitiveFields();
    }
}
