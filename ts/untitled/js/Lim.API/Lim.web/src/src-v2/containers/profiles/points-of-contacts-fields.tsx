import { MouseEventHandler, ReactNode, useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { Avatar } from '@src-v2/components/avatar';
import { CircleButton } from '@src-v2/components/button-v2';
import { Input } from '@src-v2/components/forms';
import { Combobox } from '@src-v2/components/forms/combobox';
import { ErrorTypeMapping } from '@src-v2/components/forms/field-error-display';
import { ArrayField } from '@src-v2/components/forms/form-array-fields';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormFieldArray } from '@src-v2/components/forms/form-field-array';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { SvgIcon } from '@src-v2/components/icons';
import { SelectV2 } from '@src-v2/components/select/select-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { useConditionalValidation, useInject, useSuspense, useValidation } from '@src-v2/hooks';
import ioc from '@src-v2/ioc';
import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';
import { StubAny } from '@src-v2/types/stub-any';
import { toArray } from '@src-v2/utils/collection-utils';
import { dataAttr } from '@src-v2/utils/dom-utils';

interface AppendFieldButtonProps {
  children: ReactNode;
  onClick: MouseEventHandler;
}

interface PointsOfContactsFieldsProps {
  name: string;
  dataFetcher?: () => Promise<{ value: string; label: string }[]>;
  legacyLayout?: boolean;
}

export const PointOfContactFields = ({
  name,
  dataFetcher = ioc.contributors.getPointsOfContactTypes,
  legacyLayout,
}: PointsOfContactsFieldsProps) => {
  const { watch } = useFormContext();
  const allJobTitles = useSuspense(dataFetcher);
  const fieldsData = watch(name) ?? [];

  const availableJobTitles = useMemo(() => {
    const selectedJobTitles = fieldsData
      .map(({ jobTitle }: { jobTitle: StubAny }) => jobTitle?.value ?? jobTitle)
      .filter(Boolean);
    return allJobTitles.filter(jobTitle => !selectedJobTitles.includes(jobTitle.value));
  }, [allJobTitles, fieldsData.map((field: StubAny) => field.jobTitle?.value).join()]);

  const PointsOfContactFieldWrapper = useCallback(
    ({ name }: { name: string }) => (
      <PointsOfContactField name={name} availableJobTitles={availableJobTitles} />
    ),
    [availableJobTitles]
  );

  return (
    <FieldArrayContainer
      data-legacy-layout={dataAttr(legacyLayout)}
      buttonText="Add point of contact"
      name={name}
      defaultFieldValue={{ jobTitle: null, developer: [] }}>
      {PointsOfContactFieldWrapper}
    </FieldArrayContainer>
  );
};

const FieldArrayContainer = styled(FormFieldArray)`
  ${SelectV2.Container} {
    flex: 3;

    &:first-child {
      flex: 1;
    }
  }

  &[data-legacy-layout] {
    ${SelectV2.Container} {
      flex: unset;

      &:first-child {
        min-width: 70rem;
      }

      &:not(:first-child) {
        min-width: 160rem;
      }
    }
  }
`;

const PointsOfContactField = ({
  name,
  availableJobTitles,
}: {
  name: string;
  availableJobTitles?: { value: string; label: string }[];
}) => {
  const { validateEmptyItem } = useValidation();

  return (
    <>
      <SelectControlV2
        searchable={false}
        name={`${name}.jobTitle`}
        placeholder="Select a type..."
        options={availableJobTitles}
        rules={{
          validate: useConditionalValidation(validateEmptyItem, name),
        }}
      />
      <DeveloperSelector name={name} />
    </>
  );
};

const DeveloperSelector = ({ name }: { name: string }) => {
  const { contributors } = useInject();
  const { jobTitle }: { jobTitle: { value: keyof typeof PointsOfContactOptions } } = useWatch({
    name,
  });

  const isSingleValue = singleValuePointOfContactValue.includes(jobTitle?.value);

  const validateRequiredDevelopers = useCallback(
    (developerOrArray: LeanDeveloper | LeanDeveloper[]) => {
      const developers = toArray(developerOrArray);
      return developers.length && !developers?.some(developer => developer.faulted)
        ? true
        : ErrorTypeMapping.required;
    },
    []
  );

  return (
    <SelectControlV2
      multiple={!isSingleValue}
      placeholder="Add contact..."
      name={[name, 'developer'].join('.')}
      searchMethod={contributors.searchDevelopers}
      label={DeveloperLabel}
      option={DeveloperLabel}
      rules={{ validate: useConditionalValidation(validateRequiredDevelopers, name) }}
    />
  );
};

const DeveloperLabel = ({ data }: { data: LeanDeveloper }) => (
  <>
    <Avatar {...data} /> {data.username}
  </>
);

export const FieldItem = styled(ArrayField)`
  ${Combobox} {
    flex-grow: 1;

    ${Input} {
      width: 100rem;
    }

    &${(MultiSelect as any).Combobox} {
      max-width: 160rem;
      gap: 1.25rem;

      ${Input} {
        height: 6rem;
      }
    }

    &:first-of-type ${Input} {
      width: 50rem;
    }
  }
`;

export const AppendFieldButton = styled(
  ({ children, onClick, ...props }: AppendFieldButtonProps) => (
    <label {...props}>
      <CircleButton size={Size.XSMALL} onClick={onClick}>
        <SvgIcon name="Plus" />
      </CircleButton>
      {children}
    </label>
  )
)`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
`;

export const PointsOfContactOptions = {
  TeamOwner: 'Team Owner',
  BusinessOwner: 'Business Owner',
  SecurityArchitect: 'Security Architect',
  PenTester: 'Pen Tester',
  DevTeamLead: 'Dev Team Lead',
  SecurityChampion: 'Security Champion',
  ProductManager: 'Product Manager',
};

const singleValuePointOfContactValue: (keyof typeof PointsOfContactOptions)[] = ['TeamOwner'];
