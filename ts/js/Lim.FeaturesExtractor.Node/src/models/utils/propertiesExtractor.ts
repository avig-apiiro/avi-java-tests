import _ from "lodash";
import {ObjectMap} from "../../parser/visitors/utils/nodeObjectLiteralUtils";

export function extractProperties(propertiesObject: ObjectMap): Map<string, string> {
    const properties = new Map<string, string>();

    _.map(propertiesObject, (propertyValue, propertyName) => {
        let propertyType: string = "";
        if (typeof propertyValue === 'string') {
            propertyType = propertyValue;
        } else if (typeof propertyValue === 'object' && 'type' in propertyValue && typeof propertyValue.type === "string") {
            propertyType = propertyValue.type;
        }
        properties.set(propertyName, propertyType);
    });

    return properties;

}
