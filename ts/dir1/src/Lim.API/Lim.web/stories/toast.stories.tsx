import { Meta } from '@storybook/react';
import { useMemo } from 'react';
import { Button } from '../src/src-v2/components/button-v2';
import { SuccessToast, Toastify } from '../src/src-v2/components/toastify';
import { ExternalLink } from '../src/src-v2/components/typography';
import { CloseToastButton } from '../src/src-v2/containers/bootstrap';
import { useInject } from '../src/src-v2/hooks';

export default {
  title: 'Components/Toast Options',
  argTypes: {
    msg: {
      control: {
        type: 'string',
      },
    },
    toastType: {
      control: {
        type: 'select',
      },
      options: ['info', 'warning', 'error', 'success'],
    },
  },
} as Meta;

const ToastTemplate = args => {
  const { toaster } = useInject();
  const getToaster = useMemo(() => {
    switch (args.toastType) {
      case 'success':
        return toaster.success;
      case 'warning':
        return toaster.warning;
      case 'error':
        return toaster.error;
      default:
        return toaster.info;
    }
  }, [args.toastType]);
  const reactJSX = useMemo(
    () => (
      <SuccessToast>
        An aggregated test was created successfully! <ExternalLink href="">View test</ExternalLink>
      </SuccessToast>
    ),
    []
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 'fit-content', gap: '1rem' }}>
      <Toastify
        // @ts-expect-error
        closeButton={CloseToastButton}
        closeOnClick={false}
        hideProgressBar={false}
        draggable={false}
      />
      <Button onClick={() => getToaster(`${args.msg} ${args.toastType}!`, { autoClose: false })}>
        Open toast
      </Button>
      <Button onClick={() => getToaster(reactJSX, { autoClose: false })}>
        Open toast with react element as message
      </Button>
    </div>
  );
};
export const ToastToggle = ToastTemplate.bind({});
ToastToggle.args = {
  msg: 'Toast testing',
  toastType: 'info',
};
