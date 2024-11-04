import styled from 'styled-components';
import { DynamicButton } from '@src-v2/components/buttons';
import { SvgIcon } from '@src-v2/components/icons';
import { useInject } from '@src-v2/hooks';
import { StyledProps } from '@src-v2/types/styled';

export const GithubSignInButton = styled((props: StyledProps) => {
  const { github } = useInject();
  return (
    <DynamicButton {...props} onClick={github.redirectToGithubOAuth}>
      <SvgIcon name="Github" />
      Sign in with GitHub
    </DynamicButton>
  );
})`
  height: 8rem;
  color: var(--color-blue-gray-10);
  font-size: var(--font-size-s);
  border-radius: 5rem;
  background-color: var(--color-black);
  gap: 2rem;

  &:hover {
    background-color: var(--color-blue-gray-70);
  }
`;
