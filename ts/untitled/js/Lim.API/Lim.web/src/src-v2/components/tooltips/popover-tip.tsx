import _ from 'lodash';
import styled from 'styled-components';
import { Popover } from '@src-v2/components/tooltips/popover';

export const PopoverTip = ({ title, children, linkText, placement = 'bottom-start', ...props }) => {
  if (_.isEmpty(title) && _.isEmpty(children)) {
    return <Container {...props}>{linkText}</Container>;
  }

  return (
    <Popover
      delay={200}
      placement={placement}
      content={
        <>
          {title && <Popover.Head>{title}</Popover.Head>}
          {children}
        </>
      }>
      <Container {...props}>{linkText}</Container>
    </Popover>
  );
};

const Container = styled.span`
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export default PopoverTip;
