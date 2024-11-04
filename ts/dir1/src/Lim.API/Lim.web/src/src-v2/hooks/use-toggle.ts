import { useCallback, useState } from 'react';
import { StubAny } from '@src-v2/types/stub-any';

export function useToggle(initialValue?: StubAny) {
  const [value, set] = useState(Boolean(initialValue));
  const toggle = useCallback(
    (resetValue: StubAny = null) =>
      typeof resetValue === 'boolean' ? set(resetValue) : set(value => !value),
    [set]
  );
  return [value, toggle] as const;
}
