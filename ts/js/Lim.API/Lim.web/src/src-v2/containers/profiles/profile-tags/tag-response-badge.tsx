import styled from 'styled-components';
import { Badge, BadgeProps } from '@src-v2/components/badges';
import { ClampText } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading5 } from '@src-v2/components/typography';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';

type TagResponseBadgeProps = {
  tag: TagResponse;
  size?: BadgeProps['size'];
};

export const TagResponseBadge = styled(
  ({ tag, size = Size.SMALL, ...props }: TagResponseBadgeProps) => {
    return (
      <Badge {...props} size={size}>
        <TagResponseDisplay value={tag} />
      </Badge>
    );
  }
)`
  display: flex;
  max-width: 70rem;
  align-items: center;

  ${Heading5} {
    max-width: 35rem;
  }
`;

export const TagResponseDisplay = ({ value }: { value: TagResponse }) => {
  return (
    <>
      {Boolean(value.provider) && <VendorIcon size={Size.XXSMALL} name={value.provider} />}
      <Heading5>
        <ClampText>{value.name}</ClampText>
      </Heading5>
      &nbsp;:&nbsp;<ClampText>{value.value}</ClampText>
    </>
  );
};
