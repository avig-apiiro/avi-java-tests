import {LimLogger} from '../../../internals/Logger';
import {CallExpressionEntity} from '../../../models/entities/CallLikeEntities';
import {capString} from './featuresValuesTransformers';

export function getCallExpressionFuncNames(entity: CallExpressionEntity, logger: LimLogger): [string, string] {
    let callExpressionFuncName: string;
    let callExpressionFullName: string;

    if (entity.callExpressionIsParenthesized) {
        // Replace function blob with an indicator of a function blob
        callExpressionFuncName = '!function()!';
        callExpressionFullName = '!function()!';
    } else {
        callExpressionFuncName = capString(entity.callExpressionFuncName, 'callExpressionFuncName', logger, entity.key);
        callExpressionFullName = capString(entity.callExpressionFullText, 'callExpressionFullName', logger, entity.key);
    }

    return [callExpressionFuncName.trim(), callExpressionFullName];
}
