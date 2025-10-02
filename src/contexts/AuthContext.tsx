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
      // Simulation d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Récupérer la liste des utilisateurs inscrits
      const registeredUsersJson = localStorage.getItem('aqua_pilot_registered_users');
      const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      
      // Chercher l'utilisateur avec l'email et le mot de passe
      const foundUser = registeredUsers.find(
        (u: any) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Créer l'objet utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = foundUser;
        const loggedInUser: User = {
          ...userWithoutPassword,
          lastLogin: new Date().toISOString(),
        };
        
        setUser(loggedInUser);
        localStorage.setItem('aqua_pilot_user', JSON.stringify(loggedInUser));
        setIsLoading(false);
        return true;
      }
      
      // Compte démo par défaut
      if (email === 'demo@aquapilot.com' && password === 'demo123') {
        const demoUser: User = {
          id: 'demo-1',
          name: 'Utilisateur Démo',
          email: email,
          role: 'operator',
          notifications: {
            email: true,
            desktop: true,
            sms: false
          }
        };
        setUser(demoUser);
        localStorage.setItem('aqua_pilot_user', JSON.stringify(demoUser));
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
      // Simulation d'inscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Récupérer la liste des utilisateurs existants
      const registeredUsersJson = localStorage.getItem('aqua_pilot_registered_users');
      const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      
      // Vérifier si l'email existe déjà
      const emailExists = registeredUsers.some((u: any) => u.email === email);
      if (emailExists) {
        setIsLoading(false);
        return false; // Email déjà utilisé
      }
      
      // Créer le nouvel utilisateur avec le mot de passe
      const newUserWithPassword = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password, // Stocké pour la connexion
        role: 'operator' as const,
        subscriptionPlan: subscriptionPlan,
        notifications: {
          email: true,
          desktop: true,
          sms: false
        }
      };
      
      // Ajouter à la liste des utilisateurs inscrits
      registeredUsers.push(newUserWithPassword);
      localStorage.setItem('aqua_pilot_registered_users', JSON.stringify(registeredUsers));
      
      // Créer l'objet utilisateur actif (sans mot de passe)
      const { password: _, ...newUser } = newUserWithPassword;
      const activeUser: User = newUser;
      
      setUser(activeUser);
      localStorage.setItem('aqua_pilot_user', JSON.stringify(activeUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // Supprimer toutes les données utilisateur et réinitialiser l'onboarding
    localStorage.removeItem('aqua_pilot_user');
    localStorage.removeItem('aqua_pilot_onboarding');
    localStorage.removeItem('aqua_pilot_splash');
    localStorage.removeItem('privacy_accepted');
    
    // Réinitialiser l'état de l'onboarding
    setHasSeenOnboarding(false);
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