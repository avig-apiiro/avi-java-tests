import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { ReportPreviewData } from '@src-v2/containers/pages/reporting/reporting-landing-page/types';
import { useInject, useToggle } from '@src-v2/hooks';

const MIN_CARD_WIDTH = 360;
const CARD_GAP = 16;

export const useReportingCardsGrid = (initialCards: ReportPreviewData[]) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isExpanded, toggleExpand] = useToggle(false);
  const [visibleCards, setVisibleCards] = React.useState<ReportPreviewData[]>([]);
  const [cardsPerRow, setCardsPerRow] = React.useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { application } = useInject();

  const filteredCards = useMemo(() => {
    return initialCards.filter(card => {
      return card.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [initialCards, searchTerm, application]);

  useLayoutEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) {
        return;
      }

      const containerWidth = containerRef.current.offsetWidth;

      const maxCardsPerRow = Math.floor((containerWidth + CARD_GAP) / (MIN_CARD_WIDTH + CARD_GAP));
      setCardsPerRow(maxCardsPerRow);

      const visibleCardsCount = isExpanded ? filteredCards.length : maxCardsPerRow;
      setVisibleCards(filteredCards.slice(0, visibleCardsCount));
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [isExpanded, filteredCards]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  }, []);

  return {
    searchTerm,
    isExpanded,
    visibleCards,
    cardsPerRow,
    containerRef,
    handleSearchChange,
    toggleExpand,
  };
};
