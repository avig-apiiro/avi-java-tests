import { ApplicationFormValues } from '@src-v2/containers/applications/creation-form/application-form-values';
import {
  AssetConfigurationCategory,
  AssetsConfigurationSection,
} from '@src-v2/containers/profiles/assets-selection/assets-configuration-section';

const assetsCategories: AssetConfigurationCategory[] = [
  'repositories',
  'projects',
  'repositoryGroups',
  'repositoryTags',
  'findingTags',
];

export function MultiAssetsSection({ disabled }: { disabled?: boolean }) {
  return (
    <AssetsConfigurationSection<ApplicationFormValues>
      disabled={disabled}
      title="Assets selection"
      subtitle="Collect repositories, repository groups and projects into an application"
      supportedCategories={assetsCategories}
    />
  );
}
