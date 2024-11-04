import ts from "typescript";

export type ObjectMapValue = undefined | string | ObjectMap | ObjectMapValue[];
export type ObjectMap = { [key: string]: ObjectMapValue };

export function getObjectLiteralValue(objectNode: ts.ObjectLiteralExpression): ObjectMap {
    const parsedObject = {};
    objectNode.properties.forEach(property => {
            if (ts.isPropertyAssignment(property)) {
                const key = property.name.getText();
                parsedObject[key] = getLiteralExpressionValue(property.initializer);
            } else if (ts.isShorthandPropertyAssignment(property)) {
                const key = property.name.getText();
                const value = getLiteralExpressionValue(property.objectAssignmentInitializer);
                parsedObject[key] = value ?? key;
            }
        }
    );

    return parsedObject;
}

export function getObjectLiteralPropertyValue(objectNode: ts.ObjectLiteralExpression, propertyName: string): ObjectMapValue {
    const property = objectNode.properties.find(prop => prop.name?.getText() == propertyName);
    if (!property || !ts.isPropertyAssignment(property)) {
        return undefined;
    }

    return getLiteralExpressionValue(property.initializer);
}

function getLiteralExpressionValue(expression: ts.Expression | undefined): ObjectMapValue {
    if (expression === undefined) {
        return undefined;
    } else if (ts.isObjectLiteralExpression(expression)) {
        return getObjectLiteralValue(expression);
    } else if (ts.isArrayLiteralExpression(expression)) {
        return expression.elements.map(getLiteralExpressionValue);
    } else if (ts.isStringLiteral(expression)) {
        return expression.text;
    } else {
        return expression.getText();
    }
}
