import { Role, Permission, Resource } from '@/types';

// Role-based permissions matrix
const PERMISSIONS: Record<Role, Record<Resource, Permission[]>> = {
  BENDAHARA: {
    TRANSACTION: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    MEMBER: ['READ'],
    CHART: ['READ'],
    EXPORT: ['CREATE', 'READ']
  },
  SEKRETARIS: {
    TRANSACTION: ['READ'], 
    MEMBER: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    CHART: ['READ'],
    EXPORT: ['READ']
  },
  ANGGOTA: {
    TRANSACTION: ['READ'],
    MEMBER: ['READ'], 
    CHART: ['READ'],
    EXPORT: []
  }
};

export const can = (role: Role, permission: Permission, resource: Resource): boolean => {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  const resourcePermissions = rolePermissions[resource];
  return resourcePermissions?.includes(permission) || false;
};

// Helper functions for common checks
export const canCreateTransaction = (role: Role): boolean => 
  can(role, 'CREATE', 'TRANSACTION');

export const canEditTransaction = (role: Role): boolean => 
  can(role, 'UPDATE', 'TRANSACTION') && can(role, 'DELETE', 'TRANSACTION');

export const canCreateMember = (role: Role): boolean => 
  can(role, 'CREATE', 'MEMBER');

export const canEditMember = (role: Role): boolean => 
  can(role, 'UPDATE', 'MEMBER') && can(role, 'DELETE', 'MEMBER');

export const canExportData = (role: Role): boolean => 
  can(role, 'CREATE', 'EXPORT');

// Higher-order component for route protection
export const withAuth = (allowedRoles: Role[]) => {
  return (WrappedComponent: React.ComponentType<any>) => {
    return function AuthenticatedComponent(props: any) {
      // This would be used with the session store
      // Implementation will be in the actual components
      return <WrappedComponent {...props} />;
    };
  };
};

// Navigation items based on role
export const getNavigationItems = (role: Role) => {
  const baseItems = [
    { href: '/', label: 'Dashboard', icon: 'BarChart3' },
  ];
  
  const roleItems = [];
  
  // All roles can view financial data (read-only for non-bendahara)
  roleItems.push({ href: '/keuangan', label: 'Keuangan', icon: 'DollarSign' });
  
  // All roles can view members (read-only for non-sekretaris)  
  roleItems.push({ href: '/anggota', label: 'Anggota', icon: 'Users' });
  
  const endItems = [
    { href: '/profile', label: 'Profile', icon: 'User' }
  ];
  
  return [...baseItems, ...roleItems, ...endItems];
};