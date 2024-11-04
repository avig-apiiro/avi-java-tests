export interface LeanDeveloper {
  key: string;
  identityKey: string;
  avatarUrl: string;
  username: string;
  email?: string;
}

export interface LeanPointOfContact extends LeanDeveloper {
  jobTitle: string;
  title?: string;
  representativeIdentityKeySha?: string;
}

export interface LeanCodeOwner extends LeanDeveloper {
  isActive: boolean;
  activeSince: Date;
  lastActivity: Date;
}
