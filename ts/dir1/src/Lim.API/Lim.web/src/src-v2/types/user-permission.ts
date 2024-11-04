export interface UserPermission {
  resourceName: string;
  accessType: 'Read' | 'Write'; // aligns with AccessType enum on server
}
