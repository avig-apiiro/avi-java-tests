import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Card } from '@src-v2/components/cards';
import { DragHandle } from '@src-v2/components/drag-handle';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { ErrorLayout, ToggleCollapse, ToggleIcon } from '@src-v2/components/layout';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Title } from '@src-v2/components/typography';
import { getCardTitle } from '@src-v2/containers/inventory-query/inventory-query-sidebar/library-utils';
import { QueryLibraryCard } from '@src-v2/containers/inventory-query/inventory-query-sidebar/queries-library-card';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useToggle } from '@src-v2/hooks';
import { useMouseDrag } from '@src-v2/hooks/dom-events/use-mouse-drag';
import { customScrollbar } from '@src-v2/style/mixins';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export type SideBarProps = StyledProps<{
  width: number;
  setWidth: () => void;
  setDocked: () => void;
}>;

const DOCKED_WIDTH = '16rem';
const UNDOCKED_WIDTH = '75rem';

const _Sidebar = styled(({ width, setWidth, setDocked, children, ...props }: SideBarProps) => {
  const ref = useRef(null);

  return (
    <div {...props} ref={ref} style={{ width }}>
      {children}
      <Sidebar.ResizeHandle
        setDocked={setDocked}
        offsetRef={ref}
        width={width}
        setWidth={setWidth}
      />
    </div>
  );
})`
  min-width: 16rem;
  position: relative;
  padding: 3rem 4rem 9rem 4rem;
  background-color: white;
  height: 100vh;
  z-index: 99999999;
  border-right: 1px solid var(--color-blue-gray-25);

  ${Card} {
    background-color: white;
    padding: 0;
    border-radius: 2rem;
    overflow: hidden;
    margin-top: 2rem;
    margin-left: 2rem;
  }

  ${Title} {
    font-size: var(--font-size-m);
    font-weight: 500;
    margin-bottom: 0;
  }
`;

const handleOffset = 10;

export const Sidebar = assignStyledNodes(_Sidebar, {
  Body: styled.div``,
  ResizeHandle: styled(({ width, setWidth, setDocked, offsetRef, ...props }) => {
    const onMouseDown = useMouseDrag(event => {
      const width =
        Math.floor(event.clientX - offsetRef.current?.getBoundingClientRect().left) + handleOffset;

      setDocked?.(width <= 120);
      return setWidth(width);
    });

    return (
      <div {...props}>
        <DragHandle vertical variant={Variant.SECONDARY} onMouseDown={onMouseDown} />
      </div>
    );
  })`
    position: absolute;
    z-index: 1;
    height: 100%;
    right: 0;
    top: 3.5rem;
    bottom: 0;

    ${DragHandle} {
      height: 100%;
      width: 6rem;
    }
  `,
});

const SidebarHeader = styled.div`
  display: flex;
  padding: 0 0 2rem 2rem;
  gap: 2rem;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rem;
`;

const SidebarBody = styled.div`
  height: calc(100% - 15rem);
  width: 100%;
  overflow: scroll;
  padding-right: 2rem;

  ${customScrollbar}
`;

export const InventoryQuerySidebar = styled(({ createNewTab, savingQuery, ...props }) => {
  const { rbac } = useInject();

  const [searchTerm, setSearchTerm] = useState('');
  const [width, setWidth] = useState(UNDOCKED_WIDTH);
  const [isDocked, setDocked] = useToggle(false);

  const handleDockingToggle = useCallback(() => {
    if (isDocked) {
      setWidth(UNDOCKED_WIDTH);
    } else {
      setWidth(DOCKED_WIDTH);
    }
    setDocked(isDocked => !isDocked);
  }, [isDocked, setDocked, setWidth]);

  const trackAnalytics = useTrackAnalytics();

  return (
    <Sidebar
      data-docked={dataAttr(isDocked)}
      setDocked={setDocked}
      width={width}
      setWidth={setWidth}
      {...props}>
      <SidebarHeader>
        <SearchInput
          data-docked={dataAttr(isDocked)}
          onChange={({ target }) => {
            setSearchTerm(target?.value);
            trackAnalytics(AnalyticsEventName.Search, {
              [AnalyticsDataField.Source]: `Explorer sidebar`,
            });
          }}
        />
        <ToggleCollapse onClick={handleDockingToggle}>
          <ToggleIcon />
        </ToggleCollapse>
      </SidebarHeader>
      <SidebarBody>
        <AsyncBoundary errorFallback={<ErrorLayout>Failed loading Saved items</ErrorLayout>}>
          <QueryLibraryCard
            readonly={!rbac.canEdit(resourceTypes.ExplorerFavorites)}
            createNewTab={createNewTab}
            searchTerm={searchTerm}
            displayName={getCardTitle('explorer.userFavorites')}
            libraryName="explorer.userFavorites"
            savingQuery={savingQuery}
          />
        </AsyncBoundary>
        <AsyncBoundary errorFallback={<ErrorLayout>Failed loading presets</ErrorLayout>}>
          <QueryLibraryCard
            readonly
            createNewTab={createNewTab}
            searchTerm={searchTerm}
            displayName={getCardTitle('explorer.presets')}
            libraryName="explorer.presets"
          />
        </AsyncBoundary>
      </SidebarBody>
    </Sidebar>
  );
})`
  overflow: hidden;
  height: calc(100vh - var(--top-bar-height));
  flex-shrink: 0;
  max-width: 30vw;
  padding-bottom: 0;

  body:not(.dragging) & {
    transition: width 0.4s ease 0s;
  }

  [data-banner] & {
    padding-top: 10rem;
  }

  ${ToggleCollapse} {
    position: relative;
    top: 0;
    right: 0;
    display: flex;
    width: 7rem;
    height: 7rem;
    padding: 1.25rem;
    background-color: transparent;
    border: 0.25rem solid var(--color-blue-gray-25);
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;

    &:hover path {
      fill: var(--color-blue-gray-30);
    }
  }

  ${SearchInput} {
    width: 100%;
  }

  ${ErrorLayout} {
    align-items: center;
    width: 60rem;
    min-height: unset;
    text-align: center;
    padding: 2rem;
    margin: 0 auto;
    gap: 2rem;
  }

  &[data-docked] {
    ${Card} {
      display: none;
    }

    ${SearchInput} {
      display: none;
    }

    ${ToggleCollapse} {
      transform: scaleX(-1);
      translate: -2rem;

      ${SidebarBody} {
        display: none;
      }
    }
  }
`;
