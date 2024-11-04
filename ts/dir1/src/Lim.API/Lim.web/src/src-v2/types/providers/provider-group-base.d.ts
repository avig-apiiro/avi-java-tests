type Type = {
  [key: string]: string[];
};

export type ProviderGroupBase = {
  key: string;
  types: Type;
  apiProvider: boolean;
  typeOverride?: string;
};
