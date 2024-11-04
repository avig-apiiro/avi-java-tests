import { DefaultCard } from '@src-v2/containers/connectors/connections/cards/default-card';
import { ApiProviderGroup } from '@src-v2/types/providers/api-provider-group';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { ApiProviderCard } from './api-provider-card';

export function ConnectorCardFactory({
  provider,
  limited,
  section,
  subSection,
  ...props
}: {
  provider: ProviderGroup | ApiProviderGroup;
  limited: boolean;
  section: string;
  subSection: string;
}) {
  if (provider.apiProvider) {
    return <ApiProviderCard {...props} provider={provider as ApiProviderGroup} />;
  }

  return (
    <DefaultCard
      {...props}
      provider={provider as ProviderGroup}
      limited={limited}
      section={section}
      subSection={subSection}
    />
  );
}
