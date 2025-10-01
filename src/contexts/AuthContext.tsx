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
  // États de base avec localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('aqua_pilot_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('aqua_pilot_onboarding') === 'true';
  });
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string | null>(null);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(true);

  const completeOnboarding = () => {
    localStorage.setItem('aqua_pilot_onboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const completeSubscriptionSelection = () => {
    setHasSelectedPlan(true);
  };

  const updateNotificationSettings = (notifications: User['notifications']) => {
    if (user) {
      const updatedUser = { ...user, notifications };
      setUser(updatedUser);
      localStorage.setItem('aqua_pilot_user', JSON.stringify(updatedUser));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulation d'authentification - remplacer par vraie API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Démo: accepter admin@aquapilot.com / admin123
      if (email === 'admin@aquapilot.com' && password === 'admin123') {
        const newUser: User = {
          id: '1',
          name: 'Admin',
          email: email,
          role: 'admin',
          notifications: {
            email: true,
            desktop: true,
            sms: false
          }
        };
        setUser(newUser);
        localStorage.setItem('aqua_pilot_user', JSON.stringify(newUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, subscriptionPlan: string = 'trial'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulation d'inscription - remplacer par vraie API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name: name,
        email: email,
        role: 'operator',
        subscriptionPlan: subscriptionPlan,
        notifications: {
          email: true,
          desktop: true,
          sms: false
        }
      };
      
      setUser(newUser);
      localStorage.setItem('aqua_pilot_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aqua_pilot_user');
  };

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