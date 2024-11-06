export interface LeanConsumable {
  key: string;
  name: string;
  type: string;
  monitoredProfileKey?: string;
  serverUrl: string;
  url: string;
  provider: string;
}

export interface LeanRepositoryConsumable extends LeanConsumable {
  referenceName: string;
}
