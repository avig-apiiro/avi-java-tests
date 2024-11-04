import { OrgTeamFormValues } from '@src-v2/containers/organization-teams/org-team-creation-form';
import {
  AssetConfigurationCategory,
  AssetsConfigurationSection,
} from '@src-v2/containers/profiles/assets-selection/assets-configuration-section';

const assetsCategories: AssetConfigurationCategory[] = [
  'applications',
  'projects',
  'repositories',
  'repositoryGroups',
  'applicationTags',
  'repositoryTags',
  'findingTags',
];

export function TeamAssetsMappingSection({ disabled }: { disabled: boolean }) {
  return (
    <AssetsConfigurationSection<OrgTeamFormValues>
      title="Assets mapping"
      subtitle="Collect asset into a team, by selecting them manually or automatically by tags"
      supportedCategories={assetsCategories}
      disabled={disabled}
    />
  );
}
