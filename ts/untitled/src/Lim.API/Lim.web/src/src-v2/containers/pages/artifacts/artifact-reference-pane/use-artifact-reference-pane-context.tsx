import { ReactNode, createContext, useContext } from 'react';
import { useInject, useSuspense } from '@src-v2/hooks';
import { Artifact } from '@src-v2/types/artifacts/artifacts-types';
import { ArtifactDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

const Context = createContext<{ artifact: Artifact }>(null);

export function ArtifactReferenceContextProvider({
  artifactDataModelReference,
  children,
}: {
  artifactDataModelReference: ArtifactDataModelReference;
  children: ReactNode;
}) {
  const { artifacts } = useInject();

  const artifact = useSuspense(artifacts.getArtifact, {
    key: artifactDataModelReference?.artifactMultiSourcedEntityKey,
  });

  return <Context.Provider value={{ artifact }}>{children}</Context.Provider>;
}

export function useArtifactReferenceContextProvider() {
  return useContext(Context);
}
