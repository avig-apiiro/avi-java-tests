import { useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CircleButton } from '@src-v2/components/button-v2';
import {
  InputControl,
  SelectControlV2,
  TextareaControl,
} from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { SelectV2 } from '@src-v2/components/select/select-v2';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading5 } from '@src-v2/components/typography';
import { ApplicationFormConfigurationType } from '@src-v2/containers/applications/application-form';
import { useInject } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

interface ManualFieldToComponentProps {
  remove?: (index: number) => void;
  clearValue?: () => void;
  index?: number;
  name?: string;
  placeholder?: string;
  rules?: { required: boolean };
}

export enum FieldKey {
  application = 'application',
  evidencesHttpRequest = 'evidencesHttpRequest',
  evidencesGeneral = 'evidencesGeneral',
  impact = 'impact',
  cvss = 'cvss',
  tags = 'tags',
  links = 'links',
  reportName = 'reportName',
  reporter = 'reporter',
  assignee = 'assignee',
}

export function useFieldToComponent() {
  const fieldToComponent = {
    Application: FindingApplication,
    evidencesHttpRequest: EvidenceHttpRequest,
    evidencesGeneral: EvidenceDescription,
    impact: Impact,
    cvss: Cvss,
    tags: Tags,
    links: FindingReferences,
    reportName: ReportName,
    reporter: Reporter,
    assignee: Assignee,
    URL: AssetFindingInput,
    FQDN: AssetFindingInput,
    Host: AssetFindingInput,
    Repository: AssetFindingRepository,
    'IP address': AssetFindingInput,
    CIDR: AssetFindingInput,
    'Cloud resource': AssetFindingInput,
    API: AssetFindingInput,
    Other: AssetFindingInput,
  };

  return useCallback(
    (option: { label: string; value: string }) => {
      return fieldToComponent[option.value as keyof typeof fieldToComponent];
    },
    [fieldToComponent]
  );
}

const FindingApplication = ({
  name,
  placeholder,
  rules = { required: false },
}: ManualFieldToComponentProps) => {
  const { applicationProfiles } = useInject();

  const filterApplication = useCallback(
    ({ data }: { data: ApplicationFormConfigurationType }, inputValue: string) => {
      return !inputValue || data.name.toLowerCase().includes(inputValue.toLowerCase());
    },
    []
  );

  return (
    <SelectControlV2
      name={name}
      placeholder={placeholder}
      rules={rules}
      searchMethod={applicationProfiles.getApplicationConfigurations}
      option={({ data }: { data: ApplicationFormConfigurationType }) => data.name}
      filterOption={filterApplication}
    />
  );
};

const AssetFindingRepository = ({
  name,
  placeholder,
  rules = { required: false },
}: ManualFieldToComponentProps) => {
  const { repositoryProfiles } = useInject();

  return (
    <SelectControlV2
      name={name}
      placeholder={placeholder}
      rules={rules}
      searchMethod={repositoryProfiles.searchProfiles}
      option={({ data }: { data: StubAny }) => (
        <>
          <VendorIcon name={data.provider} /> {data.name}
          {data?.referenceName && <> ({data.referenceName} branch)</>}
        </>
      )}
    />
  );
};

const AssetFindingInput = ({
  name,
  placeholder,
  rules = { required: false },
}: ManualFieldToComponentProps) => {
  return <InputControl rules={rules} name={name} placeholder={placeholder} />;
};

const EvidenceHttpRequest = ({ remove, index, name }: ManualFieldToComponentProps) => {
  const httpMethods = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'PATCH', value: 'PATCH' },
  ];

  const { setValue } = useFormContext();
  const clearValue = () => {
    setValue(`${name}.evidenceHttpRequest.url`, '');
    setValue(`${name}.evidenceHttpRequest.method`, '');
  };
  return (
    <FormLayoutV2.Label>
      <Heading5>Evidence (Request)</Heading5>
      <RowWrapper>
        <SelectControlV2
          clearable={false}
          searchable={false}
          options={httpMethods}
          name={`${name}.evidenceHttpRequest.method`}
        />
        <InputControl name={`${name}.evidenceHttpRequest.url`} placeholder="Request URL..." />
        <TrashCircleButton remove={remove} index={index} clearValue={clearValue} />
      </RowWrapper>
    </FormLayoutV2.Label>
  );
};

const EvidenceDescription = ({ remove, index, name }: ManualFieldToComponentProps) => {
  const { setValue } = useFormContext();
  const clearValue = () => setValue(`${name}.evidenceDescription`, '');
  return (
    <FormLayoutV2.Label>
      <Heading5>Evidence (Description)</Heading5>
      <RowWrapper>
        <TextareaControl
          name={`${name}.evidenceDescription`}
          placeholder="Describe the finding evidence..."
          rows={2}
          charLimit={1000}
        />
        <TrashCircleButton remove={remove} index={index} clearValue={clearValue} />
      </RowWrapper>
    </FormLayoutV2.Label>
  );
};

const Impact = ({ remove, index, name }: ManualFieldToComponentProps) => {
  const { setValue } = useFormContext();
  const clearValue = () => setValue(`${name}.impact`, '');
  return (
    <FormLayoutV2.Label>
      <Heading5>Impact</Heading5>
      <RowWrapper>
        <TextareaControl
          name={`${name}.impact`}
          placeholder="Describe the finding impact..."
          rows={2}
          charLimit={1000}
        />
        <TrashCircleButton remove={remove} index={index} clearValue={clearValue} />
      </RowWrapper>
    </FormLayoutV2.Label>
  );
};

const FindingReferences = ({ remove, index, name }: ManualFieldToComponentProps) => (
  <FormLayoutV2.Label>
    <Heading5>Finding references</Heading5>
    <RowWrapper>
      <SelectControlV2 creatable multiple placeholder="Specify URLs..." name={`${name}.links`} />
      <TrashCircleButton remove={remove} index={index} />
    </RowWrapper>
  </FormLayoutV2.Label>
);

const ReportName = ({ remove, index, name }: ManualFieldToComponentProps) => {
  const { setValue } = useFormContext();
  const clearValue = () => setValue(`${name}.reportName`, '');
  return (
    <FormLayoutV2.Label>
      <Heading5>Report name</Heading5>
      <RowWrapper>
        <CustomWidthInput name={`${name}.reportName`} placeholder="Type the report name..." />
        <TrashCircleButton remove={remove} index={index} clearValue={clearValue} />
      </RowWrapper>
    </FormLayoutV2.Label>
  );
};

const Reporter = ({ remove, index, name }: ManualFieldToComponentProps) => {
  const { setValue } = useFormContext();
  const clearValue = () => setValue(`${name}.reporter`, '');
  return (
    <FormLayoutV2.Label>
      <Heading5>Reporter</Heading5>
      <RowWrapper>
        <CustomWidthInput name={`${name}.reporter`} placeholder="Type the reporter name..." />
        <TrashCircleButton remove={remove} index={index} clearValue={clearValue} />
      </RowWrapper>
    </FormLayoutV2.Label>
  );
};

const Assignee = ({ remove, index, name }: ManualFieldToComponentProps) => {
  const { setValue } = useFormContext();
  const clearValue = () => setValue(`${name}.assignee`, '');
  return (
    <FormLayoutV2.Label>
      <Heading5>Assignee</Heading5>
      <RowWrapper>
        <CustomWidthInput name={`${name}.assignee`} placeholder="Type the point of contact..." />
        <TrashCircleButton remove={remove} index={index} clearValue={clearValue} />
      </RowWrapper>
    </FormLayoutV2.Label>
  );
};

export const Tags = ({
  remove,
  index,
  name,
  shouldShowRemoveIconAtFirstPlace = true,
}: ManualFieldToComponentProps & {
  shouldShowRemoveIconAtFirstPlace?: boolean;
}) => {
  const { fields, remove: removeTagKey, append } = useFieldArray({ name: `${name}.tags` });

  useEffect(() => {
    if (fields.length === 0) {
      append({ tagKey: '', tagValue: '' });
    }
  }, []);

  return (
    <FormLayoutV2.Label>
      <Heading5>Tags</Heading5>
      {fields?.map((field, tagIndex) => (
        <RowWrapper key={field.id}>
          <CustomWidthInput
            width="50rem"
            name={[`${name}.tags`, tagIndex, 'tagKey'].join('.')}
            placeholder="Key..."
          />
          :
          <CustomWidthInput
            width="50rem"
            name={[`${name}.tags`, tagIndex, 'tagValue'].join('.')}
            placeholder="Value..."
            autoFocus={false}
          />
          {(shouldShowRemoveIconAtFirstPlace || tagIndex > 0 || fields.length > 1) && (
            <TrashCircleButton
              remove={() => {
                if (fields.length === 1) {
                  remove(index);
                }
              }}
              index={index}
              clearValue={() => {
                removeTagKey(tagIndex);
              }}
            />
          )}
          {tagIndex === fields.length - 1 && (
            <Tooltip content="Add another tag">
              <CircleButton size={Size.XSMALL} onClick={() => append({ tagKey: '', tagValue: '' })}>
                <SvgIcon name="Plus" />
              </CircleButton>
            </Tooltip>
          )}
        </RowWrapper>
      ))}
    </FormLayoutV2.Label>
  );
};

const Cvss = function ({ remove, index, name }: ManualFieldToComponentProps) {
  const score = [
    { label: '3.1', value: '3.1' },
    { label: '3.0', value: '3.0' },
    { label: '2.0', value: '2.0' },
  ];

  const { setValue } = useFormContext();
  const fieldName = `${name}.cvss`;
  const clearValue = () => {
    setValue(`${fieldName}.version`, '');
    setValue(`${fieldName}.score`, '');
    setValue(`${fieldName}.vector`, '');
  };

  return (
    <FormLayoutV2.Label>
      <Heading5>CVSS</Heading5>
      <RowWrapper>
        <CvssInfo>
          <CvssSelectWrapper>
            <SelectControlV2
              name={`${fieldName}.version`}
              options={score}
              searchable={false}
              clearable={false}
            />
          </CvssSelectWrapper>
          <CustomWidthInput width="25rem" name={`${fieldName}.score`} placeholder="Score..." />
          <InputControl name={`${fieldName}.vector`} placeholder="Vector (optional)..." />
        </CvssInfo>
        <TrashCircleButton remove={remove} index={index} clearValue={clearValue} />
      </RowWrapper>
    </FormLayoutV2.Label>
  );
};

export const TrashCircleButton = ({ remove, index, clearValue }: ManualFieldToComponentProps) => (
  <Tooltip content="Remove additional field">
    <CircleButton
      variant={Variant.TERTIARY}
      size={Size.SMALL}
      onClick={() => {
        remove(index);
        clearValue?.();
      }}>
      <SvgIcon name="Trash" size={Size.XSMALL} />
    </CircleButton>
  </Tooltip>
);

const CvssInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
`;

const CvssSelectWrapper = styled.div`
  ${SelectV2.Container} {
    width: 25rem;
  }
`;

export const RowWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  ${SelectV2.Container} {
    min-width: 40rem;
  }
`;

const CustomWidthInput = styled(InputControl)`
  width: ${props => props.width ?? '105rem'};
`;
