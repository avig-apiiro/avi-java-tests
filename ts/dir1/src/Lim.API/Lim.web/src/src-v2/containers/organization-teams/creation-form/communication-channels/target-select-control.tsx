import { useCallback } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { TicketingProviders } from '@src-v2/data/ticketing-issues-provider';
import { useInject } from '@src-v2/hooks';
import { SearchParams } from '@src-v2/services';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { StubAny } from '@src-v2/types/stub-any';

type TargetSelectControlProps = {
  name: string;
  provider: ProviderGroup;
  disabled?: boolean;
  rules?: RegisterOptions;
};

export const TargetSelectControl = (props: TargetSelectControlProps) =>
  isTicketingProvider(props.provider) ? (
    <ProjectTargetSelectControl {...props} />
  ) : (
    <ChannelTargetSelectControl {...props} />
  );

const ProjectTargetSelectControl = ({ provider, disabled, ...props }: TargetSelectControlProps) => {
  const { asyncCache, projects } = useInject();

  const searchMethod = useCallback(
    (params: Partial<SearchParams>) =>
      asyncCache.suspend(projects.searchMonitoredProjects, { provider, ...params }),
    [provider]
  );

  return (
    <SelectControlV2
      {...props}
      placeholder="Select projects..."
      disabled={disabled}
      rules={{ required: !disabled }}
      searchMethod={searchMethod}
      formatOptionLabel={(project: StubAny) => project.name}
    />
  );
};

const ChannelTargetSelectControl = ({ provider, ...props }: TargetSelectControlProps) => {
  const { asyncCache, messaging } = useInject();

  const searchMethod = useCallback(
    async (params: Partial<SearchParams>) => {
      if (!provider) {
        return [];
      }

      const allChannelsPromise = asyncCache.suspend(messaging.getChannels, {
        provider,
      });

      const allChannels = await allChannelsPromise.read();

      if (provider === ProviderGroup.Slack) {
        const slackChannels = allChannels.map((channel: StubAny) => ({
          id: channel.id,
          name: channel.name,
          teamId: channel.teamId,
        }));

        return params.searchTerm?.length
          ? slackChannels?.filter((channel: StubAny) => channel.name.includes(params.searchTerm))
          : slackChannels;
      }

      return params.searchTerm?.length
        ? allChannels?.filter((channel: StubAny) => channel.name.includes(params.searchTerm))
        : allChannels;
    },
    [provider]
  );

  return (
    <SelectControlV2
      {...props}
      placeholder="Select channel..."
      searchMethod={searchMethod}
      keyBy="id"
      formatOptionLabel={(option: StubAny) =>
        option.teamId ? `${option.teamId}: ${option.name}` : option.name
      }
    />
  );
};

export function isTicketingProvider(provider: ProviderGroup): boolean {
  return Object.values(TicketingProviders).includes(provider);
}
