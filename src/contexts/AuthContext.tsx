import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'user';
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
  register: (name: string, email: string, password: string, subscriptionPlan?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<boolean>;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
  isAuthenticated: boolean;
  updateNotificationSettings: (notifications: User['notifications']) => void;
  selectedSubscriptionPlan: string | null;
  setSelectedSubscriptionPlan: (plan: string | null) => void;
  hasSelectedPlan: boolean;
  completeSubscriptionSelection: () => void;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string | null>(null);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Fetch user profile and roles from Supabase
  const fetchUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        if (import.meta.env.DEV) console.error('Error fetching profile:', profileError);
      }

      // Get roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (rolesError) {
        if (import.meta.env.DEV) console.error('Error fetching roles:', rolesError);
      }

      const role = userRoles && userRoles.length > 0 ? userRoles[0].role : 'user';

      const userData: User = {
        id: supabaseUser.id,
        name: profile?.full_name || supabaseUser.email || '',
        email: supabaseUser.email || '',
        role: role as 'admin' | 'manager' | 'operator' | 'user',
        avatar: profile?.avatar_url || undefined,
        lastLogin: new Date().toISOString(),
        notifications: {
          email: true,
          desktop: true,
          sms: false
        }
      };

      setUser(userData);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching user data:', error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user);
          }, 0);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
  };

  const completeSubscriptionSelection = () => {
    setHasSelectedPlan(true);
  };

  const updateNotificationSettings = (notifications: User['notifications']) => {
    if (user) {
      const updatedUser = { ...user, notifications };
      setUser(updatedUser);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Validation basique
    if (!email || !password) {
      setIsLoading(false);
      return false;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsLoading(false);
      return false;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (import.meta.env.DEV) console.error('Login error:', error.message);
        setIsLoading(false);
        return false;
      }

      if (data.user && data.session) {
        // La session est automatiquement persistée par Supabase
        await fetchUserData(data.user);
        
        // Marquer le splash screen et l'onboarding comme vus lors de la connexion
        localStorage.setItem('aqua_pilot_splash', 'true');
        localStorage.setItem('privacy_accepted', 'true');
        localStorage.setItem('onboarding_complete', 'true');
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, subscriptionPlan: string = 'trial'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Validation basique
    if (!name || !email || !password) {
      setIsLoading(false);
      return { success: false, error: 'Tous les champs sont requis' };
    }

    // Validation nom
    if (name.trim().length < 2) {
      setIsLoading(false);
      return { success: false, error: 'Le nom doit contenir au moins 2 caractères' };
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsLoading(false);
      return { success: false, error: 'Format d\'email invalide' };
    }

    // Validation longueur mot de passe
    if (password.length < 8) {
      setIsLoading(false);
      return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
    }

    // Validation complexité mot de passe
    if (!/[A-Z]/.test(password)) {
      setIsLoading(false);
      return { success: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
    }
    if (!/[a-z]/.test(password)) {
      setIsLoading(false);
      return { success: false, error: 'Le mot de passe doit contenir au moins une minuscule' };
    }
    if (!/[0-9]/.test(password)) {
      setIsLoading(false);
      return { success: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
    }
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      // Inscription directe sans vérification préalable de l'email
      // Supabase gère déjà la vérification des emails en double
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name.trim(),
            subscription_plan: subscriptionPlan
          }
        }
      });

      if (error) {
        setIsLoading(false);
        
        // Gestion des erreurs spécifiques de Supabase
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Cet email est déjà utilisé. Essayez de vous connecter.' };
        }
        
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          return { success: false, error: 'Cet email est déjà associé à un compte existant.' };
        }

        if (error.message.includes('rate limit')) {
          return { success: false, error: 'Trop de tentatives. Veuillez attendre quelques instants.' };
        }

        if (error.message.includes('invalid')) {
          return { success: false, error: 'Les informations fournies sont invalides.' };
        }
        
        // Message générique pour les autres erreurs
        return { success: false, error: 'Impossible de créer le compte. Vérifiez vos informations et réessayez.' };
      }

      if (data.user) {
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Une erreur est survenue lors de l\'inscription' };
    } catch (error: any) {
      setIsLoading(false);
      
      // Gestion de l'erreur LockManager spécifique
      if (error?.message?.includes('LockManager')) {
        return { success: false, error: 'Erreur de connexion. Veuillez rafraîchir la page et réessayer.' };
      }
      
      return { success: false, error: 'Une erreur technique est survenue. Veuillez réessayer dans quelques instants.' };
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (import.meta.env.DEV) console.error('Reset password error:', error);
        setIsLoading(false);
        return false;
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Reset password error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasSeenOnboarding(false);
    setIsDemoMode(false);
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setIsLoading(false);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      resetPassword,
      isLoading,
      hasSeenOnboarding,
      completeOnboarding,
      isAuthenticated: !!user,
      updateNotificationSettings,
      selectedSubscriptionPlan,
      setSelectedSubscriptionPlan,
      hasSelectedPlan,
      completeSubscriptionSelection,
      isDemoMode,
      enterDemoMode,
      exitDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};