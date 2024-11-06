import { select } from 'd3-selection';
import { Point } from 'react-d3-tree';

const dotSquareSize = 20;
const dotRadius = 1;
const dotsPatternId = 'dot-pattern';

export const renderDotsPatternToSvg = (svgSelectorText: string) => {
  const svg = select(svgSelectorText);

  svg
    .insert('pattern', ':first-child')
    .attr('id', dotsPatternId)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', dotSquareSize)
    .attr('height', dotSquareSize)
    .insert('circle', ':first-child')
    .attr('r', dotRadius)
    .attr('cx', dotRadius)
    .attr('cy', dotRadius)
    .attr('fill', getComputedStyle(document.body).getPropertyValue('--color-blue-gray-25'));

  svg
    .insert('rect', ':first-child')
    .attr('fill', 'url(#dot-pattern)')
    .attr('width', '100%')
    .attr('height', '100%');
};

export const updateDotsPatternDimensions = (translate: Point, zoom: number) => {
  select(`#${dotsPatternId}`)
    .attr('x', translate.x)
    .attr('y', translate.y)
    .attr('width', dotSquareSize * zoom)
    .attr('height', dotSquareSize * zoom)
    .selectAll('circle')
    .attr('x', (dotSquareSize * zoom) / 2 - 1 / 2)
    .attr('y', (dotSquareSize * zoom) / 2 - 1 / 2)
    .attr('opacity', Math.min(zoom, 1));
};
