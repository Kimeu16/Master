import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Read-Only' | 'CRUD' | 'Admin';

interface AuthContextType {
  isAuthenticated: boolean;
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  canEdit: boolean;
  signIn: (token: string, role: Role) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRoleState] = useState<Role>('Read-Only');

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('auth_token');
      if (savedAuth) {
        setIsAuthenticated(true);
      }
      const savedRole = localStorage.getItem('rbac_role') as Role;
      if (savedRole && ['Read-Only', 'CRUD', 'Admin'].includes(savedRole)) {
        setRoleState(savedRole);
      }
    } catch (e) {
      console.error('Failed to parse auth state from localStorage', e);
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('rbac_role', newRole);
    } catch (e) {
      console.error('Failed to set role in localStorage', e);
    }
  };

  const signIn = (token: string, selectedRole: Role) => {
    setIsAuthenticated(true);
    setRoleState(selectedRole);
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('rbac_role', selectedRole);
    } catch (e) {
      console.error('Failed to save auth state to localStorage', e);
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setRoleState('Read-Only');
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('rbac_role');
    } catch (e) {
      console.error('Failed to clear auth state from localStorage', e);
    }
  };

  const isAdmin = role === 'Admin';
  const canEdit = role === 'CRUD' || role === 'Admin';

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, setRole, isAdmin, canEdit, signIn, signOut }}>
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
