import { animated, easings, useSpring } from '@react-spring/web';
import { MouseEvent, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Caption1 } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { isTypeOf } from '@src-v2/utils/ts-utils';

type LabelToggleProps = {
  labels: string[];
  defaultLabel: string;
  onChange: (label: string, event: MouseEvent<HTMLDivElement>) => void;
} & StyledProps;

export function LabelToggle({ labels, defaultLabel, onChange, ...props }: LabelToggleProps) {
  const defaultIndex = useMemo(
    () => (defaultLabel ? Math.max(labels.indexOf(defaultLabel), 0) : 0),
    [labels, defaultLabel]
  );
  const [style, api] = useSpring(() => ({
    left: 0,
    width: 0,
    config: { easings: easings.easeInOutCirc, duration: 200 },
  }));
  const [selectedIndex, setSelectIndex] = useState(defaultIndex);
  const ref = useRef<HTMLDivElement>(null);

  const animateThumb = useCallback(
    (optionElement: Element, immediate?: boolean) =>
      isTypeOf<HTMLElement>(optionElement, 'offsetLeft') &&
      api.start({
        left: optionElement.offsetLeft - 1,
        width: optionElement.offsetWidth + 2,
        immediate,
      }),
    [api]
  );

  useLayoutEffect(() => {
    animateThumb(ref.current.children[defaultIndex], true);
    setSelectIndex(defaultIndex);
  }, [labels]);

  return (
    <Container ref={ref} {...props}>
      {labels.map((option, index) => (
        <Option
          key={index}
          data-selected={dataAttr(index === selectedIndex)}
          onClick={event => {
            if (index !== selectedIndex) {
              setSelectIndex(index);
              animateThumb(event.currentTarget);
              onChange?.(option, event);
            }
          }}>
          {option}
        </Option>
      ))}
      <Thumb style={style} />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  display: inline-flex;
  background-color: var(--color-white);
  border: 0.25rem solid var(--color-blue-gray-30);
  border-radius: 100vmax;
  user-select: none;
`;

const Thumb = styled(animated.div)`
  position: absolute;
  inset: -0.5rem;
  z-index: 0;
  background-color: var(--color-blue-25);
  border: 0.25rem solid var(--color-blue-65);
  border-radius: 100vmax;
  box-sizing: content-box;
`;

const Option = styled(Caption1)`
  height: 6rem;
  position: relative;
  z-index: 10;
  padding: 0 3rem;
  color: var(--color-blue-gray-55);
  line-height: 6rem;
  transition: color 200ms;
  cursor: pointer;

  &[data-selected],
  &:hover {
    color: var(--color-blue-gray-70);
  }
`;
