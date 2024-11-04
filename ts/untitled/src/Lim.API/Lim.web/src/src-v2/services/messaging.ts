import _ from 'lodash';
import { getRiskUrl } from '@src-v2/data/risk-data';
import { ApiClient } from '@src-v2/services/api-client';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export type MessagingChannelResponse = { id: string; name: string; teamId: string | null };

type MessagingProvider = ProviderGroup.GoogleChat | ProviderGroup.Slack | ProviderGroup.Teams;

type MessageRequest = {
  channel: Pick<MessagingChannelResponse, 'name' | 'teamId'>;
  customContent?: string;
};

type BulkMessageRequest = {
  messageType: MessagingProvider;
  message: MessageRequest;
  items: RiskTriggerSummaryResponse[];
};

export class Messaging {
  static TYPE_GOOGLE_CHAT = ProviderGroup.GoogleChat;
  static TYPE_SLACK = ProviderGroup.Slack;
  static TYPE_TEAMS = ProviderGroup.Teams;

  #client: ApiClient;

  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.#client = apiClient;
  }

  async getChannels({
    provider,
  }: {
    provider: MessagingProvider;
  }): Promise<MessagingChannelResponse[]> {
    return await this.#client.get('messages/channels', { params: { provider } });
  }

  async getProvidersChannels({ providers }: { providers: ProviderGroup[] }) {
    return providers?.length > 0
      ? await this.#client.get<Record<ProviderGroup, MessagingChannelResponse[]>>(
          'messages/providers/channels',
          { params: { providers } }
        )
      : ({} as Record<ProviderGroup, MessagingChannelResponse[]>);
  }

  sendMessage({
    messageType: triggerMessageType,
    message,
    riskData,
  }: {
    messageType: MessagingProvider;
    message: MessageRequest;
    riskData: RiskTriggerSummaryResponse;
  }) {
    return this.#client.post(
      'messages/sendTriggerMessage',
      Messaging.#createTriggerMessage(riskData, triggerMessageType, message)
    );
  }

  async sendSeparateMessages({ messageType, message, items }: BulkMessageRequest) {
    const results = await Promise.all(
      items.map(async item => {
        try {
          const response = await this.sendMessage({
            messageType,
            message,
            riskData: item,
          });
          return { resolved: Boolean(response), sentItem: item, response };
        } catch (error: any) {
          return { resolved: false, sentItem: item, error };
        }
      })
    );

    return _.partition(results, 'resolved');
  }

  sendAggregatedMessage({ messageType, message, items }: BulkMessageRequest) {
    return this.#client.post(`messages/sendMessages/aggregated`, {
      messageType,
      customContent: message.customContent,
      channel: message.channel.name,
      teamId: message.channel.teamId,
      items: items.map(item => Messaging.#createTriggerMessage(item, messageType, message)),
    });
  }

  static #createTriggerMessage(
    riskData: RiskTriggerSummaryResponse & {
      apiiroLink?: string;
    },
    triggerMessageType: MessagingProvider,
    { channel, customContent }: MessageRequest = { channel: null }
  ) {
    return {
      quoteSection: riskData.riskName ?? riskData.displayName,
      triggerKey: riskData.key,
      triggerRuleKey: riskData.ruleKey,
      riskLevel: riskData.riskLevel,
      ruleName: riskData.ruleName,
      apiiroLink: riskData?.apiiroLink ?? getRiskUrl(riskData),
      triggerMessageType,
      channel: channel?.name,
      teamId: channel?.teamId,
      relatedEntity: riskData.relatedEntity,
      TriggerElementType: riskData.elementType,
      TriggerElementKey: riskData.elementKey,
      applications: riskData.applications.map(item => item.name).join(', '),
      customContent,
      discoveredAt: riskData.discoveredAt,
      dataModelReference: riskData.dataModelReference ?? riskData.primaryDataModelReference,
      triggerDueDate: riskData.dueDate,
    };
  }
}
