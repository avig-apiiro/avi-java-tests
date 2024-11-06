import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Subtitle, Title } from '@src-v2/components/typography';
import { useQueryParams } from '@src-v2/hooks';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { makeUrl } from '@src-v2/utils/history-utils';
import { humanize } from '@src-v2/utils/string-utils';

export const PaneStickyHeader = styled(
  ({
    scrolled,
    navigation = [],
    children,
    ...props
  }: StyledProps<{
    scrolled: boolean;
    navigation?: string[];
  }>) => {
    const { pathname } = useLocation();
    const { queryParams, updateQueryParams } = useQueryParams();

    const navigationLinks = useMemo(
      () =>
        navigation?.map(navigationTitle => ({
          key: navigationTitle,
          label: humanize(navigationTitle),
          to: makeUrl(pathname, { ...queryParams, pane: navigationTitle }),
          isActive: () => queryParams?.pane === navigationTitle,
        })),
      [navigation, pathname, queryParams]
    );

    useEffect(() => {
      if (
        navigation.length &&
        (!queryParams?.pane || !navigation.includes(queryParams.pane as string))
      ) {
        updateQueryParams({ pane: navigation[0] });
      }

      return () => {
        updateQueryParams({ pane: null });
      };
    }, []);

    return (
      <div {...props} data-scroll-active={dataAttr(scrolled)}>
        {children}
        {Boolean(navigation.length) && <Tabs tabs={navigationLinks} variant={Variant.SECONDARY} />}
      </div>
    );
  }
)`
  z-index: 1;
  padding: 0 6rem;
  transition: 0.2s ease-in-out box-shadow;
  font-size: var(--font-size-s);

  &[data-scroll-active] {
    box-shadow: var(--elevation-6);
  }

  ${Tabs} {
    margin-top: 2rem;
  }

  ${Title} {
    margin-bottom: 0;
    font-size: var(--font-size-l);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${Subtitle} {
    margin-bottom: 0;
    font-size: var(--font-size-m);
    font-weight: 500;
  }
`;
