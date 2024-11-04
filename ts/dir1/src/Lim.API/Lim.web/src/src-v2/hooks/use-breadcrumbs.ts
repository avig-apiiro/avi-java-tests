import { useEffect, useMemo } from 'react';
import menuItems from '@src-v2/data/sidebar-menu-items';
import menuItemsNewLayout from '@src-v2/data/sidebar-menu-items-new-layout';
import { useInject } from '@src-v2/hooks/use-inject';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';

export type BreadcrumbProps = {
  // Pass "#" to include a breadcrumb that doesn't navigate (only pops right-hand breadcrumbs)
  to: string | '#';
  // Invoked when a breadcrumb is popped (that is, when a breadcrumb to the left of this breadcrumb is clicked)
  onPop?: (event: StubAny) => void;
  label: string;
  icon?: string;
  isPinned?: boolean;
  forceRefresh?: boolean;
};

type UseBreadcrumbsProps = {
  breadcrumbs?: BreadcrumbProps[];
};

export function useBreadcrumbs({ breadcrumbs = [] }: UseBreadcrumbsProps = {}) {
  const { application } = useInject();
  useEffect(() => {
    if (!breadcrumbs) {
      return;
    }
    application.setBreadcrumbs([
      ...application.breadcrumbs.filter(({ isPinned }) => isPinned),
      ...breadcrumbs,
    ]);

    return () =>
      application.setBreadcrumbs([...application.breadcrumbs.filter(({ isPinned }) => isPinned)]);
  }, [breadcrumbs, application]);
}

export const useInitializeBreadcrumbs = () => {
  const { application, history } = useInject();
  const { pathname } = history.location;

  const customPathname = useMemo(() => {
    return convertSpecialPaths(pathname);
  }, [pathname]);

  const currentMenuItems = application.isFeatureEnabled(FeatureFlag.SettingsNewLayout)
    ? menuItemsNewLayout
    : menuItems;

  useEffect(() => {
    const initialBreadcrumbs = initializeBreadcrumbs({
      pathname: customPathname,
      menuItems: currentMenuItems,
    });
    const breadcrumbs = convertToBreadcrumbs(initialBreadcrumbs);
    application.setBreadcrumbs(breadcrumbs);

    return history.listen(location => {
      const initialBreadcrumbs = initializeBreadcrumbs({
        pathname: convertSpecialPaths(location.pathname),
        menuItems: currentMenuItems,
      });

      const breadcrumbs = convertToBreadcrumbs(initialBreadcrumbs);
      application.setBreadcrumbs(breadcrumbs);
    });
  }, [customPathname, currentMenuItems]);
};

const initializeBreadcrumbs = ({
  pathname,
  menuItems,
  parent = null,
  lastResult = [],
}: StubAny) => {
  if (lastResult.length > 0) {
    return lastResult;
  }

  const breadcrumbs = menuItems.reduce((result: StubAny, item: StubAny) => {
    if (item.route) {
      result = findMatchingRoute({ item: parent, childItem: item, pathname, result });
    } else {
      result = initializeBreadcrumbs({
        pathname,
        parent: item,
        menuItems: item.items,
        lastResult: result,
      });
    }
    return result;
  }, []);

  return breadcrumbs;
};

const findMatchingRoute = ({ childItem, pathname, result, item = null }: StubAny) => {
  let finalResult = result;
  const pathnamePrefix = pathname.split('/').slice(0, 3).join('/');
  const pathnamePrefixFirst = pathname.split('/').slice(0, 2).join('/');

  if (typeof childItem.route === 'string') {
    // the or is for cases like dashboards or questionnaire, where there can be more following routes or item's route is just single word
    // once feature flag will be removed, we will organize all the routes and this will be updated
    if (
      childItem.route.includes(pathnamePrefix) ||
      (childItem.route.includes(pathnamePrefixFirst) &&
        !childItem.hasFollowPath &&
        childItem.route.split('/').length === 2)
    ) {
      finalResult = item ? [item, childItem] : [childItem];
    }
  } else {
    childItem.route.forEach((route: StubAny) => {
      if (pathname.includes(route)) {
        finalResult = item ? [item, childItem] : [childItem];
      }
    });
  }

  return finalResult;
};

const convertSpecialPaths = (pathname: StubAny) => {
  if (pathname.split('/')?.[1] === 'module' || pathname.split('/')?.[1] === 'commit') {
    return '/profiles/repositories';
  }

  return pathname;
};

const convertToBreadcrumbs = (breadcrumbs: StubAny) =>
  breadcrumbs.map((breadCrumb: StubAny) => ({
    to: breadCrumb.route ?? breadcrumbs[1]?.route,
    label: breadCrumb.title,
    icon: breadCrumb.icon,
    isPinned: true,
    forceRefresh: breadCrumb.forceRefresh,
  }));
