import {ClassDeclaration, createWrappedNode} from "ts-morph";
import ts, {ModifierFlags} from "typescript";
import {ClassEntity} from "../../models/entities/ClassEntity";
import {EntityKey} from "../../models/entities/EntityKey";
import {Context} from "../../types/Context";
import {
    getNodeEntityKeyByContext,
    getNodeTypeString,
    hasAnyFlag,
    hasDeclarationModifier
} from "./utils/nodeCommonUtils";
import {followNodeToDeclaration} from "./utils/nodeFollowUtils";
import {VisitorBase} from "./VisitorBase";

export class ClassVisitor extends VisitorBase<ts.ClassDeclaration> {
    shouldVisit = ts.isClassDeclaration;

    constructor(typeChecker: ts.TypeChecker, parserContext: Context) {
        super(typeChecker, parserContext, __filename);
    }

    getExtendedClassKey(heritageNode: ts.HeritageClause, entityKey: EntityKey): EntityKey | undefined {
        try {
            const baseClassDeclaration = followNodeToDeclaration(heritageNode.types[0].expression, this.typeChecker);
            if (ts.isClassDeclaration(baseClassDeclaration)) {
                return getNodeEntityKeyByContext(baseClassDeclaration, this.parserContext);
            }
        } catch (e) {
            this.logger.silly(`Failed to get extended class key for class ${entityKey.keyString()}\n${e.stack}`);
            return undefined;
        }
    }

    protected visitBeforeChildrenImpl(node: ts.ClassDeclaration, entityKey: EntityKey): void {
        this.parserContext.parserState.classStack.push(entityKey);

        const wrappedClassNode = createWrappedNode(node, {typeChecker: this.typeChecker}) as ClassDeclaration;

        const isDefault = hasDeclarationModifier(node, ts.ModifierFlags.Default);
        const isExported = hasDeclarationModifier(node, ts.ModifierFlags.Export);

        const className = wrappedClassNode.getName() ?? "";
        if (!className && !(isDefault && isExported)) {
            this.logger.info(`[${this.parserContext.correlationId}] Unexpected class with empty name (isDefault=${isDefault}, isExported=${isExported})`);
        }

        const classEntity = new ClassEntity(entityKey, className);
        classEntity.isDefault = isDefault;
        classEntity.isExported = isExported;
        classEntity.isAbstract = hasDeclarationModifier(node, ts.ModifierFlags.Abstract);

        node.heritageClauses?.forEach(heritageNode => {
            const heritageName = heritageNode.types[0].expression.getText();

            if (heritageNode.token === ts.SyntaxKind.ExtendsKeyword) {
                classEntity.extendedClass = heritageName;
                classEntity.extendedClassKey = this.getExtendedClassKey(heritageNode, entityKey);
            } else if (heritageNode.token === ts.SyntaxKind.ImplementsKeyword) {
                classEntity.implementedInterface = heritageName;
            }
        });

        this.collectProperties(node, classEntity);
        classEntity.methodCount = node.members.filter(ts.isMethodDeclaration).length;

        this.parserState.setClassEntity(classEntity);
    }

    private collectProperties(classNode: ts.ClassDeclaration, classEntity: ClassEntity) {
        classNode.members.forEach(member => {
            if (hasAnyFlag(ts.getCombinedModifierFlags(member), ModifierFlags.Static | ModifierFlags.Private | ModifierFlags.Protected)) {
                return;
            }

            // Property declarations
            if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)) {
                classEntity.addProperty(member.name.text, getNodeTypeString(member, this.typeChecker, this.parserContext));
            }

            // Getters
            if (ts.isGetAccessor(member) && ts.isIdentifier(member.name)) {
                classEntity.addProperty(member.name.text, getNodeTypeString(member, this.typeChecker, this.parserContext));
            }

            // Constructor parameter-properties
            // (https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties)
            if (ts.isConstructorDeclaration(member)) {
                member.parameters.forEach(parameter => {
                    if (
                        ts.isIdentifier(parameter.name) &&
                        parameter.modifiers?.some(modifier => PublicParameterPropertyKeywords.has(modifier.kind))
                    ) {
                        classEntity.addProperty(parameter.name.text, getNodeTypeString(parameter, this.typeChecker, this.parserContext))
                    }
                })
            }
        });
    }

    protected visitAfterChildrenImpl(node: ts.ClassDeclaration, entityKey: EntityKey): void {
        this.parserContext.parserState.classStack.pop();
    }
}

const PublicParameterPropertyKeywords = new Set([
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);
