
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string | null>(null);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu l'onboarding
    const onboardingSeen = localStorage.getItem('onboarding_seen');
    if (onboardingSeen === 'true') {
      setHasSeenOnboarding(true);
    }

    // Vérifier si l'utilisateur a sélectionné un plan
    const planSelected = localStorage.getItem('plan_selected');
    if (planSelected === 'true') {
      setHasSelectedPlan(true);
    }

    // Vérifier si un utilisateur est déjà connecté
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ajouter les propriétés manquantes si elles n'existent pas
      const userWithDefaults = {
        ...parsedUser,
        notifications: parsedUser.notifications || { email: true, desktop: true, sms: false },
        prenom: parsedUser.prenom || parsedUser.name?.split(' ')[0] || '',
        nom: parsedUser.nom || parsedUser.name?.split(' ')[1] || '',
        entreprise: parsedUser.entreprise || 'Non définie',
        capaciteProduction: parsedUser.capaciteProduction || 'petite',
        lastLogin: parsedUser.lastLogin || new Date().toISOString(),
        subscriptionPlan: parsedUser.subscriptionPlan || 'trial'
      };
      setUser(userWithDefaults);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_seen', 'true');
    setHasSeenOnboarding(true);
  };

  const completeSubscriptionSelection = () => {
    localStorage.setItem('plan_selected', 'true');
    setHasSelectedPlan(true);
  };

  const updateNotificationSettings = (notifications: User['notifications']) => {
    if (user) {
      const updatedUser = { ...user, notifications };
      setUser(updatedUser);
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulation d'une API de connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Utilisateurs de démonstration
      const demoUsers = [
        { 
          id: '1', 
          name: 'Admin Aquaculture', 
          email: 'admin@aqua.com', 
          role: 'admin' as const,
          prenom: 'Admin',
          nom: 'Aquaculture',
          entreprise: 'AquaTech Solutions',
          capaciteProduction: 'industrielle',
          subscriptionPlan: 'annual',
          notifications: { email: true, desktop: true, sms: true },
          lastLogin: new Date().toISOString()
        },
        { 
          id: '2', 
          name: 'Manager Production', 
          email: 'manager@aqua.com', 
          role: 'manager' as const,
          prenom: 'Manager',
          nom: 'Production',
          entreprise: 'Pisciculture du Lac',
          capaciteProduction: 'grande',
          subscriptionPlan: 'monthly',
          notifications: { email: true, desktop: true, sms: false },
          lastLogin: new Date().toISOString()
        },
        { 
          id: '3', 
          name: 'Opérateur Bassins', 
          email: 'operator@aqua.com', 
          role: 'operator' as const,
          prenom: 'Opérateur',
          nom: 'Bassins',
          entreprise: 'Aquaculture Moderne',
          capaciteProduction: 'moyenne',
          subscriptionPlan: 'trial',
          notifications: { email: true, desktop: false, sms: false },
          lastLogin: new Date().toISOString()
        }
      ];

      const foundUser = demoUsers.find(u => u.email === email);
      
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('current_user', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, subscriptionPlan: string = 'trial'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulation d'une API d'inscription
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'operator',
        prenom: name.split(' ')[0] || '',
        nom: name.split(' ')[1] || '',
        entreprise: 'Nouvelle exploitation',
        capaciteProduction: 'petite',
        subscriptionPlan,
        notifications: { email: true, desktop: true, sms: false },
        lastLogin: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('onboarding_seen');
    localStorage.removeItem('plan_selected');
    setHasSeenOnboarding(false);
    setHasSelectedPlan(false);
    setSelectedSubscriptionPlan(null);
    
    // Forcer the réinitialisation complète de l'état de l'application
    window.location.reload();
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
