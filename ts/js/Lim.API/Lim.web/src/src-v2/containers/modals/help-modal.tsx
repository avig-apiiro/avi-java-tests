import { ReactNode, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { Input } from '@src-v2/components/forms';
import {
  InputControl,
  SelectControlV2,
  TextareaControl,
  UploadFileControl,
} from '@src-v2/components/forms/form-controls';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink, Heading, Heading2, Paragraph } from '@src-v2/components/typography';
import { SupportModal } from '@src-v2/containers/modals/support-modal';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr } from '@src-v2/utils/dom-utils';

// This cannot be used inside a tooltip as the modal elements disappears once the tooltip closed
export const HelpModalButton = ({ label = 'Contact Support' }) => {
  const [modalElement, setModal, closeModal] = useModalState();

  return (
    <>
      <TriggerModalButton onClick={() => setModal(<HelpModal onClose={closeModal} />)}>
        {label}
      </TriggerModalButton>
      {modalElement}
    </>
  );
};

type SelectedOptionType = {
  label: string;
  key: string;
  titleText: string;
  icon: ReactNode;
  featureFlag?: FeatureFlag;
};

export function HelpModal({
  subject = '',
  ...props
}: {
  subject?: string;
  option?: SelectedOptionType;
  onClose?: () => void;
}) {
  const { analytics, application } = useInject();
  const [selectedOption, setSelectedOption] = useState(props.option ?? TOPIC_OPTIONS[0]);
  const [severity, setSeverity] = useState(SEVERITY_LIST[2]);
  const [wasSubmit, setWasSubmit] = useState(false);

  const filteredTopics = TOPIC_OPTIONS.filter(
    topic => !topic.featureFlag || application.isFeatureEnabled(topic.featureFlag)
  );

  const handleSubmit = () => {
    setWasSubmit(true);
    analytics.track('Action Clicked', {
      'Action Type': 'Help modal send',
      Type: selectedOption.key,
    });
  };

  const headerTitle = useMemo(
    () =>
      wasSubmit ? (
        <Heading2>Thanks for submitting your {selectedOption.titleText}!</Heading2>
      ) : (
        <Heading2>Hi there! What’s on your mind?</Heading2>
      ),
    [wasSubmit, selectedOption]
  );

  const modalHeaderTitle = useMemo(
    () => (
      <ModalHeaderContainer>
        <SvgIcon name={wasSubmit ? 'CheckColored' : 'HelpWheel'} />
        <span>{headerTitle}</span>
      </ModalHeaderContainer>
    ),
    [wasSubmit, headerTitle]
  );

  return (
    <ModalWrapper
      {...props}
      title={modalHeaderTitle}
      shouldCloseOnSubmit={false}
      onSubmit={handleSubmit}
      showFooter={!wasSubmit}
      data-submitted={dataAttr(wasSubmit)}>
      {wasSubmit ? (
        <SubmittedContent type={selectedOption.key} onClose={props.onClose} />
      ) : (
        <>
          <SelectContainer>
            <Label>Select a topic</Label>
            <SelectControlV2
              name="type"
              options={filteredTopics}
              defaultValue={selectedOption}
              clearable={false}
              option={({ data: { label, icon } }: { data: SelectedOptionType }) => (
                <>
                  {icon}
                  {label}
                </>
              )}
              onChange={(data: SelectedOptionType) => setSelectedOption(data)}
            />
          </SelectContainer>
          {selectedOption?.key !== 'FeatureRequest' &&
            selectedOption?.key !== 'RequestIntegration' && (
              <SeverityURLContainer>
                <SelectContainer>
                  <ScreenUrlInfoContainer>
                    Screen URL
                    <InfoTooltip content="This URL was added to give us context for your question. Edit as needed" />
                  </ScreenUrlInfoContainer>
                  <InputControl
                    name="screenUrl"
                    defaultValue={window.location.href}
                    placeholder={window.location.href}
                  />
                </SelectContainer>
                {selectedOption?.key === 'ReportAnIssue' && (
                  <SeveritySelectContainer>
                    <Label>Severity</Label>
                    <SelectControlV2
                      name="severity"
                      options={SEVERITY_LIST}
                      defaultValue={severity}
                      clearable={false}
                      searchable={false}
                      option={({ data: { label, icon } }: { data: SelectedOptionType }) => (
                        <>
                          {icon}
                          {label}
                        </>
                      )}
                      onChange={(data: StubAny) => setSeverity(data)}
                    />
                  </SeveritySelectContainer>
                )}
              </SeverityURLContainer>
            )}
          <SelectContainer>
            <Label required>
              {selectedOption?.key === 'RequestIntegration' ? 'Integration name' : 'Subject'}
            </Label>
            <InputControl
              name="subject"
              defaultValue={subject}
              placeholder={
                selectedOption?.key === 'RequestIntegration'
                  ? 'Type an integration name...'
                  : 'What is your issue?'
              }
              rules={{ required: true }}
            />
          </SelectContainer>
          <SelectContainer>
            <Label required>Description</Label>
            <TextareaControl
              name="description"
              placeholder={
                selectedOption?.key === 'RequestIntegration'
                  ? 'Let us know what do you need this integration for...'
                  : 'Tell us about the issue you encountered'
              }
              rules={{ required: true }}
              rows={3}
            />
          </SelectContainer>
          {selectedOption?.key !== 'RequestIntegration' && (
            <SelectContainer>
              <LabelWithDescrption>
                <Label>Upload a file</Label>
                <SubLabel>You can add a file up to 5mb (.jpeg/.jpg/.png or .log format)</SubLabel>
              </LabelWithDescrption>
              <UploadFileControl name="file" accept=".jpg, .jpeg, .png, .log" />
            </SelectContainer>
          )}
          <Paragraph>
            For more info, visit the{' '}
            <ExternalLink href="https://docs.apiiro.com">User Docs</ExternalLink> or our{' '}
            <ExternalLink href="https://apiiro.atlassian.net/servicedesk/customer/user/requests?page=1&statuses=open">
              Technical Support Portal
            </ExternalLink>
          </Paragraph>
        </>
      )}
    </ModalWrapper>
  );
}

const SubmittedContent = styled(({ type, onClose, ...props }) => {
  let description = (
    <span>
      One of our engineers will email you in the next couple of days. Click{' '}
      <ExternalLink href="https://apiiro.atlassian.net/servicedesk/customer/user/requests?page=1&statuses=open">
        here
      </ExternalLink>{' '}
      to check the status of your request.
    </span>
  );

  if (type === 'FeatureRequest' || type === 'RequestIntegration') {
    description = (
      <span>
        The Apiiro Product Management team will review it and get in touch if they need
        clarification. You can check the status of your feature request in the{' '}
        <ExternalLink href="https://apiiro.atlassian.net/servicedesk/customer/user/requests?page=1&statuses=open">
          Tech support portal
        </ExternalLink>{' '}
        or ask your Customer Success Manager for updates, as needed.
      </span>
    );
  }

  return (
    <div {...props}>
      {description}
      <Button onClick={onClose} variant={Variant.SECONDARY}>
        Close
      </Button>
    </div>
  );
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 7rem;
  color: var(--color-blue-gray-70);
  gap: 8rem;
`;

const SelectContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${Input} {
    width: 100%;
    border-radius: 2rem;
    font-size: var(--font-size-s);
  }

  ${Label} {
    font-size: var(--font-size-s);
  }
`;

const LabelWithDescrption = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const ModalHeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: var(--font-size-xl);
  font-weight: 600;
  gap: 2rem;

  ${BaseIcon} {
    width: 8rem;
    height: 8rem;
  }
`;

const ModalWrapper = styled(SupportModal)`
  width: 180rem;
  border-radius: 3rem;

  ${Modal.Header} {
    padding: 8rem 8rem 0;
    border: none;

    ${IconButton} {
      top: 4rem;
    }
  }

  ${Modal.Content} {
    display: flex;
    flex-direction: column;
    padding: 6rem 8rem;
    gap: 6rem;
  }

  ${Modal.Footer} {
    padding: 0 8rem 6rem;
    border: none;
  }

  ${Heading} {
    font-size: var(--font-size-m);
    font-weight: 600;
  }

  ${Paragraph} {
    font-size: var(--font-size-xs);
  }
`;

const TriggerModalButton = styled.div`
  text-decoration: underline;
  cursor: pointer;
`;

const SeverityURLContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 6rem;
`;

const SeveritySelectContainer = styled(SelectContainer)`
  width: 100rem;
`;

const SubLabel = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-blue-gray-60);
`;

const ScreenUrlInfoContainer = styled(Label)`
  gap: 1rem;
`;

export const TOPIC_OPTIONS: SelectedOptionType[] = [
  {
    label: 'Report an issue',
    key: 'ReportAnIssue',
    titleText: 'issue',
    icon: <SvgIcon name="Megaphone" />,
  },
  {
    label: 'Request a feature',
    key: 'FeatureRequest',
    titleText: 'feature request',
    icon: <SvgIcon name="LoveItAdd" />,
  },
  {
    label: 'Ask a question',
    key: 'Question',
    titleText: 'question',
    icon: <SvgIcon name="QuestionCircleColored" />,
  },
  {
    label: 'Request an integration',
    key: 'RequestIntegration',
    titleText: 'integration request',
    icon: <SvgIcon name="Connect" />,
  },
];

const SEVERITY_LIST = [
  { label: 'Critical', key: 'Urgent', icon: <RiskIcon riskLevel="Critical" /> },
  { label: 'High', key: 'High', icon: <RiskIcon riskLevel="High" /> },
  { label: 'Medium', key: 'Medium', icon: <RiskIcon riskLevel="Medium" /> },
  { label: 'Low', key: 'Low', icon: <RiskIcon riskLevel="Low" /> },
];
