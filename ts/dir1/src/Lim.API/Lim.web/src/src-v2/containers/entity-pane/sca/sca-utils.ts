import semver from 'semver';

export const isMinorChange = (currentVersion: string, nextVersion: string): boolean => {
  const coercedCurrentVersion = semver.coerce(currentVersion);
  const coercedNextVersion = semver.coerce(nextVersion);

  if (!semver.valid(coercedNextVersion) || !semver.valid(coercedCurrentVersion)) {
    return;
  }

  const isSameMajor = semver.major(coercedNextVersion) === semver.major(coercedCurrentVersion);
  return isSameMajor && coercedNextVersion !== coercedCurrentVersion;
};

export const dependencyTypeToIconName = dependencyType => {
  switch (dependencyType) {
    case 'Npm':
      return 'npm';
    case 'Pip':
      return 'PyPI';
    case 'Gem':
      return 'RubyGems';
    default:
      return dependencyType;
  }
};
