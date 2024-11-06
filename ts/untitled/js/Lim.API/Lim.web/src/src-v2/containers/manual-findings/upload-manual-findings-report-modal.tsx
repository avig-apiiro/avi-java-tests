import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { FieldErrorDisplay } from '@src-v2/components/forms/field-error-display';
import { InputControl, UploadFileControl } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Modal } from '@src-v2/components/modals';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading4, Heading5, Paragraph, SubHeading4 } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { useExportCsv } from '@src-v2/hooks/use-export-csv';
import { StubAny } from '@src-v2/types/stub-any';

interface UploadManualFindingReportModalProps {
  onClose: () => void;
  onSubmit: (data: StubAny) => void;
}

export const UploadManualFindingReportModal = styled(
  ({ onSubmit, onClose, ...props }: UploadManualFindingReportModalProps) => {
    const { toaster, findings } = useInject();
    const [validationErrors, setValidationErrors] = useState([]);
    const [validationWarnings, setValidationWarnings] = useState([]);

    const handleSubmit = async (data: any) => {
      try {
        const shouldVerify = validationWarnings.length === 0;
        let result;

        if (shouldVerify) {
          result = await findings.uploadManualFindingsCsv({ ...data, verifyOnly: true });
          const { Warnings: warnings } = result || {};

          if (warnings?.length > 0) {
            setValidationWarnings(warnings);
            return;
          }
        }

        await findings.uploadManualFindingsCsv({ ...data, verifyOnly: false });
        showSuccessMessage();
        onClose();
      } catch (error: any) {
        handleUploadError(error);
      }
    };

    const showSuccessMessage = () => {
      toaster.success(
        <>
          <Heading4>Report uploaded</Heading4>
          <SubHeading4>Processing your finding may take a few moments</SubHeading4>
        </>
      );
    };

    const handleUploadError = (error: any) => {
      const { Errors: errors } = error?.response?.data || {};

      if (errors) {
        setValidationErrors(errors);
      } else {
        toaster.error('An error occurred while uploading the report.');
      }
    };
    const clearValidationResults = () => {
      setValidationErrors([]);
      setValidationWarnings([]);
    };

    return (
      <ConfirmationModal
        {...props}
        title="Upload findings report"
        confirmOnClose
        submitText={validationWarnings.length > 0 ? 'Accept and submit' : 'Submit'}
        onSubmit={handleSubmit}
        onClose={onClose}>
        <UploadManualFindingReportContent
          validationErrors={validationErrors}
          validationWarnings={validationWarnings}
          clearValidationResult={clearValidationResults}
        />
      </ConfirmationModal>
    );
  }
)`
  width: 155rem;
  min-width: 115rem;

  ${Modal.Header} {
    padding-bottom: 1rem;
  }
`;

interface UploadManualFindingReportContentProps {
  validationErrors: string[];
  validationWarnings: string[];
  clearValidationResult: () => void;
}

export const UploadManualFindingReportContent = ({
  validationErrors,
  validationWarnings,
  clearValidationResult,
}: UploadManualFindingReportContentProps) => {
  const { watch, setValue } = useFormContext();
  const { findings } = useInject();
  const selectedManualFindingFile = watch('file');

  const [handleExport, exportLoading] = useExportCsv(() => findings.downloadCsvTemplate());

  useEffect(() => {
    clearValidationResult();
    setValue('reportName', selectedManualFindingFile?.name.replace(/\.csv.*/, ''));
  }, [selectedManualFindingFile]);

  return (
    <UploadManualFindingReportContainer>
      <FormLayoutV2.Label>
        <Heading5>Apiiro CSV template</Heading5>
        <Paragraph>
          Download the Apiiro template to ensure your data meets the required standards
        </Paragraph>
        <Button
          variant={Variant.PRIMARY}
          size={Size.LARGE}
          onClick={handleExport}
          loading={exportLoading}
          startIcon="Import">
          Download template
        </Button>
      </FormLayoutV2.Label>
      <FormLayoutV2.Label required>
        <Heading5>Report file</Heading5>
        <Paragraph>You must use the Apiiro CSV template</Paragraph>
      </FormLayoutV2.Label>
      <UploadManualFindingReportUploadFileWrapper>
        <UploadFileControl
          name="file"
          label="Upload report"
          accept=".csv"
          rules={{ required: true }}
        />
        {validationErrors.length > 0 &&
          validationErrors.map((validationError, index) => (
            <FieldErrorDisplay key={index} error={{ message: validationError }} />
          ))}
        {validationWarnings.length > 0 &&
          validationWarnings.map((validationWarning, index) => (
            <FieldErrorDisplay key={index} error={{ message: validationWarning }} lavel="warning" />
          ))}
      </UploadManualFindingReportUploadFileWrapper>
      <FormLayoutV2.Label required>
        <Heading5>Report name</Heading5>
        <InputControl
          name="reportName"
          placeholder="Enter a report name..."
          rules={{ required: true }}
        />
      </FormLayoutV2.Label>
    </UploadManualFindingReportContainer>
  );
};

const UploadManualFindingReportContainer = styled.div`
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${Paragraph} {
    color: var(--color-blue-gray-55);
    margin-bottom: 0;
  }
`;

const UploadManualFindingReportUploadFileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -3rem;
`;
