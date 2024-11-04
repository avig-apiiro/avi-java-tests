import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { Collapsible } from '@src-v2/components/collapsible';
import { CheckboxToggle, FormContext, InputV2 } from '@src-v2/components/forms';
import { RadioGroupControl, TextareaControl } from '@src-v2/components/forms/form-controls';
import { BaseIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Paragraph, Strong, Title } from '@src-v2/components/typography';
import { useWorkflowEditor } from '@src-v2/containers/workflow/hooks/use-workflow-editor';
import { Workflow } from '@src-v2/containers/workflow/workflow';
import {
  SubmitWorkflowButton,
  WorkflowInputControl,
} from '@src-v2/containers/workflow/workflow-editor-controls';
import { WorkflowTriggerOptions } from '@src-v2/containers/workflow/workflows-trigger-options';
import { FormProperties } from '@src-v2/data/form-properties';
import { useGroupProperties, useInject, useToggle } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const WorkflowModal = ({
  closeModal,
  workflowData = null,
  isNewWorkflow = false,
  ...props
}: {
  closeModal: () => void;
  workflowData?: StubAny;
  isNewWorkflow?: boolean;
}) => {
  const [submitError, setSubmitError] = useState<{
    message: any;
  }>();
  const [formProps, modalProps] = useGroupProperties(props, FormProperties);
  const { handleSubmit, ...methods } = useForm({ ...formProps, mode: 'onBlur' });

  const handleClose = useCallback(() => {
    if (submitError) {
      setSubmitError(null);
      return;
    }
    closeModal();
  }, [submitError, methods.formState.isDirty, closeModal]);

  const { workflows, toaster } = useInject();

  const saveWorkflow = useCallback(async (data: StubAny) => {
    try {
      await workflows.saveWorkflow(data);
      closeModal();
      toaster.success('Workflow saved successfully!');
    } catch (error) {
      toaster.error(renderError(error, 'Failed saving workflow!'));
    }
  }, []);

  const createWorkflow = useCallback(async (data: StubAny) => {
    try {
      await workflows.createWorkflow(data);
      closeModal();
      toaster.success('Workflow created successfully!');
    } catch (error) {
      toaster.error(renderError(error, 'Failed creating workflow!'));
    }
  }, []);

  const [isCollapsed, toggleCollapse] = useToggle(false);

  const handleTestWebhook = useCallback(
    async ({ url, authorizationHeader }: { url: string; authorizationHeader: string }) => {
      try {
        await workflows.testWebhook(url, authorizationHeader);
        toaster.success('Webhook successfully validated');
      } catch (error) {
        toaster.error('Failed validating Webhook');
      }
    },
    [workflows]
  );

  return (
    <ModalContainer autoFocus {...modalProps} onClose={handleClose} onClick={stopPropagation}>
      <FormContext
        defaultValues={{ ...workflowData, isReadonly: false }}
        onSubmit={isNewWorkflow ? createWorkflow : saveWorkflow}
        displayPromptOnLeave={false}>
        <Modal.Header>
          <WorkflowTitleContainer>
            <Strong>New Workflow &middot;</Strong>
            <WorkflowInputControl
              name="name"
              defaultValue={workflowData?.fullDisplayName}
              placeholder="Type a Workflow name..."
              rules={{ required: true }}
            />
          </WorkflowTitleContainer>
          <IconButton name="CloseLarge" onClick={handleClose} />
        </Modal.Header>
        <Modal.Content>
          <Workflow isReadonly={false} />
          <CollapseControl>
            {/* @ts-expect-error */}
            <CheckboxToggle value={isCollapsed} onClick={toggleCollapse} />{' '}
            <Title>More options</Title>
          </CollapseControl>
          <MoreOptions open={isCollapsed}>
            <WorkflowTriggerOptions />
            <DescriptionContainer>
              <Title>Remediation action</Title>
              <Paragraph> Enter remediation actions to add them to the created messages</Paragraph>
              <TextareaControl
                name="workflowDescription"
                placeholder="Type here..."
                charLimit={500}
                rows={3}
              />
            </DescriptionContainer>
          </MoreOptions>
          <WorkflowModalActions>
            <Button onClick={closeModal} size={Size.LARGE} variant={Variant.SECONDARY}>
              Cancel
            </Button>
            <TestWebhookButton handleTestWebhook={handleTestWebhook} />
            <SubmitWorkflowButton />
          </WorkflowModalActions>
        </Modal.Content>
      </FormContext>
    </ModalContainer>
  );
};

const TestWebhookButton = ({ handleTestWebhook }: { handleTestWebhook: StubAny }) => {
  const { workflowSection }: { workflowSection: StubAny[] } = useWorkflowEditor({ step: 'then' });
  const webhookData = workflowSection?.find(item => item.type === 'Webhook');

  if (!webhookData) {
    return null;
  }

  return (
    <Button
      size={Size.LARGE}
      variant={Variant.PRIMARY}
      onClick={(event: StubAny) => {
        event.preventDefault();
        handleTestWebhook({
          url: webhookData.value,
          authorizationHeader:
            webhookData.additionalProperties.find(
              (item: StubAny) => item.type === 'AuthorizationHeader'
            )?.value ?? '',
        });
      }}>
      Test Webhook
    </Button>
  );
};

export const ModalContainer = styled(props => <Modal {...props} />)`
  width: 325rem;
  min-width: 325rem;
  overflow: hidden;
  padding: 8rem;
  border-radius: 3rem;

  ${LogoSpinner} {
    height: 6rem;
  }

  ${Modal.Content} {
    padding: 0;
  }

  ${Paragraph} {
    font-size: var(--font-size-s);
    font-weight: 300;
  }

  ${RadioGroupControl.Label} {
    font-size: var(--font-size-s);
    font-weight: 300;
  }

  ${Modal.Header} {
    position: relative;
    padding: 0 0 4rem 0;
    align-items: start;
    border-bottom: 0.25rem solid var(--color-blue-gray-20);

    ${Strong} {
      font-weight: 500;
      white-space: nowrap;
      margin-top: 1rem;
    }

    ${InputV2} {
      max-width: 100%;
      width: 265rem;
    }

    > ${IconButton} {
      margin-top: 1.5rem;
    }
  }

  ${Modal.Title} {
    display: flex;
    align-items: center;
    gap: 3rem;
    font-size: var(--font-size-m);

    > ${BaseIcon} {
      width: 8rem;
      height: 8rem;
      margin-top: 2rem;
    }
  }

  ${Modal.Content} {
    padding-top: 0;
  }
`;

export const WorkflowModalActions = styled.div`
  padding: 0;
  display: flex;
  justify-content: flex-end;
  gap: 4rem;
  width: 100%;
  margin-top: 4rem;
`;

const WorkflowTitleContainer = styled.div`
  display: flex;
  align-items: start;
  gap: 2rem;
  justify-content: center;

  ${Strong} {
    font-size: var(--font-size-l);
    font-weight: 600;
  }
`;

const MoreOptions = styled(Collapsible)`
  ${Collapsible.Body} {
    display: flex;
  }

  ${Collapsible.Chevron} {
    display: none;
  }
`;

const CollapseControl = styled.div`
  display: flex;
  align-items: center;
  padding: 4rem 0;
  gap: 3rem;

  ${Title} {
    font-size: var(--font-size-m);
    font-weight: 400;
    margin-bottom: 0;
  }

  ${CheckboxToggle} {
    display: flex;
    align-items: center;
  }
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: var(--color-blue-gray-60);
  flex-grow: 1;

  ${Title} {
    color: var(--color-blue-gray-70);
    font-size: var(--font-size-s);
    font-weight: 600;
    margin-bottom: 0;
  }
`;

const renderError = (error: StubAny, defaultMessage: string) => {
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error.data === 'string') {
    return `${defaultMessage} ${error.data}`;
  }

  if (typeof error.response === 'string') {
    return `${defaultMessage} ${error.response}`;
  }

  if (typeof error.response?.data === 'string') {
    return `${defaultMessage} ${error.response.data}`;
  }

  if (typeof error.response?.data?.message === 'string') {
    return `${defaultMessage} ${error.response.data.message}`;
  }

  return defaultMessage;
};
