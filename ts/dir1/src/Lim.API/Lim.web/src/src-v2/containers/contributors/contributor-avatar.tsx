import isEmpty from 'lodash/isEmpty';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { Size } from '@src-v2/components/types/enums/size';

const Circled = css`
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  border-radius: 100vmax;
`;

export const FontBodyBold = css`
  color: var(--default-text-color);
  font-size: var(--font-size-m);
  line-height: 6rem;
  font-weight: 700;
`;
const StyledImage = styled.img<{
  border?: string;
}>`
  ${Circled};
  width: var(--circle-size);
  height: var(--circle-size);
  max-width: unset;
  ${props => props.border && `border: '0.4rem solid var(--color-white)',`};

  --circle-size: 6rem;

  &[data-size=${Size.XXSMALL}] {
    --circle-size: 2rem;
  }

  &[data-size=${Size.XSMALL}] {
    --circle-size: 6rem;
  }

  &[data-size=${Size.SMALL}] {
    --circle-size: 7rem;
    padding: 1.3rem;
    font-size: var(--font-size-sm);
  }

  &[data-size=${Size.MEDIUM}] {
    --circle-size: 8rem;
  }

  &[data-size=${Size.LARGE}] {
    --circle-size: 9rem;
  }

  &[data-size=${Size.XLARGE}] {
    --circle-size: 10rem;
  }

  &[data-size=${Size.XXLARGE}] {
    --circle-size: 13rem;
  }
`;

const StyledCircle = styled(Circle)<{ border: string }>`
  ${props => props.border && `border: 2px solid var(--color-white)`};
  background-color: #c0c9ce;
`;

interface ContributorAvatarProps {
  name: string;
  avatarUrl: string;
  size: Size;
  border?: string;
}

export const ContributorAvatar = ({ name, avatarUrl, size, border }: ContributorAvatarProps) => {
  const [isAvatarUrlValid, setIsAvatarUrlValid] = useState(
    avatarUrl && avatarUrl.startsWith('https://')
  );

  return avatarUrl && isAvatarUrlValid ? (
    <StyledImage
      src={avatarUrl}
      onError={() => setIsAvatarUrlValid(false)}
      alt={name}
      border={border}
      data-size={size}
    />
  ) : (
    <StyledCircle size={size} border={border}>
      {!isEmpty(name) && name[0].toUpperCase()}
    </StyledCircle>
  );
};
