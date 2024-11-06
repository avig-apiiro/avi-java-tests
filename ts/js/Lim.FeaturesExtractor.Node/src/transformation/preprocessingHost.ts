import _ from 'lodash';
import ts from "typescript";
import {LimLogger} from "../internals/Logger";
import {requireExpressionsChangeGenerator} from "./requireExpressionsTransformation";
import {TextChange, TextChangeGenerator} from "./textChanges";

const preprocessingTextChangeCollectors: TextChangeGenerator[] = [
    requireExpressionsChangeGenerator
];

export function createPreprocessingCompilerHost(compilerOptions: ts.CompilerOptions, correlationId: string): ts.CompilerHost {
    const logger = new LimLogger(correlationId, __filename);
    return createTransformingCompilerHost(compilerOptions, preprocessingTextChangeCollectors, logError);

    function logError(error: Error, sourceFile: ts.SourceFile, changeGenerator: TextChangeGenerator) {
        logger.error(`Error applying change generator '${changeGenerator.name}' on source file '${sourceFile.fileName}':\n${error.stack}`);
    }
}

function createTransformingCompilerHost(
    compilerOptions: ts.CompilerOptions,
    textChangeGenerators: TextChangeGenerator[],
    onError?: (error: Error, sourceFile: ts.SourceFile, changeGenerator: TextChangeGenerator) => void): ts.CompilerHost {

    const compilerHost = ts.createCompilerHost(compilerOptions, true);

    for (const methodName of ['getSourceFile', 'getSourceFileByPath']) {
        const originalMethod = compilerHost[methodName];
        if (originalMethod === undefined) {
            continue;
        }

        compilerHost[methodName] = function(...args) {
            return transformSourceFile(originalMethod(...args));
        };
    }

    return compilerHost;

    function transformSourceFile(sourceFile: ts.SourceFile | undefined): ts.SourceFile | undefined {
        if (sourceFile == undefined) {
            return sourceFile;
        }

        for (const changeGenerator of textChangeGenerators) {
            try {
                sourceFile = applyChangeGenerator(changeGenerator, sourceFile);
            } catch (error) {
                onError?.(error, sourceFile, changeGenerator);
            }
        }
        return sourceFile;
    }
}

function applyChangeGenerator(changeGenerator: TextChangeGenerator, sourceFile: ts.SourceFile): ts.SourceFile {
    let changes = changeGenerator(sourceFile);
    if (_.isEmpty(changes)) {
        return sourceFile;
    }

    changes = _.orderBy(changes, (textChange => textChange.span.start), ['desc']);
    let text = sourceFile.getFullText();

    for (let change of changes) {
        change = matchLineCount(text, change);
        text = text.slice(0, change.span.start) + change.newText + text.slice(change.span.start + change.span.length);
        sourceFile = sourceFile.update(text, {span: change.span, newLength: change.newText.length});
    }
    return sourceFile;
}

function matchLineCount(text: string, change: TextChange): TextChange {
    const originalText = text.slice(change.span.start, change.span.start + change.span.length);
    const missingLinebreaks = countLinebreaks(originalText) - countLinebreaks(change.newText);

    if (missingLinebreaks < 0) {
        throw new Error(`Replacement text has more linebreaks than original text: \n${change.newText}\nvs.\n${originalText}`);
    } else if (missingLinebreaks > 0) {
        return {
            span: change.span,
            newText: change.newText + '\n'.repeat(missingLinebreaks)
        };
    } else {
        return change;
    }
}

function countLinebreaks(s: string) {
    return (s.match(/\n/g) || '').length;
}
