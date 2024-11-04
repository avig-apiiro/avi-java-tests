import _ from 'lodash';
import { Fragment } from 'react';
import styled from 'styled-components';
import { CircleIcon } from '@src-v2/components/circle-icon';
import { LanguageStack } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { Counter } from '@src-v2/components/counter';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Caption1, ExternalLink } from '@src-v2/components/typography';
import { NodeToElementIcon } from '@src-v2/containers/entity-pane/exposure-path/element-icon';
import { ExposurePathActions } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-actions';
import { ExposurePathIndicatorIcon } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-indicator-icon';
import { Language } from '@src-v2/types/enums/language';
import { ExposurePathNodeType, NodeProperty } from '@src-v2/types/exposure-path';
import { StyledProps } from '@src-v2/types/styled';

export const NodePopover = ({
  exposurePath,
  position,
  onUnpin,
}: {
  exposurePath: ExposurePathNodeType;
  position: 'left' | 'right';
  onUnpin: () => void;
}) => (
  <Container
    position={position}
    onClick={event => {
      event.stopPropagation();
    }}>
    <TopSection>
      <NodeToElementIcon node={exposurePath} isPopover={true} />
      <PropertyLine line={_.first(_.first(exposurePath.propertiesSections)?.properties)} />
      {onUnpin && (
        <UnpinButton size={Size.LARGE} icon="UnPin" variant={Variant.TERTIARY} onClick={onUnpin} />
      )}
      {exposurePath.actions?.length > 0 && (
        <ExposurePathActions
          nodeDatum={exposurePath}
          size={Size.LARGE}
          variant={Variant.TERTIARY}
        />
      )}
    </TopSection>

    {exposurePath.propertiesSections.map((section, sectionIndex) => (
      <Fragment key={sectionIndex}>
        <Separator />
        <div>
          <div>{section.name}</div>
          <div>
            {section.properties
              ?.filter((_, lineIndex) => !(sectionIndex === 0 && lineIndex === 0))
              .map((line: NodeProperty, lineIndex) => <PropertyLine line={line} key={lineIndex} />)}
          </div>
        </div>
      </Fragment>
    ))}
  </Container>
);

const PropertyLine = ({ line }: { line: NodeProperty }) => {
  if (_.isEmpty(line.languages) && !line.text) {
    return null;
  }

  return (
    <LineContainer>
      <Caption1>{line.title}</Caption1>
      <Line>
        {line.languages ? (
          <LanguagesLine line={line} />
        ) : line.link ? (
          <LinkLine line={line} />
        ) : (
          <DefaultLine line={line} />
        )}
      </Line>
    </LineContainer>
  );
};

const LanguagesLine = ({ line }: { line: NodeProperty }) => (
  <>
    <ExposurePathIndicatorIcon indicator={line.indicator} />
    <LanguageStack
      languages={line.languages.map(language => ({
        name: Language[language.key],
        icon: language.key,
        tooltip: language.value
          ? `${language.value}% ${Language[language.key]}`
          : Language[language.key],
      }))}
    />
  </>
);
const DefaultLine = ({ line }: { line: NodeProperty }) => (
  <>
    <ExposurePathIndicatorIcon indicator={line.indicator} />
    <ClampText>{line.text}</ClampText>
    {line.additionalText?.length > 0 && (
      <Tooltip
        content={line.additionalText.map((text, index) => (
          <div key={index}>{text}</div>
        ))}>
        <Counter>+ {line.additionalText.length}</Counter>
      </Tooltip>
    )}
  </>
);
const LinkLine = ({ line }: { line: NodeProperty }) => (
  <ExternalLink href={line.link}>
    <ClampText>{line.text || line.link}</ClampText>
  </ExternalLink>
);

const Container = styled.div<StyledProps<{ position: string }>>`
  position: absolute;

  display: flex;
  flex-direction: column;
  font-size: var(--font-size-s);
  gap: 2rem;
  width: 79rem;
  padding: 4rem;
  max-height: 99rem;
  overflow: auto;

  color: var(--color-blue-gray-70);
  background-color: var(--color-white);
  box-shadow: var(--elevation-6);
  border-radius: 3rem;
  user-select: text;
  z-index: 100;
  margin: 2rem;
  right: ${props => (props.position === 'right' ? 0 : undefined)};
`;

const LineContainer = styled.div`
  width: 71rem;

  &:not(:last-child) {
    margin-bottom: 3rem;
  }

  ${Caption1} {
    color: var(--color-blue-gray-55);
    margin-bottom: 1rem;
  }

  ${ClampText.name} {
    font-weight: 400;
  }
`;

const TopSection = styled.div`
  height: 8rem;
  display: flex;
  gap: 2rem;

  ${ExternalLink}, ${LineContainer} {
    min-width: 10rem;
    flex: 1;
  }

  ${Caption1} {
    margin-bottom: 0;
  }
`;

const Line = styled.div`
  display: flex;
  align-items: center;
  column-gap: 1rem;

  ${ExternalLink} {
    max-width: 71rem;
  }
`;

const Separator = styled.div`
  width: 71rem;
  margin: 2rem 0;
  border: solid 0.25rem var(--color-blue-gray-20);
`;

const UnpinButton = styled(CircleIcon)`
  align-self: center;
  cursor: pointer;
  margin-left: auto;
`;
