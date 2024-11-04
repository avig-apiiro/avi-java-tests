import { MotionAnimation } from '@src-v2/components/animations/motion-animation';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { EmptyLayout } from '@src-v2/components/layout/empty-layout';
import { ErrorLayout } from '@src-v2/components/layout/error-layout';

export function ConnectionStatus(props) {
  return <ErrorLayout {...props} animation={MotionAnimation} />;
}

export function PageSpinner(props) {
  return (
    <EmptyLayout {...props}>
      <LogoSpinner />
    </EmptyLayout>
  );
}
