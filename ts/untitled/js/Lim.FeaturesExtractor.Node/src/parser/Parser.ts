import path from "path";
import ts from "typescript";
import {LimLogger} from "../internals/Logger";
import {executeWithLogAsync} from "../internals/LoggingUtils";
import {ModuleEntity} from "../models/entities/ModuleEntity";
import {createPreprocessingCompilerHost} from "../transformation/preprocessingHost";
import {Context} from "../types/Context";
import {ClientModuleDetectedError} from "../types/Errors";

import {enrichParserState} from "./state/EnrichParserState";
import {getNodeEntityKey} from "./visitors/utils/nodeCommonUtils";
import {Visitors} from "./visitors/Visitors";

export async function executeParser(parserContext: Context, fileNames: string[], options: ts.CompilerOptions): Promise<void> {
    const logger = new LimLogger(parserContext.correlationId, __filename);
    const program = await executeWithLogAsync(logger, "create project", createProgram);

    const typeChecker = program.getTypeChecker();
    const visitors = Visitors.map(visitor => new visitor(typeChecker, parserContext));

    await executeWithLogAsync(logger, "nodes visitations", runVisitorsOnSource);
    await enrichParserState(parserContext);

    // Inner helper functions
    function createProgram(): ts.Program {
        const compilerHost = createPreprocessingCompilerHost(options, parserContext.correlationId);
        return ts.createProgram(fileNames, options, compilerHost);
    }

    function runVisitorsOnSource() {
        for (const sourceFile of program.getRootFileNames().map(program.getSourceFile)) {
            if (sourceFile != undefined) {
                try {
                    visitSourceFile(sourceFile);
                } catch (error) {
                    if (!(error instanceof ClientModuleDetectedError)) {
                        throw error;
                    }
                }
            }
        }
    }

    function visitSourceFile(sourceFile: ts.SourceFile) {
        const sourceFilePath = path.relative(parserContext.directoryPath, sourceFile.fileName);

        let module = parserContext.parserState.moduleEntitiesByName.get(sourceFilePath);
        if (module == undefined) {
            module = new ModuleEntity(sourceFilePath);
            parserContext.parserState.moduleEntitiesByName.set(sourceFilePath, module);
        }

        ts.forEachChild(sourceFile, visit);

        function visit(node: ts.Node) {
            parserContext.throwIfCancelled();

            const matchingVisitors = visitors.filter(visitor => visitor.shouldVisit(node));
            if (matchingVisitors.length == 0) {
                ts.forEachChild(node, visit);
            } else {
                const entityKey = getNodeEntityKey(node, sourceFilePath);
                matchingVisitors.forEach(visitor => visitor.visitBeforeChildren(node, entityKey));
                ts.forEachChild(node, visit);
                matchingVisitors.forEach(visitor => visitor.visitAfterChildren(node, entityKey));
            }
        }
    }
}
