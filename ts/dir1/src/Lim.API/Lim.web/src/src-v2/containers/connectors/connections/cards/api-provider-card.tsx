import { Button } from '@src-v2/components/button-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading4 } from '@src-v2/components/typography';
import { PlainConnectorCard } from '@src-v2/containers/connectors/connections/cards/plain-connector-card';
import { ApiProviderGroup } from '@src-v2/types/providers/api-provider-group';
import { Actions, HorizontalDivider } from './default-card';

export const ApiProviderCard = ({ provider, ...props }: { provider: ApiProviderGroup }) => (
  <PlainConnectorCard {...props} provider={provider} icons={provider.iconNames}>
    <Heading4>{provider.title}</Heading4>
    <div>
      <HorizontalDivider />
      <Actions>
        <Button href={provider.url} size={Size.MEDIUM} variant={Variant.TERTIARY}>
          Connect via API
        </Button>
      </Actions>
    </div>
  </PlainConnectorCard>
);
