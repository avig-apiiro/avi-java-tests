import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {CallExpressionEntity} from "../../../src/models/entities/CallLikeEntities";
import {ModuleEntity} from "../../../src/models/entities/ModuleEntity";
import {SnippetType} from "../../../src/models/entities/SnippetEntity";
import {DataModelEntityViewFactory} from "../../../src/models/entityViews/DataModelEntityViewFactory";
import {DataModelEntityViewMongoose} from "../../../src/models/entityViews/DataModelEntityViewMongooseSchema";
import {DataModelEntityViewSequelizeDefine} from "../../../src/models/entityViews/DataModelEntityViewSequelize";
import {DataModelEntityViewTypeorm} from "../../../src/models/entityViews/DataModelEntityViewTypeorm";
import {
    createEntityView,
    entityPathPredicate,
    findCallExpressionByTextAndPath,
    findClassByName,
    findEntity,
    findModuleByName,
    getTestContext,
    runParserFlow
} from "../integrationTestUtils";
import {FunctionLikeEntity} from "../../../src/models/entities/FunctionLikeEntity";
import {
    DataModelEntityViewConstructorFunction
} from "../../../src/models/entityViews/DataModelEntityViewConstructorFunction";
import {ClassEntity} from "../../../src/models/entities/ClassEntity";
import {DataModelEntityViewClass} from "../../../src/models/entityViews/DataModelEntityViewClass";

chai.use(chaiArrays);

describe('Test creating data model entity views', () => {
    const testContext = getTestContext("DataModelEntityViews");

    before(async () => {
        await runParserFlow(testContext);
    });

    describe("Sequelize", () => {
        describe('Sequelize define', () => {
            it("isSequelizeDefine - true", () => {
                const sequelizeSnippetEntity = findCallExpressionByTextAndPath("sequelize.define", "sequelizeDefine.ts", testContext)!;
                const isSequelize = DataModelEntityViewSequelizeDefine.isSequelizeDefine(sequelizeSnippetEntity, new ModuleEntity(""));
                expect(isSequelize).to.be.true;
            });

            it("isSequelizeDefine - false", () => {
                const sequelizeSnippetEntity = findCallExpressionByTextAndPath("sequelize.notDefine", "sequelizeDefine.ts", testContext)!;
                const isSequelize = DataModelEntityViewSequelizeDefine.isSequelizeDefine(sequelizeSnippetEntity, new ModuleEntity(""));
                expect(isSequelize).to.be.false;
            });

            it("Test isSequelizeDefine getters", () => {
                const sequelizeSnippetEntity = findCallExpressionByTextAndPath("sequelize.define", "sequelizeDefine.ts", testContext)!;
                const entityView = new DataModelEntityViewSequelizeDefine(sequelizeSnippetEntity);
                expect(entityView.getDataModelName()).to.be.equal("User");
                expect(Array.from(entityView.getDataModelProperties().keys())).to.be.eql(["userId", "firstName", "someRandomThing"]);
            });
        });
    });

    describe("typeorm", () => {
        it("isTypeorm - false", () => {
            const classEntity = findClassByName("NotOrmClass", testContext)!;
            const moduleEntity = findModuleByName("typeormInheritance.ts", testContext)!;
            const isTypeorm = DataModelEntityViewTypeorm.isTypeorm(classEntity, moduleEntity);
            expect(isTypeorm).to.be.false;
        });

        it("isTypeorm - true", () => {
            const classEntity = findClassByName("Post", testContext)!;
            const moduleEntity = findModuleByName("typeormInheritance.ts", testContext)!;
            const isTypeorm = DataModelEntityViewTypeorm.isTypeorm(classEntity, moduleEntity);
            expect(isTypeorm).to.be.true;
        });
    });

    describe("Mongoose", () => {
        let userModelDefinitionEntity: CallExpressionEntity;
        let userModelReferenceEntity: CallExpressionEntity;

        before(() => {
            userModelDefinitionEntity = findEntity<CallExpressionEntity>(
                testContext.parserState.callExpressionEntitiesByKey.values(),
                SnippetType.CallExpression,
                entityPathPredicate('mongoose/UserModel.ts'),
                entity => entity.callExpressionFullText === 'mongoose.model',
                entity => entity.callExpressionArguments.length >= 2)!;

            userModelReferenceEntity = findEntity<CallExpressionEntity>(
                testContext.parserState.callExpressionEntitiesByKey.values(),
                SnippetType.CallExpression,
                entityPathPredicate('mongoose/UserModel.ts'),
                entity => entity.callExpressionFullText === 'mongoose.model',
                entity => entity.callExpressionArguments.length === 1)!;

            expect(userModelDefinitionEntity).to.not.be.undefined;
            expect(userModelReferenceEntity).to.not.be.undefined;
        });

        it("isMongoose detects mongoose model definition", () => {
            const isMongoose = DataModelEntityViewMongoose.isMongooseModel(userModelDefinitionEntity);
            expect(isMongoose).to.be.true;
        });

        it("isMongoose doesn't detect mongoose model reference", () => {
            const isMongoose = DataModelEntityViewMongoose.isMongooseModel(userModelReferenceEntity);
            expect(isMongoose).to.be.false;
        });

        it("Model name correctly extracted", () => {
            const mongooseView = createEntityView(userModelDefinitionEntity, testContext, DataModelEntityViewFactory)!;
            expect(mongooseView.getDataModelName()).to.equal("User");
        });

        it("Schema paths are correctly extracted", () => {
            const mongooseView = createEntityView(userModelDefinitionEntity, testContext, DataModelEntityViewFactory)!;
            const properties = Object.fromEntries(mongooseView.getDataModelProperties().entries());
            const expectedProperties = {
                "_id": "ObjectId",
                "firstName": "String",
                "middleName": "String",
                "lastName": "String",
                "phoneNumbers": "String",
                "primaryAddress.streetNumber": "String",
                "primaryAddress.city": "String",
                "children.name": "String",
                "children.age": "Number",
                "stuff": "Mixed"
            };
            expect(properties).to.eql(expectedProperties);
        });

        it("Imported schemas in models are detected", () => {
            const namedImportModelEntity = findCallExpressionByTextAndPath(
                "mongoose.model",
                "mongoose/BlogModels.ts",
                testContext,
                entity => entity.callExpressionArguments[1].literalValue == "PostSchema")!;

            const namespaceImportModelEntity = findCallExpressionByTextAndPath(
                "mongoose.model",
                "mongoose/BlogModels.ts",
                testContext,
                entity => entity.callExpressionArguments[1].literalValue == "schemas.PostSchema")!;

            const defaultImportModelEntity = findCallExpressionByTextAndPath(
                "mongoose.model",
                "mongoose/BlogModels.ts",
                testContext,
                entity => entity.callExpressionArguments[1].literalValue == "PostSchemaDefault")!;

            for (const entity of [namedImportModelEntity, namespaceImportModelEntity, defaultImportModelEntity]) {
                const mongooseView = createEntityView(entity, testContext, DataModelEntityViewFactory)!;
                expect(mongooseView).to.not.be.undefined;
                expect(mongooseView.getDataModelProperties().get("title")).to.equal("String");
            }
        });
    });

    describe("Constructor function", () => {
        it("Detects old-style constructor function", () => {
            const functionEntity = findEntity<FunctionLikeEntity>(
                testContext.parserState.functionLikeEntitiesByKey.values(),
                SnippetType.FunctionDeclaration,
                _ => _.functionName === "UserFunction"
            )!;

            expect(functionEntity).to.not.be.undefined;
            expect(DataModelEntityViewConstructorFunction.isConstructorFunction(functionEntity)).to.be.true;

            const view = new DataModelEntityViewConstructorFunction(functionEntity);
            expect(view.getDataModelName()).to.equal("UserFunction");
            expect(view.getDataModelProperties()).to.deep.equal(new Map([
                ["firstName", "any"],
                ["lastName", "any"]
            ]));
            expect(view.isConfirmedDataModel).to.be.false;
        });

        it("Doesn't detect plain old functions", () => {
            const functionEntity = findEntity<FunctionLikeEntity>(
                testContext.parserState.functionLikeEntitiesByKey.values(),
                SnippetType.FunctionDeclaration,
                _ => _.functionName === "PlainOldFunction"
            )!;

            expect(functionEntity).to.not.be.undefined;
            expect(DataModelEntityViewConstructorFunction.isConstructorFunction(functionEntity)).to.be.false;
        })

        it("Doesn't detect new-style constructors", () => {
            const classEntity = findClassByName("UserClass", testContext)!;
            const functionEntity = findEntity<FunctionLikeEntity>(
                testContext.parserState.functionLikeEntitiesByKey.values(),
                SnippetType.FunctionDeclaration,
                _ => _.isConstructor && _.classKey == classEntity.key.keyString()
            )!;

            expect(functionEntity).to.not.be.undefined;
            expect(DataModelEntityViewConstructorFunction.isConstructorFunction(functionEntity)).to.be.false;
        });

        it("Doesn't detect mutator method", () => {
            const functionEntity = findEntity<FunctionLikeEntity>(
                testContext.parserState.functionLikeEntitiesByKey.values(),
                SnippetType.FunctionDeclaration,
                _ => _.functionName == "mutatorMethod"
            )!;

            expect(functionEntity).to.not.be.undefined;
            expect(DataModelEntityViewConstructorFunction.isConstructorFunction(functionEntity)).to.be.false;
        })
    })
    describe("Classes", () => {
        it("Detects class with self-assignments", () => {
            const classEntity = findClassByName("UserClass", testContext)!;

            expect(classEntity).to.not.be.undefined;
            expect(DataModelEntityViewClass.isClassDataModel(classEntity)).to.be.true;

            const view = new DataModelEntityViewClass(classEntity);
            expect(view.getDataModelName()).to.equal("UserClass");
            expect(view.getDataModelProperties()).to.deep.equal(new Map([
                ["firstName", "any"],
                ["lastName", "any"]
            ]));
            expect(view.isConfirmedDataModel).to.be.false;
        });

        it("Detects class with constructor properties", () => {
            const classEntity = findClassByName("UserClassWithConstructorProperties", testContext)!;

            expect(classEntity).to.not.be.undefined;
            expect(DataModelEntityViewClass.isClassDataModel(classEntity)).to.be.true;

            const view = new DataModelEntityViewClass(classEntity);
            expect(view.getDataModelName()).to.equal("UserClassWithConstructorProperties");
            expect(view.getDataModelProperties()).to.deep.equal(new Map([
                ["firstName", "string"],
                ["lastName", "string"]
            ]));
            expect(view.isConfirmedDataModel).to.be.false;
        });

        it("Detects class with property declarations", () => {
            const classEntity = findClassByName("UserClassWithPropertyDeclarations", testContext)!;

            expect(classEntity).to.not.be.undefined;
            expect(DataModelEntityViewClass.isClassDataModel(classEntity)).to.be.true;

            const view = new DataModelEntityViewClass(classEntity);
            expect(view.getDataModelName()).to.equal("UserClassWithPropertyDeclarations");
            expect(view.getDataModelProperties()).to.deep.equal(new Map([
                ["firstName", "string"],
                ["lastName", "string"]
            ]));
            expect(view.isConfirmedDataModel).to.be.false;
        });

        it("Detects class with property getters", () => {
            const classEntity = findClassByName("UserClassWithGetters", testContext)!;

            expect(classEntity).to.not.be.undefined;
            expect(DataModelEntityViewClass.isClassDataModel(classEntity)).to.be.true;

            const view = new DataModelEntityViewClass(classEntity);
            expect(view.getDataModelName()).to.equal("UserClassWithGetters");
            expect(view.getDataModelProperties()).to.deep.equal(new Map([
                ["fullName", "string"]
            ]));
            expect(view.isConfirmedDataModel).to.be.false;
        });


    });
});
