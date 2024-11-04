import {LimLogger} from "../../../internals/Logger";
import {EntityKey} from "../../../models/entities/EntityKey";
import {MapFeature} from "../ProviderBase";

const maxBlobSize = 100;
const trimmedBlobIndicator = "!Trimmed!";

export function capString(inputString: string | undefined, inputName: string, logger: LimLogger, entityKey: EntityKey): string {
    if (inputString === undefined) {
        return "";
    }

    if (inputString.length > maxBlobSize) {
        logger.silly(`${inputName} is too long (length=${inputString.length}, key=${entityKey.keyString()})`);
        return trimmedBlobIndicator;
    }

    return inputString;
}

export function mapToMapFeature(inputMap: Map<string, string>): MapFeature {
    const mapFeature: MapFeature = {};
    inputMap.forEach((value, key) => {
        mapFeature[key] = value.toString();
    });
    return mapFeature;
}

