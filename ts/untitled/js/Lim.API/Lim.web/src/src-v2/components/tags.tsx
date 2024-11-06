import { forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { HtmlMarkdown } from '@src-v2/components/html-markdown';
import { Markdown } from '@src-v2/components/markdown';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, Paragraph } from '@src-v2/components/typography';
import { getRiskColor, getTextOverRiskColor } from '@src-v2/data/risk-data';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const Tag = styled(
  forwardRef<HTMLSpanElement, StyledProps<{ size?: Size; onClick?: () => void }>>(
    ({ size = Size.SMALL, ...props }, ref) => <span {...props} ref={ref} data-size={size} />
  )
)`
  width: fit-content;
  display: inline-block;
  max-width: 100%;
  color: var(--default-text-color);
  font-weight: 400;
  white-space: nowrap;
  text-overflow: ellipsis;
  border-radius: 100vmax;
  background-color: var(--color-blue-30);
  cursor: ${props => (props.onClick ? 'pointer' : 'inherit')};
  overflow: hidden;

  &[data-size=${Size.XXSMALL}] {
    height: 4rem;
    padding: 0 1.5rem;
    line-height: 3.5rem;
    font-size: 2.75rem;
  }

  &[data-size=${Size.XSMALL}] {
    height: 5rem;
    padding: 0 2rem;
    line-height: 4.5rem;
    font-size: var(--font-size-xs);
  }

  &[data-size=${Size.SMALL}] {
    height: 6rem;
    padding: 0 2rem;
    line-height: 5.5rem;
    font-size: var(--font-size-s);
  }

  &[data-size=${Size.MEDIUM}] {
    height: 7rem;
    padding: 0 3rem;
    line-height: 6.5rem;
    font-size: var(--font-size-s);
  }

  &[data-size=${Size.LARGE}] {
    height: 8rem;
    padding: 0 4rem;
    line-height: 7.5rem;
    font-size: var(--font-size-m);
  }
`;

export const ProcessTag = styled(Tag)<{ selected?: boolean }>`
  background-color: ${props =>
    props.onClick && !props.selected ? 'var(--color-blue-gray-20)' : 'var(--color-green-40)'};

  &:hover {
    background-color: ${props =>
      props.onClick ? 'var(--color-green-30)' : 'var(--color-green-40)'};
  }
`;

const KnowExploit = ({ isTopExploitable }) => {
  const knownExploitString = useMemo(() => {
    return isTopExploitable ? (
      <span>This is an actively exploited vulnerability.</span>
    ) : (
      <span>This package has vulnerabilities that are actively exploited.</span>
    );
  }, [isTopExploitable]);

  return (
    <>
      {knownExploitString}
      <span>
        Source:{' '}
        <ExternalLink href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog">
          CISA.gov
        </ExternalLink>
      </span>
    </>
  );
};

const DeprecatedLicense = () => (
  <>
    <span>This package is using a retired license</span>
    <span>
      Source:{' '}
      <ExternalLink href="https://opensource.org/licenses">Open Source Initiative</ExternalLink>
    </span>
  </>
);

export const InsightTag = styled(
  ({
    insight: { description, badge, sentiment },
    onClick,
    hint,
    disableTooltip,
    isTopExploitable = false,
    ...props
  }) => {
    const tooltipParas = [];

    if (badge === 'Known exploit') {
      tooltipParas.push(<KnowExploit isTopExploitable={isTopExploitable} />);
    } else if (badge === 'Deprecated license') {
      tooltipParas.push(<DeprecatedLicense />);
    } else if (badge === 'Used in code') {
      tooltipParas.push(<HtmlMarkdown>{description}</HtmlMarkdown>);
    } else {
      if (description) {
        tooltipParas.push(
          ...description
            .split('\n')
            .map(descriptionLine => (
              <Paragraph>
                {descriptionLine ? <Markdown>{descriptionLine}</Markdown> : <>&nbsp;</>}
              </Paragraph>
            ))
        );
      }

      if (hint) {
        tooltipParas.push(<InsightHintParagraph>{hint}</InsightHintParagraph>);
      }
    }

    return (
      <Tooltip
        appendTo={document.body}
        content={tooltipParas.map((tip, index) => (
          <TooltipContent key={index}>{tip}</TooltipContent>
        ))}
        disabled={!(tooltipParas.length > 0) || disableTooltip}
        interactive={
          badge === 'Known exploit' ||
          badge === 'Deprecated license' ||
          badge === 'Low count maintainers' ||
          badge === 'Used in code'
        }>
        <Tag
          {...props}
          size={Size.XSMALL}
          onClick={onClick}
          data-sentiment={sentiment}
          data-clickable={dataAttr(Boolean(onClick))}>
          {badge}
        </Tag>
      </Tooltip>
    );
  }
)`
  & {
    color: var(--color-blue-gray-60);
    border: 0.25rem solid var(--color-blue-gray-25);
    background-color: var(--color-blue-gray-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-blue-gray-20);
      }

      &:active {
        background-color: var(--color-blue-gray-25);
      }
    }
  }

  &[data-sentiment='Positive'] {
    color: var(--color-green-65);
    border-color: var(--color-green-35);
    background-color: var(--color-green-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-green-20);
      }

      &:active {
        background-color: var(--color-green-25);
      }
    }
  }

  &[data-sentiment='Negative'] {
    color: var(--color-red-60);
    border-color: var(--color-red-35);
    background-color: var(--color-red-10);

    &[data-clickable] {
      &:hover {
        background-color: var(--color-red-15);
      }

      &:active {
        background-color: var(--color-red-20);
      }
    }
  }
`;

const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  ${ExternalLink} {
    text-decoration: underline;
  }

  span {
    white-space: pre;
  }
`;

const InsightHintParagraph = styled(Paragraph)`
  font-weight: 500;
`;

type RiskTagProps = {
  riskLevel: string;
  size?: Size;
};

export const RiskTag = styled(
  forwardRef<HTMLSpanElement, StyledProps<RiskTagProps>>(
    ({ riskLevel, size = Size.XSMALL, ...props }, ref) => <Tag {...props} ref={ref} size={size} />
  )
)`
  min-width: 10.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: var(--font-size-xs);
  color: ${getTextOverRiskColor};
  line-height: unset;
  padding: 0 2rem;
  background-color: ${getRiskColor};
  overflow: visible;

  &[data-size=${Size.SMALL}],
  &[data-size=${Size.MEDIUM}] {
    font-weight: 600;
  }

  &[data-size=${Size.LARGE}] {
    font-size: var(--font-size-m);
    font-weight: 600;
  }
`;

export const SeverityTag = styled(
  forwardRef<HTMLSpanElement, StyledProps<RiskTagProps>>(
    ({ riskLevel, size = Size.XSMALL, ...props }, ref) => (
      <Tag {...props} ref={ref} data-color={riskLevel?.toLowerCase()} size={size} />
    )
  )
)`
  background-color: var(--color-blue-gray-10);
  border: 0.25rem solid var(--color-blue-gray-30);

  &[data-color='critical'] {
    color: var(--color-pink-65);
    border: 0.25rem solid var(--color-pink-60);
    background-color: var(--color-pink-10);
  }

  &[data-color='high'] {
    color: var(--color-red-60);
    border: 0.25rem solid var(--color-red-35);
    background-color: var(--color-red-10);
  }

  &[data-color='medium'] {
    color: var(--color-orange-65);
    border: 0.25rem solid var(--color-orange-50);
    background-color: var(--color-orange-10);
  }

  &[data-color='low'] {
    color: var(--color-yellow-65);
    border: 0.25rem solid var(--color-yellow-40);
    background-color: var(--color-yellow-10);
  }

  &[data-color='positive'] {
    color: var(--color-green-65);
    border: 0.25rem solid var(--color-green-45);
    background-color: var(--color-green-10);
  }
`;
