import { Instance, Props } from 'tippy.js';

const allTooltipInstances = [] as Instance[];

interface ExtendedProps extends Props {
  hideOthersOnOpen?: boolean;
}

export const hideOthersOnOpenPlugin = {
  name: 'hideOthersOnOpen',
  defaultValue: true,
  fn: (instance: Instance<ExtendedProps>) => {
    return {
      onCreate() {
        allTooltipInstances.push(instance);
      },
      onShow() {
        if (instance.props.hideOthersOnOpen) {
          allTooltipInstances.forEach(tip => {
            if (tip !== instance) {
              tip.hide();
            }
          });
        }
      },
      onDestroy() {
        const index = allTooltipInstances.indexOf(instance);
        if (index !== -1) {
          allTooltipInstances.splice(index, 1);
        }
      },
    };
  },
};
