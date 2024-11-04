import { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { BaseIcon, StatusIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading, Heading4, Paragraph } from '@src-v2/components/typography';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';

type BannerProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: string;
  children?: ReactNode;
  onClose?: () => void;
};

const _Banner = styled(
  ({ title, description, icon, children, onClose, ...props }: StyledProps<BannerProps>) => (
    <Container {...props}>
      {icon && <StatusIcon size={Size.LARGE} name={icon} />}
      <Banner.Content>
        {title && <Heading4>{title}</Heading4>}
        {description && <Paragraph>{description}</Paragraph>}
      </Banner.Content>
      <Banner.Actions>{children}</Banner.Actions>
      {onClose && <IconButton name="Close" onClick={onClose} />}
    </Container>
  )
)``;

const Container = styled.div`
  display: flex;
  width: 100%;
  margin: 4rem auto;
  padding: 3rem 4rem;
  align-items: flex-start;
  border-radius: 3rem;
  border: 0.25rem solid var(--color-blue-60);
  background-color: var(--color-blue-25);
  gap: 3rem;

  > ${BaseIcon}:first-child {
    color: var(--color-blue-60);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 6rem;

  ${Heading} {
    font-size: var(--font-size-m);
    font-weight: 700;
    margin-bottom: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-grow: 1;
  gap: 3rem;
`;

export const AlertBanner = styled((props: StyledProps<BannerProps>) => (
  <Banner icon="Warning" {...props} />
))`
  border-color: var(--color-red-45);
  background-color: var(--color-red-10);

  > ${BaseIcon}:first-child {
    color: var(--color-red-50);
  }

  ${Button} {
    color: var(--color-white);
    background-color: var(--color-red-50);

    &:hover {
      background-color: var(--color-red-40);
    }
  }
`;

export const WarningBanner = styled((props: StyledProps<BannerProps>) => (
  <Banner icon="Warning" {...props} />
))`
  border-color: var(--color-orange-55);
  background-color: var(--color-orange-15);

  > ${BaseIcon}:first-child {
    color: var(--color-orange-55);
  }

  ${Button} {
    background-color: var(--color-orange-50);

    &:hover {
      background-color: var(--color-orange-40);
    }
  }
`;

export const InfoBanner = styled((props: StyledProps<BannerProps>) => (
  <Banner icon="Info" {...props} size={Size.SMALL} />
))`
  border-color: var(--color-blue-60);
  background-color: var(--color-blue-15);

  > ${BaseIcon}:first-child {
    color: var(--color-blue-60);
    flex-shrink: 0;
  }

  ${Button} {
    color: var(--color-white);
    background-color: var(--color-blue-60);

    &:hover {
      background-color: var(--color-blue-50);
    }
  }
`;

export const Banner = assignStyledNodes(_Banner, {
  Content,
  Actions,
});
