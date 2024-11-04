export interface RelatedEntityProfile<TProfile, TRelatedProfile> {
  key: string;
  profile: TProfile;
  relatedProfile: TRelatedProfile;
}
