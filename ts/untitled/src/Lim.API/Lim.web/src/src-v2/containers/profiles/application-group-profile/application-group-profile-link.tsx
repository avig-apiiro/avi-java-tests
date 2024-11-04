import { useMemo } from 'react';
import { ClampText } from '@src-v2/components/clamp-text';
import { Link } from '@src-v2/components/typography';
import { ApplicationGroupProfile } from '@src-v2/types/profiles/application-group-profile';
import { makeUrl } from '@src-v2/utils/history-utils';

export function ApplicationGroupProfileLink({
  value: appGroup,
}: {
  value: ApplicationGroupProfile;
}) {
  const appGroupLink = useMemo(
    () =>
      makeUrl(appGroup.productsCount ? '/profiles/applications' : '/profiles/repositories', {
        fl: { ApplicationGroupKeys: { values: [appGroup.key] } },
      }),
    [appGroup]
  );

  return (
    <Link to={appGroupLink}>
      <ClampText>{appGroup.name}</ClampText>
    </Link>
  );
}
