import { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import ApiiroLogoImage from '@src-v2/assets/apiiro-logo.svg';
import emptyBox from '@src-v2/assets/images/empty-state/empty-box.svg';
import NoResultsFlashlight from '@src-v2/assets/images/empty-state/no-results-flashlight.svg';
import { ErrorAnimation } from '@src-v2/components/animations/error-animation';
import { EmptyLayout } from '@src-v2/components/layout/empty-layout';
import { UnauthorizationLayout } from '@src-v2/components/layout/general-error-layouts/unauthorization-layout';
import { ContactUsLink } from '@src-v2/components/links';
import { Heading2, Paragraph, Title } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';

type ErrorLayoutPropsType = {
  title?: ReactNode;
  children?: ReactNode;
  animation?: () => ReactElement;
  contactUs?: ReactNode;
};

export const _ErrorLayout = styled(
  ({
    title,
    children,
    animation: Animation = ErrorAnimation,
    contactUs = 'Please contact your admin or Apiiro support at',
    ...props
  }: ErrorLayoutPropsType) => (
    <EmptyLayout {...props}>
      <Animation />
      {title && <Heading>{title}</Heading>}
      {children}
      {contactUs && (
        <ContactUs>
          {contactUs} <ContactUsLink />
        </ContactUs>
      )}
    </EmptyLayout>
  )
)`
  ${Paragraph}:first-of-type {
    margin-top: 5rem;
  }
`;

const Heading = styled(Title)`
  font-size: 2.25em;
  font-weight: 500;
  margin: 8rem 0 2rem;
`;

const ContactUs = styled(Paragraph)`
  margin-top: 4rem;
`;

const NoResults = styled(({ children, ...props }: StyledProps) => {
  return (
    <div {...props}>
      <NoResultsFlashlight />
      {children ?? 'No results found'}
    </div>
  );
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
  transform: translateY(100%);

  &[data-contained] {
    transform: translateY(0);
  }
`;

export const ErrorLayout = assignStyledNodes(_ErrorLayout, {
  NoResults,
});

const _GeneralErrorLayout = styled(
  ({
    image: Image = emptyBox,
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
    return (
      <div {...props}>
        <Container>
          <Image />
          <Heading2>{title}</Heading2>
          <Description>{description}</Description>
          {children}
        </Container>
      </div>
    );
  }
)`
  width: 100%;
  height: calc(100vh - 30rem);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;

  ${Heading2} {
    margin-bottom: 1rem;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  text-align: center;
  white-space: break-spaces;
  margin-bottom: 3rem;
`;

const Text = styled.span`
  text-align: center;
  white-space: break-spaces;
`;

const ApiiroLogo = styled(ApiiroLogoImage)`
  width: fit-content;
  height: 6rem;
  position: absolute;
  top: 10rem;
  left: 10rem;
`;

export const GeneralErrorLayout = assignStyledNodes(_GeneralErrorLayout, {
  Text,
  ApiiroLogo,
});

// TODO: will be removed once EmptyStates feature flag is off
export const TempUnauthorizedLayout = () => {
  const { application } = useInject();
  if (application.isFeatureEnabled(FeatureFlag.EmptyStates)) {
    return <UnauthorizationLayout />;
  }
  return <ErrorLayout title="You are not authorized to view this content" />;
};
