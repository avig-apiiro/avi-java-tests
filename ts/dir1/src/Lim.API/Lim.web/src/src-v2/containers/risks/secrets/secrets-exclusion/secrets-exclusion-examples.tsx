import styled from 'styled-components';

export const SecretsExclusionExamples = () => {
  return (
    <SecretsExclusionExamplesWrapper>
      <SecretsExclusionExamplesHeader>File paths examples</SecretsExclusionExamplesHeader>
      <SecretsExclusionExamplesContent>
        {ExamplesTexts.map((text, index) => (
          <SecretsExclusionExamplesContentField key={`${index}-${text}`}>
            {text}
          </SecretsExclusionExamplesContentField>
        ))}
      </SecretsExclusionExamplesContent>
    </SecretsExclusionExamplesWrapper>
  );
};

const SecretsExclusionExamplesHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--font-size-m);
  font-weight: 600;
  color: var(--color-blue-gray-70);
  margin-bottom: 3rem;
`;

const SecretsExclusionExamplesWrapper = styled.div`
  width: 100%;
  flex-grow: 1;
`;

const SecretsExclusionExamplesContent = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: repeat(7, 0.25fr);
`;

const SecretsExclusionExamplesContentField = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  font-weight: 400;
  color: var(--color-blue-gray-70);
  font-size: var(--font-size-xs);

  :nth-child(-n + 3) {
    font-size: var(--font-size-s);
    font-weight: 400;
    color: var(--color-blue-gray-60);
  }

  :nth-child(3n - 2) {
    font-weight: 600;
  }

  :not(:nth-last-child(-n + 3)) {
    border-bottom: 1px solid var(--color-blue-gray-20);
  }
`;

const ExamplesTexts = [
  'Pattern',
  'Matches',
  'Non-matches',
  'test.js',
  `test.js
  /test.js`,
  `src/test/file.js
src/test.js/README
src/test.js`,
  'tests/*.js',
  `tests/test.js
tests/file.js`,
  `src/test.js
src/test.txt`,
  '/tests/*.js',
  'tests/test.js',
  'src/tests/test.js',
  '/*/test.js',
  'src/test.js',
  `test.js
src/tests/test.js`,
  'src/**/test.js',
  `src/test.js
src/dir1/dir2/dir3/test.js`,
  'dir1/src/test.js',
  '/src/**/test.js',
  `src/test.js
src/dir1/dir2/dir3/test.js`,
  'dir1/src/test.js',
  '**/templates/*',
  `templates/file.html
src/templates/file.html`,
  'src/file.html',
];
