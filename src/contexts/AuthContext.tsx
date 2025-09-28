import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  avatar?: string;
  prenom?: string;
  nom?: string;
  entreprise?: string;
  capaciteProduction?: string;
  lastLogin?: string;
  subscriptionPlan?: string;
  notifications: {
    email: boolean;
    desktop: boolean;
    sms: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, subscriptionPlan?: string) => Promise<boolean>;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
  isAuthenticated: boolean;
  updateNotificationSettings: (notifications: User['notifications']) => void;
  selectedSubscriptionPlan: string | null;
  setSelectedSubscriptionPlan: (plan: string | null) => void;
  hasSelectedPlan: boolean;
  completeSubscriptionSelection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider initializing');
  
  // États de base avec valeurs par défaut sûres
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); // Par défaut true pour tester
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string | null>(null);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(true); // Par défaut true pour tester

  console.log('AuthProvider state initialized');

  // Fonctions simplifiées pour les tests
  const completeOnboarding = () => {
    console.log('Completing onboarding');
    setHasSeenOnboarding(true);
  };

  const completeSubscriptionSelection = () => {
    console.log('Completing subscription selection');
    setHasSelectedPlan(true);
  };

  const updateNotificationSettings = (notifications: User['notifications']) => {
    if (user) {
      const updatedUser = { ...user, notifications };
      setUser(updatedUser);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt');
    setIsLoading(true);
    
    // Simulation simple
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return false; // Pour les tests, on reste non connecté
  };

  const register = async (name: string, email: string, password: string, subscriptionPlan: string = 'trial'): Promise<boolean> => {
    console.log('Register attempt');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return false; // Pour les tests
  };

  const logout = () => {
    console.log('Logout');
    setUser(null);
    setHasSeenOnboarding(false);
    setHasSelectedPlan(false);
    setSelectedSubscriptionPlan(null);
  };

  console.log('AuthProvider about to render, state:', {
    user: !!user,
    hasSeenOnboarding,
    hasSelectedPlan,
    isLoading
  });

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading,
      hasSeenOnboarding,
      completeOnboarding,
      isAuthenticated: !!user,
      updateNotificationSettings,
      selectedSubscriptionPlan,
      setSelectedSubscriptionPlan,
      hasSelectedPlan,
      completeSubscriptionSelection
    }}>
      {children}
    </AuthContext.Provider>
  );
};