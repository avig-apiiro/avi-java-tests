import styled from 'styled-components';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Link, SubHeading4 } from '@src-v2/components/typography';
import { ThenTypeInfoTooltip } from '@src-v2/containers/workflow/then/info-tooltip';
import { messagingProviders, ticketingProviders } from '@src-v2/containers/workflow/types/types';
import { WorkflowSelectMenuControl } from '@src-v2/containers/workflow/workflow-editor-controls';
import { hasSvgIcon } from '@src-v2/data/icons';
import { StubAny } from '@src-v2/types/stub-any';

export const ThenTypeMenu = styled(
  ({
    thenState,
    index,
    availableOptions,
    optionsSchema,
    isThenTypeEnabled,
    stepName,
    resetThenState,
    ...props
  }) => {
    if (thenState.type === 'BuildReportViolations') {
      return (
        <span {...props}>
          <SubHeading4>Break the build flow</SubHeading4>
          <ThenTypeInfoTooltip type={thenState.type} />
        </span>
      );
    }
    return (
      <WorkflowSelectMenuControl
        {...props}
        key={`then.${index}-${thenState.type}`}
        items={availableOptions}
        itemToString={(key: StubAny) => optionsSchema[key]?.displayName}
        isItemDisabled={(item: StubAny) => !isThenTypeEnabled(item)}
        disabledTooltip={DisabledTooltipContent}
        name={`${stepName}.type`}
        onItemClick={(selectedItem: StubAny) => {
          selectedItem !== thenState.type && resetThenState(selectedItem);
        }}
        renderItem={(item: StubAny) => {
          const name = item?.name ?? item;
          return (
            <VendorItem data-disabled="true">
              <VendorIcon
                name={name}
                fallback={
                  name === 'Questionnaire' ? (
                    <SvgIcon name="Apiiro" />
                  ) : hasSvgIcon(name) ? (
                    <SvgIcon name={name} />
                  ) : (
                    <SvgIcon name="Api" />
                  )
                }
              />
              {optionsSchema[name]?.displayName ?? name}
              {name === thenState.type && <ThenTypeInfoTooltip type={thenState.type} />}
            </VendorItem>
          );
        }}
      />
    );
  }
)`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${SubHeading4} {
    color: var(--color-blue-gray-70);
  }
`;

const VendorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const DisabledTooltipContent = ({ item }: StubAny) => {
  return messagingProviders.includes(item) || ticketingProviders.includes(item) ? (
    <>
      Enable projects under <Link to="/connectors/manage">Connectors Manage</Link>
    </>
  ) : null;
};
