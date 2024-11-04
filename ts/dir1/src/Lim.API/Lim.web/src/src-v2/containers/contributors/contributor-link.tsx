import { Link } from 'react-router-dom';

export const ContributorLink = ({ className, developerProfile, children }) => (
  <Link
    to={`/users/contributors/${developerProfile.representativeIdentityKeySha}`}
    className={className}>
    {children || developerProfile.displayName}
  </Link>
);
