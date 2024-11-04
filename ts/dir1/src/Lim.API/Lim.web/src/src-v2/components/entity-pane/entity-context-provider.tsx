import _ from 'lodash';
import { isObservableObject, makeAutoObservable, observe } from 'mobx';
import { ReactNode, createContext, useContext, useEffect } from 'react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import {
  BaseRiskPaneProps,
  RiskPaneProps,
} from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { useInject, useSuspense } from '@src-v2/hooks';
import { GetInventoryParams } from '@src-v2/services';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { LightweightFindingResponse } from '@src/src-v2/types/inventory-elements/lightweight-finding-response';

const getEntityContext = _.once(<
  TElement extends BaseElement = BaseElement,
  TRisk extends RiskTriggerSummaryResponse = RiskTriggerSummaryResponse,
  TFinding extends LightweightFindingResponse = never,
>() =>
  createContext<{
    element: TElement;
    risk?: TRisk;
    relatedProfile: LeanConsumableProfile;
    applications: LeanApplication[];
    orgTeams: LeanOrgTeamWithPointsOfContact[];
    finding?: TFinding;
  }>(null)
);

export function useEntityPaneContext<
  TElement extends BaseElement = BaseElement,
  TRisk extends RiskTriggerSummaryResponse = RiskTriggerSummaryResponse,
  TFinding extends LightweightFindingResponse = LightweightFindingResponse,
>() {
  return useContext(getEntityContext<TElement, TRisk, TFinding>());
}

const defaultFindingFetch = <TFinding extends LightweightFindingResponse>() =>
  Promise.resolve<TFinding>(null);

const defaultElementFetch = <TElement extends BaseElement>() => Promise.resolve<TElement>(null);

export function EntityContextProvider<
  TElement extends BaseElement = BaseElement,
  TRisk extends RiskTriggerSummaryResponse = RiskTriggerSummaryResponse,
  TFinding extends LightweightFindingResponse = LightweightFindingResponse,
>({
  triggerKey,
  riskDataFetcher,
  elementDataFetcher = defaultElementFetch<TElement>,
  findingDataFetcher = defaultFindingFetch<TFinding>,
  riskObserver,
  children,
}: Pick<
  BaseRiskPaneProps<TRisk, TElement, TFinding>,
  'riskDataFetcher' | 'elementDataFetcher' | 'findingDataFetcher' | 'children'
> &
  Omit<RiskPaneProps, 'onClose'>) {
  const RiskContext = getEntityContext<TElement, TRisk, TFinding>();

  const risk = useSuspense(triggerKey ? riskDataFetcher : () => Promise.resolve<TRisk>(null), {
    key: triggerKey,
  });

  const element = useSuspense(elementDataFetcher, { risk });

  const finding = useSuspense(findingDataFetcher, {
    dataModelReference: risk?.dataModelReference,
  });

  if (!isObservableObject(risk)) {
    makeAutoObservable(risk);
  }

  useEffect(() => {
    if (riskObserver && risk && isObservableObject(risk)) {
      return observe(risk, riskObserver);
    }
  }, [risk]);

  return (
    <RiskContext.Provider
      value={{
        risk,
        element,
        finding,
        relatedProfile: risk.relatedEntity,
        applications: risk.applications,
        orgTeams: risk.orgTeams,
      }}>
      <AnalyticsLayer
        analyticsData={{
          [AnalyticsDataField.RuleName]: risk.ruleName,
          [AnalyticsDataField.RiskLevel]: risk.riskLevel?.toString(),
          [AnalyticsDataField.RiskCategory]: risk.riskCategory,
        }}>
        {children}
      </AnalyticsLayer>
    </RiskContext.Provider>
  );
}

export function DiffableEntityContextProvider<TElement extends BaseElement>({
  dataModelReference,
  elementDataFetcher,
  children,
}: {
  dataModelReference: DiffableEntityDataModelReference;
  elementDataFetcher: (props: GetInventoryParams) => Promise<TElement>;
  children: ReactNode;
}) {
  const { inventory } = useInject();
  const ElementContext = getEntityContext<TElement>();
  const [element, { relatedProfile, applications, orgTeams }] = useSuspense([
    [
      elementDataFetcher,
      {
        reference: dataModelReference,
      },
    ] as const,
    [inventory.getElementContext, { dataModelReference }] as const,
  ]);

  return (
    <ElementContext.Provider value={{ element, relatedProfile, applications, orgTeams }}>
      {children}
    </ElementContext.Provider>
  );
}
