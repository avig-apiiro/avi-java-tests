import { Fragment, Suspense } from 'react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { FlexibleBoundary } from '@src-v2/components/layout';
import { OopsSomethingWrongLayout } from '@src-v2/components/layout/general-error-layouts/oops-something-wrong-layout';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StyledProps } from '@src-v2/types/styled';
import { ErrorBoundary } from './error-boundary';

export function AsyncBoundary({
  defaultsContainer: DefaultsContainer = Fragment,
  pendingFallback = (
    <DefaultsContainer>
      <DefaultPendingFallback />
    </DefaultsContainer>
  ),
  errorFallback = (
    <DefaultsContainer>
      <DefaultErrorFallback />
    </DefaultsContainer>
  ),
  extraInfo = null,
  children,
}) {
  return (
    <Suspense fallback={pendingFallback}>
      <ErrorBoundary fallback={errorFallback} extraInfo={extraInfo}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

export const DefaultPendingFallback = styled((props: StyledProps) => (
  <FlexibleBoundary {...props}>
    <LogoSpinner data-loading />
  </FlexibleBoundary>
))`
  ${LogoSpinner} {
    flex-grow: 1;
  }
`;

export function DefaultErrorFallback(props) {
  const { application } = useInject();

  if (application.isFeatureEnabled(FeatureFlag.EmptyStates)) {
    return <OopsSomethingWrongLayout />;
  }
  return <FlexibleBoundary {...props}>Oops... Something went wrong</FlexibleBoundary>;
}
