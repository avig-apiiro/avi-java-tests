import styled from 'styled-components';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Indicator } from '@src-v2/types/exposure-path';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const ExposurePathIndicatorIcon = ({ indicator }: { indicator?: Indicator }) => {
  switch (indicator?.type) {
    case 'Provider':
      return <VendorIcon name={indicator.name} size={Size.XSMALL} />;
    case 'Svg':
      return (
        <IndicatorIcon
          data-state={dataAttr(Boolean(indicator.state), indicator.state)}
          name={indicator.name}
          size={Size.XSMALL}
        />
      );
    default:
      return null;
  }
};

// noinspection CssUnresolvedCustomProperty
const IndicatorIcon = styled(SvgIcon)`
  --circle-svg-color: var(--color-blue-gray-50);
  color: var(--circle-svg-color);

  &[data-state='Positive'] {
    --circle-svg-color: var(--color-green-45);
  }

  &[data-state='Negative'] {
    --circle-svg-color: var(--color-red-50);
  }
`;
