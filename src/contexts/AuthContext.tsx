import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Read-Only' | 'CRUD' | 'Admin';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  canEdit: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('Read-Only');

  useEffect(() => {
    const savedRole = localStorage.getItem('rbac_role') as Role;
    if (savedRole && ['Read-Only', 'CRUD', 'Admin'].includes(savedRole)) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('rbac_role', newRole);
    // Setting header for fetch api is handled inside api.ts reading from localStorage
  };

  const isAdmin = role === 'Admin';
  const canEdit = role === 'CRUD' || role === 'Admin';

  return (
    <AuthContext.Provider value={{ role, setRole, isAdmin, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
