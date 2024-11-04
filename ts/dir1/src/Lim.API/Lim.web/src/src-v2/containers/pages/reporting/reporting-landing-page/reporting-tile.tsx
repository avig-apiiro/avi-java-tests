import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { ClampText } from '@src-v2/components/clamp-text';
import { Popover } from '@src-v2/components/tooltips/popover';
import { EllipsisText, Paragraph } from '@src-v2/components/typography';
import { previewsIndex } from '@src-v2/containers/pages/reporting/assets/previews/previewsIndex';
import { thumbanilsIndex } from '@src-v2/containers/pages/reporting/assets/thumbnails';

export const ReportTile = styled(({ title, isNew, description, reportName, ...props }) => {
  return (
    <Card {...props}>
      <TitleContainer>
        <EllipsisText>{title}</EllipsisText>
      </TitleContainer>

      <PreviewPopover
        interactive={false}
        noArrow
        maxHeight="7000px"
        placement="right"
        content={
          <img
            height="100%"
            src={previewsIndex[title.split(' ')[0].toLowerCase() as keyof typeof previewsIndex]}
            alt={title}
            loading="lazy"
          />
        }>
        <ThumbnailContainer to={`/reporting/${reportName}`}>
          <Thumbnail
            src={thumbanilsIndex[title.split(' ')[0].toLowerCase() as keyof typeof thumbanilsIndex]}
            alt={title}
          />
        </ThumbnailContainer>
      </PreviewPopover>
      <Paragraph>
        <ClampText lines={2}>{description}</ClampText>
      </Paragraph>
      <TextButton showArrow to={`/reporting/${reportName}`}>
        View report
      </TextButton>
    </Card>
  );
})`
  flex-basis: calc(100% / var(--cards-per-row, 1) - 16px);
  padding: 4rem;
  display: flex;
  flex-direction: column;

  ${TextButton} {
    width: fit-content;
    align-self: flex-end !important;
  }

  ${Paragraph} {
    font-size: var(--font-size-s);
    font-weight: 300;
    height: 15rem;
    margin-top: 2rem;
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 21rem;
  object-fit: cover;
  box-shadow: var(--elevation-0);
  border-radius: 2rem;

  &:hover {
    filter: brightness(0.97);
    cursor: pointer;
    transition: filter 200ms ease-in-out;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;

  ${EllipsisText} {
    font-size: var(--font-size-m);
    font-weight: 600;
    max-width: 60rem;
    margin-bottom: 2rem;
  }
`;

const ThumbnailContainer = styled(Card)`
  box-shadow: none;
  padding: 0;

  &:hover {
    box-shadow: none;
  }
`;
const PreviewPopover = styled(Popover)`
  ${Popover.Content} {
    min-width: 50rem;
    max-width: 100rem;
  }
`;

export default ReportTile;
