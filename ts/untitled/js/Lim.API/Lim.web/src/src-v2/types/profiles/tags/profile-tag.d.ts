enum TagSource {
  Manual = 'Manual',
  External = 'External',
  Calculated = 'Calculated',
}

export interface ProfileTagResponse {
  key: string;
  name: string;
  value: string;
  source?: TagSource;
}

export interface TagOption {
  key: string;
  name: string;
  optionalValues: string[];
}
