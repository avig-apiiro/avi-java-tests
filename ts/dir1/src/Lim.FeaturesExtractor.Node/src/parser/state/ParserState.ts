import _ from "lodash";
import {CallExpressionEntity, NewExpressionEntity} from "../../models/entities/CallLikeEntities";
import {ClassEntity} from "../../models/entities/ClassEntity";
import {EntityKey} from "../../models/entities/EntityKey";
import {FunctionLikeEntity} from "../../models/entities/FunctionLikeEntity";
import {InterfaceEntity} from "../../models/entities/InterfaceEntity";
import {ModuleEntity} from "../../models/entities/ModuleEntity";
import {SnippetEntity, SnippetType} from "../../models/entities/SnippetEntity";
import {EntityStack} from "../../types/EntityStack";
import {GqlDeclaration} from "../../models/graphql/graphqlEntities";

class ApiRemover {
    callsList: EntityKey[];
    notApisList: EntityKey[];
    noApiFlag: boolean;

    constructor() {
        this.noApiFlag = false;
        this.callsList = [];
        this.notApisList = [];
    }

    public isEndOfCallChain(entityKey: EntityKey): boolean {
        if (_.isEqual(entityKey, _.first(this.callsList))) {
            return true;
        }
        return false;
    }

    public setNoApiFlag(entityKey: EntityKey): void {
        if (_.isEmpty(this.callsList)) {
            return;
        }

        if (_.isEqual(entityKey, _.last(this.callsList))) {
            this.noApiFlag = true;
        }
    }

    public addCall(entityKey: EntityKey): void {
        if (this.noApiFlag) {
            this.notApisList.push(entityKey);
        }

        this.callsList.push(entityKey);
    }

    public reset(): void {
        this.noApiFlag = false;
        this.callsList.length = 0;
        this.notApisList.length = 0;
    }
}

export class ParserState {
    // Code Snippet Entities by key
    readonly callExpressionEntitiesByKey = new Map<string, CallExpressionEntity>();
    readonly newExpressionEntitiesByKey = new Map<string, NewExpressionEntity>();
    readonly functionLikeEntitiesByKey = new Map<string, FunctionLikeEntity>();
    readonly interfaceEntitiesByKey = new Map<string, InterfaceEntity>();
    readonly classEntitiesByKey = new Map<string, ClassEntity>();
    readonly moduleEntitiesByName = new Map<string, ModuleEntity>();

    readonly gqlDeclarations = new Array<GqlDeclaration>();

    // Helper "Cache"
    classStack = new EntityStack<EntityKey>();
    variableDeclarationStack = new EntityStack<string>();
    methodStack = new EntityStack<EntityKey>();

    innerApiDetector: ApiRemover = new ApiRemover();
    callExpressionStack = new EntityStack<EntityKey>();
    rootRoutePath: string | undefined;
    rootRoutePathDefinition: string | undefined;

    stringLiteralsBySymbol = new Map<string, string>();
    private readonly snippetEntityContainers: ReadonlyMap<string, SnippetEntity>[] = [
        this.callExpressionEntitiesByKey,
        this.newExpressionEntitiesByKey,
        this.functionLikeEntitiesByKey,
        this.interfaceEntitiesByKey,
        this.classEntitiesByKey
    ];

    getEntities(...snippetTypes: SnippetType[]): ReadonlyArray<SnippetEntity> {
        let entityFilter = (entity: SnippetEntity) => true;
        if (snippetTypes.length > 0) {
            const snippetTypesSet = new Set(snippetTypes);
            entityFilter = entity => snippetTypesSet.has(entity.snippetType);
        }

        return _.flatMap(this.snippetEntityContainers, container => _.filter([...container.values()], entityFilter));
    }

    findEntity(key: EntityKey): SnippetEntity | undefined {
        if (key === undefined) {
            return undefined;
        }

        const keyString = key.keyString();
        return this.snippetEntityContainers.find(container => container.has(keyString))?.get(keyString);
    }

    setCallExpressionEntity(entity: CallExpressionEntity) {
        this.callExpressionEntitiesByKey.set(entity.getUid(), entity);
    }

    getCallExpressionEntity(entityKey: EntityKey): CallExpressionEntity  {
        return <CallExpressionEntity> this.callExpressionEntitiesByKey.get(entityKey.keyString());
    }

    setNewExpressionEntity(entity: NewExpressionEntity) {
        this.newExpressionEntitiesByKey.set(entity.getUid(), entity);
    }

    setFunctionDeclarationEntity(entity: FunctionLikeEntity) {
        this.functionLikeEntitiesByKey.set(entity.getUid(), entity);
    }

    setInterfaceEntity(entity: InterfaceEntity) {
        this.interfaceEntitiesByKey.set(entity.getUid(), entity);
    }

    setClassEntity(entity: ClassEntity) {
        this.classEntitiesByKey.set(entity.getUid(), entity);
    }

    getCurrentClassKeyString(): string {
        return this.classStack.isEmpty() ? "" : this.classStack.peek().keyString();
    }


    getCurrentMethodKeyString(): string {
        return this.methodStack.isEmpty() ? "" : this.methodStack.peek().keyString();
    }

    getCurrentVariableDeclaration(): string {
        return this.variableDeclarationStack.isEmpty() ? "" : this.variableDeclarationStack.peek();
    }
}
