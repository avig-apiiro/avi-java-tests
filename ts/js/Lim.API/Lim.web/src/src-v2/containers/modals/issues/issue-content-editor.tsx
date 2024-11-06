import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { IconButton } from '@src-v2/components/buttons';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import { FieldFactory } from '@src-v2/containers/modals/issues/field-factory';
import { OptionalFieldsSelect } from '@src-v2/containers/modals/issues/optional-fields-select';
import { useProviderModalSettings } from '@src-v2/containers/modals/issues/providers-issue-modals';
import { useInject, useSuspense } from '@src-v2/hooks';
import { humanize } from '@src-v2/utils/string-utils';

export function IssueContentEditor({ provider, riskData = null, hideSummaryInput = false }) {
  const { ticketingIssues } = useInject();

  const { fields, append, remove } = useFieldArray({ name: 'issueContent' });
  const { watch, setValue } = useFormContext();
  const [project, issueType, schema] = watch(['project', 'issueType', 'schema']);

  const [additionalFields, setAdditionalFields] = useState([]);
  const { noIssueType, defaultSchema, summaryFieldKey } = useProviderModalSettings(provider);

  const [issueTypeSchema, defaultFieldsData] = useSuspense([
    [
      ticketingIssues.getIssueTypeSchema,
      {
        provider,
        projectKey: project?.key,
        issueTypeId: issueType?.id,
      },
    ] as const,
    [
      ticketingIssues.getDefaultFields,
      {
        project: project?.key,
        issueType: issueType?.id,
        riskLevel: riskData?.riskLevel,
        applicationKey: riskData?.applications?.[0]?.key,
      },
    ] as const,
  ]);

  useEffect(() => {
    defaultFieldsData?.forEach(({ fieldKey, value, label }) =>
      setValue(`fieldsValues.${fieldKey}`, label ? { value, label } : value)
    );
  }, [defaultFieldsData]);

  useEffect(
    () => setValue('schema', noIssueType && project ? defaultSchema : issueTypeSchema),
    [noIssueType, project, defaultSchema, issueTypeSchema]
  );

  useEffect(() => {
    remove();

    if (!schema) {
      return;
    }

    const requiredFields =
      schema.requiredFields?.filter(
        field => !hideSummaryInput || `fieldsValues.${field.key}` !== summaryFieldKey
      ) ?? [];
    requiredFields.forEach(field => append({ ...field, required: true }));

    const [defaultVisibleFields, additionalFields] = _.partition(
      schema.additionalFields,
      field => field.isDefault
    );

    setAdditionalFields(additionalFields);
    if (defaultVisibleFields?.length) {
      append(defaultVisibleFields.map(field => ({ ...field, defaultVisible: true })));
    }
  }, [schema, hideSummaryInput]);

  // @ts-expect-error
  const visibleFieldsKeys = fields.map(field => field.key);

  const handleVisibleFieldsChange = useCallback(
    checkedKeys => {
      const fieldIndexesToRemove = _.difference(visibleFieldsKeys, checkedKeys).map(key =>
        // @ts-expect-error
        fields.findIndex(field => field.key === key)
      );
      if (fieldIndexesToRemove?.length) {
        remove(fieldIndexesToRemove);
      }

      const fieldsToAdd = _.difference(checkedKeys, visibleFieldsKeys).map(key =>
        additionalFields.find(field => field.key === key)
      );
      append(fieldsToAdd);
    },
    [visibleFieldsKeys, fields]
  );

  return (
    <>
      {fields.map((field, index) => (
        // @ts-expect-error
        <Field key={field.key}>
          {/*@ts-expect-error*/}
          <Label required={field.required}>
            {formatFieldLabel(field)}
            {/*@ts-expect-error*/}
            {!field.required && !field.defaultVisible && (
              <IconButton name="Close" onClick={() => remove(index)} />
            )}
          </Label>
          {/*@ts-expect-error*/}
          <FieldFactory field={field} />
        </Field>
      ))}

      {Boolean(additionalFields?.length) && (
        <OptionalFieldsSelect
          fields={additionalFields}
          checkedFieldKeys={visibleFieldsKeys}
          itemToString={formatFieldLabel}
          onChange={handleVisibleFieldsChange}
        />
      )}
    </>
  );
}

function formatFieldLabel(field) {
  return humanize(field.label ?? `Add ${field.key}`);
}
