import styled from 'styled-components';
import { Avatar } from '@src-v2/components/avatar';
import { ClampPath, ClampText } from '@src-v2/components/clamp-text';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading, Small } from '@src-v2/components/typography';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export const RiskComponent = ({ item }: { item: RiskTriggerSummaryResponse }) => (
  <>
    <RiskSubtitleComponent item={item} />
    <RiskTitleComponent item={item} />
  </>
);

const RiskTitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) => {
  switch (item.riskType) {
    case 'ContributorNotPushingCode':
    case 'AdminNotPerformingActivity':
      return <PermissionTitleComponent item={item} />;
    case 'TerraformResource':
      return <TerraformResourcTitleComponent item={item} />;
    default:
      return <DefaultTitleComponent item={item} />;
  }
};

const RiskSubtitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) => {
  switch (item.riskType) {
    case 'ContributorNotPushingCode':
    case 'AdminNotPerformingActivity':
      return <PermissionSubtitleComponent item={item} />;
    case 'BranchProtection':
      return <BranchProtectionSubtitleComponent item={item} />;
    case 'Secret':
      return <SecretSubtitleComponent item={item} />;
    case 'TerraformResource':
      return <TerraformResourceSubtitleComponent item={item} />;
    default:
      return <DefaultSubtitleComponent item={item} />;
  }
};

const PermissionTitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) => (
  <SupplyChainRiskNameContainer>
    <Avatar username={item.riskName} size={Size.XSMALL} />
    <RiskComponent.Title>{item.riskName}</RiskComponent.Title>
  </SupplyChainRiskNameContainer>
);

const DefaultTitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) => (
  <RiskComponent.Title>{item.riskName}</RiskComponent.Title>
);

const DefaultSubtitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) =>
  Boolean(item.codeReference?.relativeFilePath) && (
    <RiskComponent.Subtitle>{item.codeReference.relativeFilePath}</RiskComponent.Subtitle>
  );

const PermissionSubtitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) => {
  let message = '';
  if (item.relatedEntity?.repositoryName) {
    message = item.relatedEntity.repositoryName;
    if (item.relatedEntity?.referenceName) {
      message += ` (${item.relatedEntity.referenceName})`;
    }
  }
  return Boolean(message) && <RiskComponent.Subtitle>{message}</RiskComponent.Subtitle>;
};

const BranchProtectionSubtitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) =>
  Boolean(item.relatedEntity?.serverUrl) && (
    <RiskComponent.Subtitle>{item.relatedEntity.serverUrl}</RiskComponent.Subtitle>
  );

const SecretSubtitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) =>
  Boolean(item.codeReference?.relativeFilePath ?? item.displayName) && (
    <RiskComponent.Subtitle>
      {item.codeReference?.relativeFilePath ?? item.displayName}
    </RiskComponent.Subtitle>
  );

const TerraformResourceSubtitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) =>
  Boolean(item.elementKey) && <RiskComponent.Subtitle>{item.elementKey}</RiskComponent.Subtitle>;

const TerraformResourcTitleComponent = ({ item }: { item: RiskTriggerSummaryResponse }) =>
  Boolean(item.elementKey) && (
    <RiskComponent.Title>{item.elementKey.split('/').pop()}</RiskComponent.Title>
  );

const SupplyChainRiskNameContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  text-overflow: ellipsis;

  ${Avatar} {
    width: 5rem;
    height: 5rem;
    font-size: var(--font-size-xxs);
    margin-right: 1rem;
  }
`;

RiskComponent.Subtitle = styled(({ children, ...props }) => (
  <Small {...props}>
    <ClampPath>{children}</ClampPath>
  </Small>
))`
  width: 100%;
`;

RiskComponent.Title = styled(({ children, ...props }) => {
  return (
    <Heading {...props}>
      <ClampText>{children}</ClampText>
    </Heading>
  );
})`
  width: 100%;
  font-size: var(--font-size-s);
  font-weight: 400;
`;
