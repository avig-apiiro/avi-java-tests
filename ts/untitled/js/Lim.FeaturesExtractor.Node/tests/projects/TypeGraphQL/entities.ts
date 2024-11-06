import {ObjectType, InterfaceType, Field, Int, Float, ID} from "type-graphql";
import tgql from "type-graphql";

@ObjectType()
export class ObjectWithPrimitiveFields {
    @Field()
    public inferredStringField: string;

    @Field(() => String)
    public conciseTypedStringField: string;

    @Field(type => String)
    public verboseTypedStringField: string;

    @Field(type => Int)
    public intField: string;

    @Field()
    public inferredFloatField: number;

    @Field(type => Float)
    public typedFloatField: number;

    @Field(type => [[NamedObject]])
    public nestedArrayField?: NamedObject[][]

    @Field()
    public computedField(): number {
        return this.inferredFloatField + this.typedFloatField;
    }

    @Field(() => Int)
    public get getterField(): number {
        return 7;
    }

    public nonField: string
}

@InterfaceType()
export class SomeInterface {
    @Field()
    public interfaceField: ID
}

@InterfaceType()
export class OtherInterface {
    @Field()
    public otherInterfaceField: ID
}

@ObjectType("ExplicitlyNamedObjectType", {implements: SomeInterface})
export class NamedObject {
    @Field(type => Int, {nullable: true, name: "explicitlyNamedField"})
    public field: number;
}

@tgql.ObjectType()
export class QualifiedDecoratorObject {
    @tgql.Field(type => [tgql.ID])
    public ids: ID[]
}

