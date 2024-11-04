import { useEffect, useMemo, useState } from 'react';
import { useQueryParams } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';
import { qs } from '@src-v2/utils/history-utils';

type ShareableLinkParameterSettings<ParameterType> = {
  default: ParameterType;
  serializer?: (v: ParameterType) => string;
  deserializer?: (v: string) => ParameterType;
};

type ShareableLinkParameterSettingsOrShorthand<ParameterType> = (
  | ShareableLinkParameterSettings<ParameterType>
  | ParameterType
) &
  (ShareableLinkParameterSettings<ParameterType> | string | number);

type ShareableLinkParameterSettingsMap<ParametersTypeMap> = {
  [parameterName in keyof ParametersTypeMap]: ShareableLinkParameterSettingsOrShorthand<
    ParametersTypeMap[parameterName]
  >;
};

type UseShareableLinkOptions<ParametersTypeMap> = {
  linkParameters: ShareableLinkParameterSettingsMap<ParametersTypeMap>;
};

type UseShareableLinkResult<ParametersTypeMap> = {
  parameters: {
    [parameterName in keyof ParametersTypeMap]: [
      ParametersTypeMap[parameterName],
      (newValue: ParametersTypeMap[parameterName]) => void,
    ];
  };
  shareableUrlParams: string;
};

export function useShareableLinkParameters<T>({
  linkParameters,
}: UseShareableLinkOptions<T>): UseShareableLinkResult<T> {
  const sortedLinkParameteres = useMemo(() => {
    const orderedEntries = Object.entries(linkParameters).map<
      [string, ShareableLinkParameterSettings<unknown>]
    >(([parameterName, settings]: [string, ShareableLinkParameterSettings<unknown>]) => {
      const normalizedParameterSettings =
        typeof settings === 'string' || typeof settings === 'number' || settings === null
          ? { default: settings }
          : settings;

      if (!(normalizedParameterSettings.deserializer && normalizedParameterSettings.serializer)) {
        if (typeof normalizedParameterSettings === 'string') {
          Object.assign(normalizedParameterSettings, {
            deserializer: (s: StubAny) => s,
            serializer: (s: StubAny) => s,
          });
        } else if (typeof normalizedParameterSettings === 'number') {
          Object.assign(normalizedParameterSettings, {
            deserializer: (s: StubAny) => parseFloat(s),
            serializer: (n: StubAny) => String(n),
          });
        } else {
          Object.assign(normalizedParameterSettings, {
            deserializer: (s: StubAny) => JSON.parse(s),
            serializer: (o: StubAny) => JSON.stringify(o),
          });
        }
      }

      return [parameterName, normalizedParameterSettings];
    });

    orderedEntries.sort((a, b) => a[0].localeCompare(b[0]));
    return orderedEntries;
  }, [linkParameters]);

  const { queryParams } = useQueryParams();

  const [fullState, setFullState] = useState(() =>
    Object.fromEntries(
      sortedLinkParameteres.map(([parameterName, parameterSetting]) => [
        parameterName,
        parameterName in queryParams
          ? parameterSetting.deserializer(queryParams[parameterName] as string)
          : parameterSetting.default,
      ])
    )
  );

  useEffect(
    () => {
      setFullState(currentState => {
        const newState = Object.assign({}, currentState);
        sortedLinkParameteres.forEach(([parameterName, parameterSetting]) => {
          if (parameterName in queryParams) {
            newState[parameterName] = parameterSetting.deserializer(
              queryParams[parameterName] as string
            );
          }
        });

        return newState;
      });
    },
    sortedLinkParameteres
      .map<any>(([parameterName]) => queryParams[parameterName])
      .concat([setFullState])
  );

  const resultParametersAndSetters: StubAny = {};
  const queryParameters: StubAny = {};

  sortedLinkParameteres.forEach(([parameterName, parameterSettings]) => {
    const parameterValue = fullState[parameterName];
    const setParameterValue = (newValue: StubAny) =>
      setFullState(currentFullState =>
        Object.assign({}, currentFullState, Object.fromEntries([[parameterName, newValue]]))
      );

    resultParametersAndSetters[parameterName] = [parameterValue, setParameterValue];

    queryParameters[parameterName] = parameterSettings.serializer(parameterValue);
  });

  const shareableUrlParams = qs.stringify(queryParameters);

  return {
    parameters: resultParametersAndSetters,
    shareableUrlParams,
  };
}
