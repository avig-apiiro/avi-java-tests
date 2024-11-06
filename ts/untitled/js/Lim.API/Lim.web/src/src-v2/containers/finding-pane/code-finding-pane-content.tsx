import { useMemo } from 'react';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { AboutLightweightFindingCard } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/about-lightweight-finding-card';
import { CodeFindings } from '@src-v2/types/inventory-elements/code-findings';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { isEmptyDate } from '@src-v2/utils/datetime-utils';

export const CodeFindingPaneContent = (props: ControlledCardProps) => {
  const { element } = useEntityPaneContext<CodeFindings>();

  const finding = useMemo(() => convertBaseElementToCodeFinding(element), [element]);

  return <AboutLightweightFindingCard finding={finding} type="finding" {...props} />;
};

function convertBaseElementToCodeFinding(element: CodeFindings): LightweightFindingResponse {
  return {
    associatedObjects: [],
    finding: {
      type: element.type,
      globalIdentifiers: element.complianceFrameworkReferences.map(
        complianceFrameworkReference => ({
          description: complianceFrameworkReference.description,
          link: complianceFrameworkReference.url,
          identifier: complianceFrameworkReference.identifier,
          identifierType: complianceFrameworkReference.securityComplianceFramework,
        })
      ),
      sourceRawFindings: [
        {
          rawFields: [
            {
              key: 'Severity',
              value: element.externalSeverity,
            },
            {
              key: 'likelihood',
              value: element.likelihood,
            },
            {
              key: 'First detected',
              value: !isEmptyDate(element.firstDetectionTime)
                ? element.firstDetectionTime.toString()
                : null,
            },
            {
              key: 'Introduced on',
              value: !isEmptyDate(element.FirstOccurenceTime)
                ? element.FirstOccurenceTime.toString()
                : null,
            },
            {
              key: 'Finding type',
              value: element.externalType,
            },
            {
              key: 'Status',
              value: element.externalStatus,
            },
          ],
          provider: element.provider,
        },
      ],
      sourceProviders: [element.provider],
      severity: element.severity,
      realizationTime: element.timeMaterialized,
      description: element.description,
      confidence: element.confidence,
      id: element.entityId,
      remediation: { descriptionMarkdown: element.remediation, title: '', links: [] },
      title: element.issueTitle,
      complianceFrameworkReferences: element.complianceFrameworkReferences,
      tags: element.tags,
    },
  };
}
