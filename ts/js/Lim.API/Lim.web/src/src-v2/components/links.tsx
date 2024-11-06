import styled from 'styled-components';
import { useInject } from '@src-v2/hooks';

export function ContactUsLink() {
  const { customerSupportEmail } = useInject().application;
  return (
    <EmailLink href={`mailto:${customerSupportEmail}`} target="_blank">
      {customerSupportEmail}
    </EmailLink>
  );
}

const EmailLink = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;
