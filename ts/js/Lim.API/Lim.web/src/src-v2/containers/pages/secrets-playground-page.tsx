import { observer } from 'mobx-react';
import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Textarea } from '@src-v2/components/forms/textarea';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';

export default observer(() => {
  const { secretsService, application } = useInject();

  const [foundSecrets, setFoundSecrets] = useState(null);
  const [filePath, setFilepath] = useState('');
  const [fileContents, setFileContents] = useState('');

  async function findSecrets() {
    return await secretsService.SecretsFromFile({ fileContents, filePath });
  }

  if (!application.isFeatureEnabled(FeatureFlag.SecretsPlayground)) {
    return <Redirect to="/organization}" />;
  }

  return (
    <Page title="Secrets Playground">
      <GuttersWrapper>
        <StickyHeader title="Secrets Playground" />
        <Textarea
          placeholder="Insert secrets here"
          value={fileContents}
          onChange={event => setFileContents(event.target.value)}
        />
        <Textarea
          placeholder="Insert file path here."
          value={filePath}
          onChange={event => setFilepath(event.target.value)}
        />
        <div>
          {foundSecrets &&
            foundSecrets.map((item: StubAny) => (
              <div key={item.uncensoredExactValue + item.lineNumber}>
                Line number: {item.lineNumber}, Type: {item.type}, Exposure: {item.exposure},
                Uncensored value: {item.uncensoredExactValue}
              </div>
            ))}
        </div>
        <ButtonWrapper
          type="submit"
          onClick={async () => {
            if (fileContents) {
              setFoundSecrets(await findSecrets());
            }
          }}>
          Submit
        </ButtonWrapper>
      </GuttersWrapper>
    </Page>
  );
});

const GuttersWrapper = styled(Gutters)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ButtonWrapper = styled(Button)`
  width: 20%;
`;
