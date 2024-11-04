import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Circle } from '@src-v2/components/circles';
import { ElementSeparator } from '@src-v2/components/element-separator';
import { SvgIcon } from '@src-v2/components/icons';
import { MessageTemplate } from '@src-v2/components/massge-template';
import { DateTime } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { Paragraph, Strong } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { Messaging } from '@src-v2/services';
import { addInterpunctSeparator } from '@src-v2/utils/string-utils';

export const MessagePreview = props => {
  switch (props.messageType) {
    case Messaging.TYPE_GOOGLE_CHAT: {
      return <GoogleChatPreview {...props} />;
    }
    case Messaging.TYPE_TEAMS:
      return <TeamsPreview {...props} />;

    default:
      return <BaseMessagePreview {...props} />;
  }
};

export const BaseMessagePreview = ({
  riskData: { ruleName, riskName, riskLevel, quoteSection },
  messageType,
  timeFormat = 'HH:mm',
  dateFormat = 'MMM dd',
  tags,
  ...props
}) => {
  const { session } = useInject();
  const { watch } = useFormContext();
  const [channel, customContent] = watch(['channel', 'customContent']);

  return (
    <MessageTemplate {...props}>
      <Circle size={Size.XLARGE}>
        <SvgIcon name="Logo" />
      </Circle>

      <MessageTemplate.Head>
        <Strong>{messageType !== Messaging.TYPE_SLACK && channel ? channel.name : 'Apiiro'}</Strong>
        {tags?.map(tag => <MessageTemplate.Tag key={tag}>{tag}</MessageTemplate.Tag>)}
        <DateTime format={timeFormat} />
      </MessageTemplate.Head>

      <MessageTemplate.Body>
        <MessageTemplate.Heading>
          {addInterpunctSeparator(ruleName, `${riskLevel} Risk`)}
          <Paragraph>{customContent}</Paragraph>
        </MessageTemplate.Heading>

        <MessageTemplate.BlockQuote>{quoteSection ?? riskName}</MessageTemplate.BlockQuote>
        <MessageTemplate.Foot>
          <ElementSeparator separator="|">
            <>Sent by {session.username}</>
            <DateTime format={dateFormat} />
            <MessageTemplate.Link>View in Apiiro</MessageTemplate.Link>
          </ElementSeparator>
        </MessageTemplate.Foot>
      </MessageTemplate.Body>
    </MessageTemplate>
  );
};

const GoogleChatPreview = styled(BaseMessagePreview)`
  ${MessageTemplate.Head} {
    font-weight: 700;
  }

  ${MessageTemplate.BlockQuote} {
    padding: 3rem;
    background-color: var(--color-white);
    border-left: 1rem solid var(--color-blue-gray-30);
  }
`;

const TeamsPreview = styled(BaseMessagePreview)`
  ${MessageTemplate.Body} {
    padding: 4rem;
    margin-top: 1rem;
    border-radius: 1rem;
    background-color: var(--color-white);
  }

  ${MessageTemplate.Head}, ${MessageTemplate.Heading} {
    font-size: var(--font-size-m);
    font-weight: 700;
  }

  ${MessageTemplate.BlockQuote} {
    padding: 1rem;
    background-color: var(--color-blue-gray-15);
    border-left: none;
  }
`;
