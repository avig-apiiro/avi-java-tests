import React from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { CollapsibleCard } from '@src-v2/components/cards';
import { Chip } from '@src-v2/components/chips';
import { ClampText } from '@src-v2/components/clamp-text';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { Combobox } from '@src-v2/components/forms';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ScoreSelect } from '@src-v2/containers/questionnaire/templates/editor-components';
import { GivenSection } from '@src-v2/containers/workflow/given/given-section';
import { ThenSection } from '@src-v2/containers/workflow/then/then-section';
import { WhenSection } from '@src-v2/containers/workflow/when/when-section';
import { customScrollbar } from '@src-v2/style/mixins';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

type WorkflowCardProps = {
  children: React.ReactNode;
  title: string;
  editWorkflow: () => void;
  deleteWorkflow: () => void;
  duplicateWorkflow: () => void;
  canEdit: boolean;
};
export const Workflow = ({ isReadonly = true }) => {
  return (
    <WorkflowCard.Container data-test-marker="workflow" data-display-only={dataAttr(isReadonly)}>
      <WorkflowContent>
        <AsyncBoundary>
          <GivenSection />
        </AsyncBoundary>
        <AsyncBoundary>
          <WhenSection />
        </AsyncBoundary>
        <AsyncBoundary>
          <ThenSection />
        </AsyncBoundary>
      </WorkflowContent>
    </WorkflowCard.Container>
  );
};

export const WorkflowCard = styled<any>(
  ({
    children,
    title,
    canEdit,
    editWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    ...props
  }: WorkflowCardProps) => {
    return (
      <CollapsibleCard
        {...props}
        title={
          <WorkflowTitle>
            <ClampText>{title}</ClampText>
            <Tooltip
              content="Contact your admin to edit or remove this workflow"
              disabled={canEdit}>
              <DropdownMenu
                onClick={stopPropagation}
                onItemClick={stopPropagation}
                disabled={!canEdit}>
                <Dropdown.Item onClick={editWorkflow}>
                  <SvgIcon name="Edit" /> Edit
                </Dropdown.Item>
                <Dropdown.Item onClick={duplicateWorkflow}>
                  <SvgIcon name="Copy" /> Duplicate
                </Dropdown.Item>
                <Dropdown.Item onClick={deleteWorkflow}>
                  <SvgIcon name="Trash" /> Remove
                </Dropdown.Item>
              </DropdownMenu>
            </Tooltip>
          </WorkflowTitle>
        }>
        {children}
      </CollapsibleCard>
    );
  }
)`
  margin: 1rem 8rem;
`;

const WorkflowContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8rem 0;
  gap: 6rem;

  max-height: 120rem;
  border-bottom: 0.25rem solid var(--color-blue-gray-20);
  overflow: scroll;
  ${customScrollbar}

  [data-display-only] & {
    max-height: 500rem;
    overflow: hidden;
  }
`;

WorkflowCard.Container = styled.div`
  ${(MultiSelect as any).Combobox} {
    padding: 1rem;
    border-radius: 2rem;
    border: 0.25rem solid var(--color-blue-gray-30);
    min-height: 9rem;

    &:hover {
      border-color: var(--color-blue-gray-50);
    }

    &[aria-expanded='true'] {
      border-color: var(--color-blue-65);
    }
  }

  ${(MultiSelect as any).Combobox} input {
    width: 40rem;
  }

  &[data-display-only] ${WorkflowContent} {
    pointer-events: none;
    padding-top: 0;

    ${(MultiSelect as any).Combobox} input {
      display: none;
    }

    ${ScoreSelect} {
      & :before {
        display: none;
      }
    }

    ${Combobox} {
      width: fit-content;
      min-width: unset;
      overflow: auto;
      height: max-content;
      max-height: max-content;

      &:hover {
        border-color: var(--color-blue-gray-30);
        cursor: unset;
      }
    }

    ${Chip} {
      pointer-events: all;
    }

    ${BaseIcon}[data-name="PlusSmall"],
    ${BaseIcon}[data-name="Trash"],
    ${BaseIcon}[data-name="Close"],
    ${BaseIcon}[data-name="And"],
    ${BaseIcon}[data-name="Chevron"] {
      display: none;
    }
  }
`;

const WorkflowTitle = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
