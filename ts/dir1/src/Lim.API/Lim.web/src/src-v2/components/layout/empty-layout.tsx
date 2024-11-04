import { ReactNode, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import legoImage from '@src-v2/assets/images/empty-state/lego-create.svg';
import { Divider } from '@src-v2/components/divider';
import { FlexibleBoundary } from '@src-v2/components/layout/containers';
import { Heading2 } from '@src-v2/components/typography';
import { assignStyledNodes } from '@src-v2/types/styled';

export const EmptyLayout = styled(FlexibleBoundary)`
  min-height: 100vh;
`;

export const _ConnectEmptyLayout = styled(
  ({
    image: Image = legoImage,
    title,
    description,
    children,
    ...props
  }: {
    image?: any;
    title: JSX.Element | string;
    description: JSX.Element | string;
    children?: ReactNode;
  }) => {
    const ref = useRef<HTMLDivElement>();
    const [dividerHeight, setDividerHeight] = useState(0);

    useEffect(() => {
      setDividerHeight(ref.current?.offsetHeight);
    }, [ref.current]);
    return (
      <div {...props}>
        <Container ref={ref}>
          <Image style={{ minWidth: '60rem' }} />
          <Divider vertical style={{ height: dividerHeight - 96 }} />
          <Content>
            <Heading2>{title}</Heading2>
            <Description>{description}</Description>
            {children}
          </Content>
        </Container>
      </div>
    );
  }
)`
  width: 100%;
  height: calc(100vh - 40rem);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-bottom: 3rem;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 19rem;

  ${Divider} {
    padding: 16rem 0;
  }
`;

const Content = styled.div`
  max-width: 100rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const Text = styled.span``;

export const ConnectEmptyLayout = assignStyledNodes(_ConnectEmptyLayout, {
  Text,
});
