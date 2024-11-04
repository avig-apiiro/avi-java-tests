import styled from 'styled-components';
import { ItemProps, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { StubAny } from '@src-v2/types/stub-any';

export const severityItems: ItemProps[] = [
  { label: 'Critical', key: 'Critical', icon: <RiskIcon riskLevel="Critical" /> },
  { label: 'High', key: 'High', icon: <RiskIcon riskLevel="High" /> },
  { label: 'Medium', key: 'Medium', icon: <RiskIcon riskLevel="Medium" /> },
  { label: 'Low', key: 'Low', icon: <RiskIcon riskLevel="Low" /> },
];

export const SeveritySelect = () => (
  <SelectControlV2
    name="newFinding.severity"
    rules={{ required: true }}
    options={severityItems}
    searchable={false}
    clearable={false}
    option={({ data }: { data: StubAny }) => (
      <SeverityWrapper>
        {data.icon}
        {data.label}
      </SeverityWrapper>
    )}
    placeholder="Select risk level..."
  />
);

const SeverityWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
