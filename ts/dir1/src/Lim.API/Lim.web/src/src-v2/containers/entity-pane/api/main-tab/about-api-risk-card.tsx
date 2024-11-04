import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { LanguageIcon, SvgIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ExternalLink, ListItem, UnorderedList } from '@src-v2/components/typography';
import { HighlightedCode } from '@src-v2/containers/commit/common-componnets';
import { ApiSecurityHintLine } from '@src-v2/containers/entity-pane/api/main-tab/api-security-hint-line';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { humanizeLanguage } from '@src-v2/types/enums/language';
import { LeanCodeProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { humanize } from '@src-v2/utils/string-utils';
import { entries, isTypeOf } from '@src-v2/utils/ts-utils';

export function AboutApiRiskCard(props: ControlledCardProps) {
  const { risk, element, relatedProfile } = useApiPaneContext();

  const securityControlsByType = useMemo(
    () => entries(_.groupBy(element.apiControlsInfo, 'type')),
    [element]
  );

  const isViolatedInputValidation =
    element.violatedInputValidationCodeParsingTarget &&
    isTypeOf<LeanCodeProfile>(relatedProfile, 'validationCodeParsingTargets') &&
    relatedProfile.validationCodeParsingTargets.includes(
      element.violatedInputValidationCodeParsingTarget
    );

  return (
    <ControlledCard title={`About this ${risk ? 'risk' : 'API'}`} {...props}>
      <EvidenceLinesWrapper>
        {risk && <RiskLevelWidget isExtendedWidth risk={risk} />}
        {risk && (
          <>
            <DiscoveredEvidenceLine isExtendedWidth risk={risk} />
            <DueDateEvidenceLine isExtendedWidth risk={risk} />
          </>
        )}

        <EvidenceLine isExtendedWidth label="Introduced through">
          <CodeReferenceLink repository={relatedProfile} codeReference={element.codeReference} />
        </EvidenceLine>
        {Boolean(element.insights?.length) && (
          <EvidenceLine isExtendedWidth label="Insights">
            <ElementInsights insights={element.insights} />
          </EvidenceLine>
        )}
        {Boolean(element.moduleName) && (
          <EvidenceLine isExtendedWidth label="Module">
            <SvgIcon name="Module" /> {element.moduleName}
          </EvidenceLine>
        )}
        {Boolean(element.language) && (
          <EvidenceLine isExtendedWidth label="Technology">
            <Tooltip content={humanizeLanguage(element.language)}>
              <ApiLanguageIcon name={element.language} />
            </Tooltip>
          </EvidenceLine>
        )}
        {element.apiFramework && (
          <EvidenceLine isExtendedWidth label="API framework">
            {element.apiFramework}
          </EvidenceLine>
        )}

        {element.isViolatingAuthorization && (
          <ApiSecurityHintLine isExtendedWidth violationType="Authorization" />
        )}
        {isViolatedInputValidation && (
          <ApiSecurityHintLine isExtendedWidth violationType="InputValidation" />
        )}

        {securityControlsByType.map(([securityControlType, securityControlsInfo]) => (
          <EvidenceLine isExtendedWidth label={humanize(securityControlType)}>
            <SecurityList>
              {securityControlsInfo.map((controlInfo, index) => (
                <ListItem key={index}>
                  {controlInfo.description}{' '}
                  <ExternalLink
                    href={generateCodeReferenceUrl(relatedProfile, controlInfo.codeReference)}>
                    View control in code
                  </ExternalLink>
                </ListItem>
              ))}
            </SecurityList>
          </EvidenceLine>
        ))}

        {element.codeReference && element.language && (
          <EvidenceLine isExtendedWidth label="API declaration">
            <HighlightedCode
              code={element.codeReference.methodSignature ?? element.codeReference.methodName}
              language={element.language}
            />
          </EvidenceLine>
        )}
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}

const ApiLanguageIcon = styled(LanguageIcon)`
  background-color: var(--color-blue-30);
  padding: 1rem;
  border-radius: 100vmax;
`;

const SecurityList = styled(UnorderedList)`
  overflow-x: hidden;
  padding: 0;

  ${ListItem} {
    max-width: 100%;
    word-break: break-word;
  }
`;
