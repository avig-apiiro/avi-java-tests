import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Carousel } from '@src-v2/components/carousel';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Paragraph, Subtitle, Title } from '@src-v2/components/typography';
import { SuggestedCarouselItemProps } from '@src-v2/types/multi-branch';
import { StyledProps } from '@src-v2/types/styled';

export const SuggestedCarouselItem = styled(
  ({
    name,
    reasons,
    monitorDisabled,
    onClick,
    maxMonitorSize,
    ...props
  }: StyledProps & SuggestedCarouselItemProps) => {
    return (
      <Carousel.Item {...props}>
        <Title>{name}</Title>
        <Subtitle>
          {reasons?.map((reason, index) => (
            <Paragraph key={index}>
              {reason.toLowerCase() === 'name'
                ? 'The branch name is a well-known convention'
                : 'The branch is frequently used'}
            </Paragraph>
          ))}
        </Subtitle>
        <Tooltip
          content={`Only ${maxMonitorSize} branches can be monitored`}
          disabled={!monitorDisabled}>
          <Button
            onClick={monitorDisabled ? null : onClick}
            disabled={monitorDisabled}
            variant={Variant.SECONDARY}>
            Monitor
          </Button>
        </Tooltip>
      </Carousel.Item>
    );
  }
)`
  max-width: 80rem;
  position: relative;
  max-height: 45rem;
  padding: 3rem 5rem;
  border: 0.25rem solid var(--color-blue-gray-25);
  border-radius: 3rem;
  background-color: var(--color-white);

  ${Title} {
    font-size: var(--font-size-m);
    font-weight: 400;
    color: var(--color-blue-gray-70);
    margin-bottom: 0;
  }

  ${Subtitle} {
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-s);
    font-weight: 300;
    color: var(--color-blue-gray-60);

    ${Paragraph} {
      margin: 0;
    }
  }
`;
