import { useFormContext } from 'react-hook-form';
import {
  InputControl,
  SelectControlV2,
  TextareaControl,
} from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Heading1, Heading5 } from '@src-v2/components/typography';
import {
  AdditionalFieldsMenu,
  FieldItem,
} from '@src-v2/containers/manual-findings/form/components/additional-fields-menu';
import { SelectedFieldsContent } from '@src-v2/containers/manual-findings/form/components/selected-fields-content';
import { SeveritySelect } from '@src-v2/containers/manual-findings/form/components/severity-select';
import { FieldKey } from '@src-v2/containers/manual-findings/form/components/use-field-to-component';

export const NewFindingSection = () => {
  const { watch, setValue } = useFormContext();

  const selectedFields = watch('additionalFields');
  const handleSelectedFields = (selectedFields: FieldItem[]) => {
    setValue('additionalFields', selectedFields);
  };

  return (
    <FormLayoutV2.Section>
      <Heading1>Finding</Heading1>
      <FormLayoutV2.Label required>
        <Heading5>Finding name</Heading5>
        <InputControl
          name="newFinding.title"
          placeholder="Type a finding name..."
          rules={{ required: true }}
          autoFocus
        />
      </FormLayoutV2.Label>
      <FormLayoutV2.FormGroup>
        <FormLayoutV2.Label required>
          <Heading5>Severity</Heading5>
          <SeveritySelect />
        </FormLayoutV2.Label>
        <FormLayoutV2.Label required>
          <Heading5>Status</Heading5>
          <StatusSelect />
        </FormLayoutV2.Label>
        <FormLayoutV2.Label>
          <Heading5>Discovered on</Heading5>
          <DiscoveredOn />
        </FormLayoutV2.Label>
      </FormLayoutV2.FormGroup>
      <FormLayoutV2.Label>
        <Heading5>Finding description</Heading5>
        <TextareaControl
          name="newFinding.description"
          placeholder="Describe the finding..."
          rows={2}
          charLimit={1000}
        />
      </FormLayoutV2.Label>
      <FormLayoutV2.Label>
        <Heading5>Remediation</Heading5>
        <TextareaControl
          name="newFinding.remediation"
          placeholder="Describe the finding remediation..."
          rows={2}
          charLimit={1000}
        />
      </FormLayoutV2.Label>
      <SelectedFieldsContent />
      <AdditionalFindingFields visibleFieldsKeys={selectedFields} onChange={handleSelectedFields} />
    </FormLayoutV2.Section>
  );
};

export const findingStatus = [
  { label: 'Open', value: 'Open' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Ignored', value: 'Ignored' },
  { label: 'Draft', value: 'Draft' },
];

const StatusSelect = () => (
  <SelectControlV2
    name="newFinding.status"
    options={findingStatus}
    searchable={false}
    clearable={false}
  />
);

const DiscoveredOn = () => (
  <InputControl
    name="newFinding.discoveredOn"
    type="date"
    max={new Date().toISOString().substring(0, 10)}
    defaultValue={new Date().toISOString().substring(0, 10)}
  />
);

export const fields: { key: keyof typeof FieldKey; label: string }[] = [
  {
    key: 'evidencesHttpRequest',
    label: 'Evidence (http request)',
  },
  { key: 'evidencesGeneral', label: 'Evidence (description)' },
  {
    key: 'impact',
    label: 'Impact',
  },
  {
    key: 'cvss',
    label: 'CVSS details',
  },
  {
    key: 'tags',
    label: 'Finding tags',
  },
  {
    key: 'links',
    label: 'Finding references',
  },
  {
    key: 'reportName',
    label: 'Report name',
  },
  {
    key: 'reporter',
    label: 'Reporter',
  },
  {
    key: 'assignee',
    label: 'Assignee',
  },
];

const AdditionalFindingFields = ({
  visibleFieldsKeys,
  onChange,
}: {
  visibleFieldsKeys?: FieldItem[];
  onChange?: (data: FieldItem[]) => void;
}) => {
  return (
    <AdditionalFieldsMenu
      fields={fields}
      checkedFieldKeys={visibleFieldsKeys}
      onChange={onChange}
    />
  );
};
