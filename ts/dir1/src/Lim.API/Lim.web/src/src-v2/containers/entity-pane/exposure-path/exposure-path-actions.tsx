import _ from 'lodash';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExposurePathNodeType } from '@src-v2/types/exposure-path';

export const ExposurePathActions = ({
  nodeDatum,
  variant = Variant.SECONDARY,
  size = Size.SMALL,
  onShow,
  onHide,
}: {
  nodeDatum: ExposurePathNodeType;
  variant?: Variant;
  size?: Size;
  onShow?: () => void;
  onHide?: () => void;
}) => {
  const trackAnalytics = useTrackAnalytics();
  return (
    <ActionsDropdownMenu size={size} variant={variant} onShow={onShow} onHide={onHide}>
      {_.map(nodeDatum.actions, (action, index) => (
        <Dropdown.Item
          key={index}
          onClick={() => {
            window.open(action.link, '_blank', 'noopener,noreferrer');
            trackAnalytics(AnalyticsEventName.ActionClicked, {
              [AnalyticsDataField.ActionType]: 'Click node link',
              [AnalyticsDataField.ExposureNodeLinkAction]: action.text,
            });
          }}>
          {action.text}
        </Dropdown.Item>
      ))}
    </ActionsDropdownMenu>
  );
};

const ActionsDropdownMenu = styled(DropdownMenu)`
  align-self: center;
`;
