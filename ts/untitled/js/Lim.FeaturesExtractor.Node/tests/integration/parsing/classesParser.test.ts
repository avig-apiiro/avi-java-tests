import chai, {expect} from "chai";
import chaiArrays from "chai-arrays";
import 'mocha';
import {ClassEntity} from "../../../src/models/entities/ClassEntity";
import {findClassByName, findInterfaceByName, getTestContext, runParserFlow} from "../integrationTestUtils";

chai.use(chaiArrays);

describe('Test parser for classes and interfaces', () => {
    const testContext = getTestContext("ClassInterfaceParsing");

    before(async () => {
        await runParserFlow(testContext);
    });

    describe("Class entities", () => {
        it("Identified implemented class name (interface defined in another file)", () => {
            const classEntity: ClassEntity = findClassByName("ClassImplementsOtherFile", testContext)!;
            expect(classEntity).to.not.be.undefined;
            expect(classEntity.implementedInterface).to.equal("classesOther.OtherInterface");
        });

        it("Identified extends class name (class defined in same file)", () => {
            const classEntity: ClassEntity = findClassByName("ClassExtendThisFile", testContext)!;
            expect(classEntity).to.not.be.undefined;
            expect(classEntity.extendedClass).to.equal("BaseClassSome");
        });

        it("Identified implemented and extends class name", () => {
            const classEntity: ClassEntity = findClassByName("ClassExtendsImplementsThisFile", testContext)!;
            expect(classEntity).to.not.be.undefined;
            expect(classEntity.extendedClass).to.equal("BaseClassSome");
            expect(classEntity.implementedInterface).to.equal("SomeInterface");
            expect(classEntity.propertyNameToType).to.include.all.keys("something", "somethingBasic", "input");
        });

        it("Identify extended class key and properties", () => {
            const classEntity: ClassEntity = findClassByName("ExtendBaseExplicitExport", testContext)!;
            expect(classEntity).to.not.be.undefined;
            expect(classEntity.extendedClass).to.equal("BaseExplicitExport");
            expect(classEntity.extendedClassKey).to.not.be.undefined;
            expect(classEntity.getClassPropertyNameToType()).to.include.all.keys("extendBaseExplicitExport", "baseExplicitExport");
        });

        it("Identify 'routing-controllers' class without path", () => {
            const classEntity: ClassEntity = findClassByName("RoutingControllerNoPath", testContext)!;
            expect(classEntity).to.not.be.undefined;
            expect(classEntity.getRoutingControllersDefinedRoute()).to.equal("");
        });

        it("Identify 'routing-controllers' class with path", () => {
            const classEntity: ClassEntity = findClassByName("RoutingControllerWithPath", testContext)!;
            expect(classEntity).to.not.be.undefined;
            expect(classEntity.getRoutingControllersDefinedRoute()).to.equal("/dummyroute");
        });

        it("Identify class in file that contains templated code", () => {
            const classBeforeEntity: ClassEntity = findClassByName("NotTemplatedBefore", testContext)!;
            expect(classBeforeEntity).to.not.be.undefined;
            const classAfterEntity: ClassEntity = findClassByName("NotTemplatedAfter", testContext)!;
            expect(classAfterEntity).to.not.be.undefined;
            const templatedClassEntity: ClassEntity = findClassByName("Templated", testContext)!;
            expect(templatedClassEntity).to.be.undefined;
        });
    });

    describe("Interface entities", () => {
        it("Interface name and properties", () => {
            const interfaceEntity = findInterfaceByName("SomeBaseInterface", testContext);
            expect(interfaceEntity).to.not.be.undefined;
            expect(interfaceEntity!.propertyNameToType).to.include.keys("somethingBasic");
        });

        it("Interface with method as interface member", () => {
           const interfaceEntity = findInterfaceByName("IBar", testContext);
            expect(interfaceEntity).to.not.be.undefined;
            expect(interfaceEntity!.propertyNameToType).to.not.include.keys("foo");
            expect(interfaceEntity!.methodCount).to.equal(1);
        });

        it("Interface with multiple methods and regular members", () => {
            const interfaceEntity = findInterfaceByName("IADUser", testContext);
            expect(interfaceEntity).to.not.be.undefined;
            expect(interfaceEntity!.propertyNameToType).to.not.include.keys("notMember", "anotherNotMember");
            expect(interfaceEntity!.propertyNameToType).to.include.keys("member", "anotherMember");
            expect(interfaceEntity!.methodCount).to.equal(2);
            expect(interfaceEntity!.propertyNameToType.size).to.equal(2);
        });

        it("Interface with interface, method and regular members", () => {
            const interfaceEntity = findInterfaceByName("WithAnotherInterface", testContext);
            expect(interfaceEntity).to.not.be.undefined;
            expect(interfaceEntity!.propertyNameToType).to.not.include.keys("method");
            expect(interfaceEntity!.propertyNameToType).to.include.keys("user", "notUser");
            expect(interfaceEntity!.methodCount).to.equal(1);
            expect(interfaceEntity!.propertyNameToType.size).to.equal(2);
        });

        it("Interface method count", () => {
            const interfaceEntity = findInterfaceByName("OtherInterface", testContext)!;
            expect(interfaceEntity).to.not.be.undefined;
            expect(interfaceEntity.methodCount).to.equal(1);
        });
    });
});


