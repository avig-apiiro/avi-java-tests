import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditableApiiroQlExpressionTokenizedString } from '@src-v2/containers/smart-policy/smart-policy-entity-query-editor';

export type TokenizedStringComponent = EditableApiiroQlExpressionTokenizedString['components'][0];

export type EditedTokenizedStringComponent = { component: TokenizedStringComponent; key: string };

function createEditedTokenziedStringComponents(
  components: TokenizedStringComponent[]
): EditedTokenizedStringComponent[] {
  const newEditedComponents: EditedTokenizedStringComponent[] = [];
  let previousComponent: TokenizedStringComponent = null;
  components.forEach(component => {
    if (
      typeof component === 'object' &&
      'apiiroQl' in component &&
      typeof previousComponent !== 'string'
    ) {
      newEditedComponents.push({ component: '', key: crypto.randomUUID() });
    }
    newEditedComponents.push({ component, key: crypto.randomUUID() });
    previousComponent = component;
  });

  if (typeof previousComponent !== 'string') {
    newEditedComponents.push({ component: '', key: crypto.randomUUID() });
  }

  return newEditedComponents;
}

export function getTokenizedStringComponentLength(component: TokenizedStringComponent) {
  return typeof component === 'string' ? component.length : component.apiiroQl.length;
}

function generateApiiroQlForTokenizedStringComponents(
  updatedComponents: TokenizedStringComponent[]
) {
  const expressionContent = updatedComponents
    .map(component =>
      typeof component === 'string'
        ? component.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$')
        : `\${${component.apiiroQl}}`
    )
    .join('');
  return `"${expressionContent}"`;
}
export function useEditedComponents(
  value: EditableApiiroQlExpressionTokenizedString,
  onChange?: (newValue: EditableApiiroQlExpressionTokenizedString) => void
) {
  const [editedComponents, setEditedCopmonents] = useState<EditedTokenizedStringComponent[]>(
    createEditedTokenziedStringComponents(value.components)
  );

  // Allow calls that only access the components list for read
  // to remain constant
  const editedComponentsReadOnlyRef = useRef(editedComponents);
  editedComponentsReadOnlyRef.current = editedComponents;

  useEffect(() => {
    if (
      generateApiiroQlForTokenizedStringComponents(value.components) !==
      generateApiiroQlForTokenizedStringComponents(
        editedComponents.map(
          editedTokenizedStringComponent => editedTokenizedStringComponent.component
        )
      )
    ) {
      setEditedCopmonents(createEditedTokenziedStringComponents(value.components));
    }
  }, [editedComponents, setEditedCopmonents, value]);

  const getCharacterIndexFromComponentIndexAndOffset = useCallback(
    (componentIndex: number, offsetInComponent: number) => {
      let startIndexForComponent = 0;
      for (let i = 0; i < componentIndex; i++) {
        const { component } = editedComponentsReadOnlyRef.current[i];
        startIndexForComponent += getTokenizedStringComponentLength(component);
      }

      return (
        startIndexForComponent +
        (offsetInComponent >= 0
          ? offsetInComponent
          : getTokenizedStringComponentLength(
              editedComponentsReadOnlyRef.current[componentIndex].component
            ) +
            1 +
            offsetInComponent)
      );
    },
    [editedComponentsReadOnlyRef]
  );

  const getComponentIndexAndOffsetForCharacterIndex = useCallback(
    (characterIndex: number) => {
      let containingEditedComponent: EditedTokenizedStringComponent = null;
      let containingComponentStartIndex = 0;
      let containingComponentIndex: number;
      for (
        containingComponentIndex = 0;
        containingComponentIndex < editedComponentsReadOnlyRef.current.length;
        containingComponentIndex++
      ) {
        containingEditedComponent = editedComponentsReadOnlyRef.current[containingComponentIndex];
        const currentComponentLength = getTokenizedStringComponentLength(
          containingEditedComponent.component
        );
        if (
          characterIndex >= containingComponentStartIndex &&
          characterIndex <= containingComponentStartIndex + currentComponentLength
        ) {
          break;
        }
        containingComponentStartIndex += currentComponentLength;
      }

      if (containingComponentIndex === editedComponentsReadOnlyRef.current.length) {
        containingComponentIndex--;
      }

      return {
        containingComponentIndex,
        offsetInComponent: characterIndex - containingComponentStartIndex,
        containingEditedComponent,
      };
    },
    [editedComponentsReadOnlyRef]
  );

  const updateComponentsArray = useCallback(
    (updater: (value: EditedTokenizedStringComponent[]) => EditedTokenizedStringComponent[]) => {
      const updatedComponents = updater(editedComponents);
      setEditedCopmonents(updatedComponents);
      const normalizedInterpolationComponents = updatedComponents
        .map(editedComponent => editedComponent.component)
        .filter(component =>
          typeof component === 'string' ? component !== '' : component?.apiiroQl
        );
      onChange?.({
        type: 'tokenString',
        components: normalizedInterpolationComponents,
        apiiroQlSource: generateApiiroQlForTokenizedStringComponents(
          normalizedInterpolationComponents
        ),
      });
    },
    [value, onChange]
  );

  const updateComponent = useCallback(
    (index: number, component: TokenizedStringComponent) => {
      updateComponentsArray(values => {
        const updatedComponents = [...values];
        if (updatedComponents[index]) {
          updatedComponents[index].component = component;
        } else {
          updatedComponents[index] = {
            key: crypto.randomUUID(),
            component,
          };
        }
        return updatedComponents;
      });
    },
    [value, onChange]
  );

  const deleteComponent = useCallback(
    (index: number) => {
      updateComponentsArray(values => {
        const updatedComponents = [...values];

        if (
          index > 0 &&
          typeof values[index - 1].component === 'string' &&
          typeof values[index + 1].component === 'string'
        ) {
          values[index - 1].component =
            (values[index - 1].component as string) + (values[index + 1].component as string);
          updatedComponents.splice(index, 2);
        } else {
          updatedComponents.splice(index, 1);
        }

        return updatedComponents;
      });
    },
    [value, onChange, getCharacterIndexFromComponentIndexAndOffset]
  );

  const insertTokenAtCharacter = useCallback(
    (characterIndex: number, tokenContent: string) => {
      let { containingComponentIndex, offsetInComponent, containingEditedComponent } =
        getComponentIndexAndOffsetForCharacterIndex(characterIndex);

      if (
        typeof containingEditedComponent.component !== 'string' &&
        offsetInComponent === containingEditedComponent.component.apiiroQl.length &&
        containingComponentIndex < editedComponents.length - 1
      ) {
        offsetInComponent = 0;
        containingComponentIndex++;
        containingEditedComponent = editedComponents[containingComponentIndex];
      }

      if (typeof containingEditedComponent.component !== 'string') {
        return false;
      }

      let spliceStart = containingComponentIndex;
      let spliceDelete: number = 0;
      let splicePrefix: EditedTokenizedStringComponent[] = [];
      let spliceSuffix: EditedTokenizedStringComponent[] = [];

      if (offsetInComponent === 0) {
        if (
          containingComponentIndex === 0 ||
          typeof editedComponents[containingComponentIndex - 1].component !== 'string'
        ) {
          splicePrefix = [{ key: crypto.randomUUID(), component: '' }];
        }
      } else if (
        offsetInComponent >= getTokenizedStringComponentLength(containingEditedComponent.component)
      ) {
        spliceStart++;
        if (
          containingComponentIndex >= editedComponents.length - 1 ||
          typeof editedComponents[containingComponentIndex + 1].component !== 'string'
        ) {
          spliceSuffix = [{ key: crypto.randomUUID(), component: '' }];
        }
      } else {
        spliceDelete = 1;
        const editedComponentContent = containingEditedComponent.component as string;
        splicePrefix = [
          {
            key: containingEditedComponent.key,
            component: editedComponentContent.slice(0, offsetInComponent),
          },
        ];
        spliceSuffix = [
          { key: crypto.randomUUID(), component: editedComponentContent.slice(offsetInComponent) },
        ];
      }

      updateComponentsArray(editedComponents => {
        const newArray = [...editedComponents];
        newArray.splice(
          spliceStart,
          spliceDelete,
          ...splicePrefix,
          { key: crypto.randomUUID(), component: { apiiroQl: tokenContent } },
          ...spliceSuffix
        );
        return newArray;
      });

      return true;
    },
    [editedComponents, getComponentIndexAndOffsetForCharacterIndex]
  );

  const clearAllComponents = useCallback(() => {
    updateComponentsArray(_ => [{ key: crypto.randomUUID(), component: '' }]);
  }, [updateComponentsArray]);

  const isEmpty = useMemo(() => {
    return (
      !editedComponents?.length ||
      (editedComponents.length === 1 &&
        getTokenizedStringComponentLength(editedComponents[0].component) === 0)
    );
  }, [editedComponents]);

  return {
    editedComponents,
    getCharacterIndexFromComponentIndexAndOffset,
    getComponentIndexAndOffsetForCharacterIndex,
    updateComponent,
    deleteComponent,
    clearAllComponents,
    insertTokenAtCharacter,
    isEmpty,
  };
}
