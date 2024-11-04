import { ReactNode, createContext, useContext } from 'react';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FindingDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';

const Context = createContext<{ finding: LightweightFindingResponse }>(null);

export function FindingContextProvider({
  findingDataModelReference,
  children,
}: {
  findingDataModelReference: FindingDataModelReference;
  children: ReactNode;
}) {
  const { findings } = useInject();

  const finding = useSuspense(findings.getFinding, findingDataModelReference);

  return <Context.Provider value={{ finding }}>{children}</Context.Provider>;
}

export function useFindingContext() {
  return useContext(Context);
}
