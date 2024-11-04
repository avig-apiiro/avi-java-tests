import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { FormContext } from '@src-v2/components/forms';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { FormContent } from '@src-v2/containers/manual-findings/form/components/form-content';
import {
  convertFindingToFormValues,
  convertFormValuesToFinding,
} from '@src-v2/containers/manual-findings/form/utils';
import { HelpModalButton } from '@src-v2/containers/modals/help-modal';
import { useInject, useSuspense } from '@src-v2/hooks';
import { ManualFindingRequest } from '@src-v2/services';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export interface Tag {
  tagKey: string;
  tagValue: string;
}

interface Finding {
  severity: {
    label: string;
    key: string;
    icon: any;
  };
  status: {
    label: string;
    value: string;
  };
  cvss: {
    version: { label: string; value: string };
    score: string;
    vector: string;
  };
  evidenceHttpRequest: {
    method: { label: string; value: string };
    url: string;
  };
  evidenceDescription: string;
  title: string;
  discoveredOn: string;
  description: string;
  remediation: string;
  impact: string;
  links: { label: string; value: string }[];
  reportName: string;
  reporter: string;
  assignee: string;
  tags: Tag[];
}

interface CVEGlobalIdentifier {
  cve: string;
}

interface CWEGlobalIdentifier {
  cwe: string;
}

interface GlobalIdentifiers {
  cveGlobalIdentifiers: CVEGlobalIdentifier[];
  cweGlobalIdentifiers: CWEGlobalIdentifier[];
}

interface AssetFinding {
  role: 'Subject' | 'Related' | 'Affected';
  type: string | { label: string; value: string };
  name: string | { name: string; key: string };
  importance: {
    label: 'Low' | 'Medium' | 'High';
    value: 'Low' | 'Medium' | 'High';
  };
  IPAddress: {
    label: string;
    value: string;
  }[];
  tags: Tag[];
  dataModelId?: string;
}

interface AdditionalField {
  key: string;
  label: string;
}

export type FindingFormValues = {
  newFinding: Finding;
  globalIdentifiers: GlobalIdentifiers;
  assetFindings: AssetFinding[];
  additionalFields: AdditionalField[];
};

export const ManualFindingCreationForm = () => {
  const { history, findings, toaster, application } = useInject();
  const { key: findingKey } = useParams<{ key?: string }>();
  const existingFinding = useSuspense(findings.getManualFinding, { key: findingKey });

  const defaultValues = useMemo(
    () => convertFindingToFormValues(existingFinding || ({} as ManualFindingRequest)),
    [findingKey]
  );

  const handleSubmit = async (data: FindingFormValues) => {
    const finding = convertFormValuesToFinding(data);

    try {
      findingKey ? await findings.update(findingKey, finding) : await findings.create(finding);
      toaster.success(
        !findingKey ? 'Finding successfully created!' : 'Changes successfully saved!'
      );
      const path = application.isFeatureEnabled(FeatureFlag.SettingsNewLayout)
        ? '/manual-findings'
        : '/settings/manual-findings';
      history.push(path);
    } catch {
      const errorMessage = !findingKey
        ? 'Finding could not be saved'
        : 'Changes could not be saved';
      return toaster.error(
        <ErrorToast>
          {errorMessage} <HelpModalButton />
        </ErrorToast>
      );
    }
  };

  return (
    <FormContext
      form={FormLayoutV2}
      onSubmit={handleSubmit}
      mode="onSubmit"
      defaultValues={defaultValues}>
      <FormContent />
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <Button variant={Variant.SECONDARY} size={Size.LARGE} onClick={history.goBack}>
            Cancel
          </Button>
          <SubmitButton />
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
    </FormContext>
  );
};

function SubmitButton() {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button type="submit" size={Size.LARGE} loading={isSubmitting}>
      Save
    </Button>
  );
}

const ErrorToast = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10rem;
`;
