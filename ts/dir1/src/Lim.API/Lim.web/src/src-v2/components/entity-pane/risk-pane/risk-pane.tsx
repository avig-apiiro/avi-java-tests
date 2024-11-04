import { IObjectDidChange } from 'mobx';
import { ReactNode } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { EntityContextProvider } from '@src-v2/components/entity-pane/entity-context-provider';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { useInject } from '@src-v2/hooks';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';
import { BaseDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

type NavigationValue = 'evidence' | 'remediation' | 'timeline' | 'relatedFindings';

export interface RiskPaneProps {
  triggerKey: string;
  riskObserver?: (change: IObjectDidChange<RiskTriggerSummaryResponse>) => void;
  onClose?: () => void;
}

export interface BaseRiskPaneProps<
  TRisk extends RiskTriggerSummaryResponse,
  TElement extends BaseElement = BaseElement,
  TFinding extends LightweightFindingResponse = never,
> extends PaneProps {
  header: ReactNode;
  riskDataFetcher?: ({ key }: { key: string }) => Promise<TRisk>;
  elementDataFetcher?: ({ risk }: { risk: TRisk }) => Promise<TElement>;
  findingDataFetcher?: ({
    dataModelReference,
  }: {
    dataModelReference: BaseDataModelReference;
  }) => Promise<TFinding>;
  navigation?: NavigationValue[];
  children: ReactNode;
}

export function RiskPane<
  TRisk extends RiskTriggerSummaryResponse,
  TElement extends BaseElement = BaseElement,
  TFinding extends LightweightFindingResponse = LightweightFindingResponse,
>({
  header,
  triggerKey,
  riskDataFetcher,
  elementDataFetcher,
  findingDataFetcher,
  riskObserver,
  navigation = ['evidence', 'remediation', 'timeline'],
  children,
  ...props
}: RiskPaneProps & BaseRiskPaneProps<TRisk, TElement, TFinding>) {
  const { risks } = useInject();
  const [scrolled, onScroll] = useDetectScrolling();
  return (
    <Pane {...props}>
      <AsyncBoundary>
        <EntityContextProvider
          triggerKey={triggerKey}
          riskDataFetcher={
            riskDataFetcher ??
            (risks.getTrigger as unknown as ({ key }: { key: string }) => Promise<TRisk>)
          }
          elementDataFetcher={elementDataFetcher}
          findingDataFetcher={findingDataFetcher}
          riskObserver={riskObserver}>
          <PaneStickyHeader scrolled={scrolled} navigation={navigation}>
            {header}
          </PaneStickyHeader>

          <PaneBody onScroll={onScroll}>
            <AsyncBoundary>{children}</AsyncBoundary>
          </PaneBody>
        </EntityContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}
