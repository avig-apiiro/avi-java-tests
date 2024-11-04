export const getRepository = ({ profile, data }) => {
  return profile.repository || profile.repositoryByKey[data.profileKey];
};

export const isInfrastructureTemplateLookingString = (str: string) => {
  if (!str) {
    return false;
  }
  const isTextDigitsOnly = s => /^\d+$/.test(s);
  return (
    str
      .split(/[\s,-:]+/)
      .filter(s => s && !isTextDigitsOnly(s))
      .some(s => s === s.toUpperCase()) ||
    str.includes('$') ||
    (str.startsWith('_') && str.endsWith('_'))
  );
};

export const getPartialPath = (path, maxParts = 4) => {
  const pathParts = path.split('/').slice(0, -1);
  return pathParts.length > maxParts
    ? `${pathParts.slice(0, maxParts - 1).join('/')}/.../${pathParts.pop()}/`
    : `${pathParts.join('/')}/`;
};

export const getFileNameFromPath = path => path.split('/').pop();

export const getTrimmedPath = path => getPartialPath(path) + getFileNameFromPath(path);
