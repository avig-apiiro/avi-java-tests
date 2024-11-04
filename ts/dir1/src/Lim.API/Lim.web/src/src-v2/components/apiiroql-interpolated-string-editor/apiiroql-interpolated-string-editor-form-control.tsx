import { useMemo } from 'react';
import { Controller, FieldErrors, useFormContext } from 'react-hook-form';
import { ApiiroQlInterpolatedStringEditor } from '@src-v2/components/apiiroql-interpolated-string-editor/apiiroql-interpolated-string-editor';
import {
  TokenSuggestionGenerators,
  TokenSuggestionsGenerator,
} from '@src-v2/components/apiiroql-interpolated-string-editor/apiiroql-interpolated-string-editor-suggestions-popover';
import { InventoryQueryObjectDescriptor } from '@src-v2/containers/inventory-query/inventory-query-object-options';

////
/// Here be dragons: This component receives the errors object rather than taking it from the
/// form context since it was observed that in current versions of use-react-form when
/// we call fieldState.error we break the errors mechanism. Once this issue is fixed in
/// use-react-form it would be prudent to remove formErrors and rely on fieldState.error
///

export function ApiiroQlInterpolatedStringEditorFormControl({
  name,
  objectTypeFieldName,
  additionalSuggestedTokenGenerators,
  formErrors,
}: {
  name: string;
  objectTypeFieldName?: string;
  additionalSuggestedTokenGenerators?: TokenSuggestionsGenerator[];
  formErrors: FieldErrors;
}) {
  const formContext = useFormContext();
  const targetObjectDataType: InventoryQueryObjectDescriptor = objectTypeFieldName
    ? formContext.watch(objectTypeFieldName)
    : null;

  const effectiveSuggestedTokenGenerators = useMemo(() => {
    const generators = [
      ...(additionalSuggestedTokenGenerators ? additionalSuggestedTokenGenerators : []),
    ];

    if (targetObjectDataType) {
      generators.push(TokenSuggestionGenerators.PropertiesForType(targetObjectDataType, 'subject'));
    }

    generators.push(TokenSuggestionGenerators.CustomExpression());

    return generators;
  }, [targetObjectDataType, additionalSuggestedTokenGenerators]);

  return (
    <Controller
      name={name}
      render={({ field: { onChange, value } }) => {
        return (
          <ApiiroQlInterpolatedStringEditor
            onChange={onChange}
            value={value}
            errors={(formErrors[name] as any)?.editableExpressionErrors}
            tokenSuggestionGenerators={effectiveSuggestedTokenGenerators}
          />
        );
      }}
    />
  );
}
