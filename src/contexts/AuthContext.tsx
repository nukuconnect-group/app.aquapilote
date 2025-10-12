import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

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

  // Fetch user profile and roles from Supabase
  const fetchUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      // Get roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      const role = userRoles?.[0]?.role || 'operator';

      const userData: User = {
        id: supabaseUser.id,
        name: profile?.full_name || supabaseUser.email || '',
        email: supabaseUser.email || '',
        role: role as 'admin' | 'manager' | 'operator',
        avatar: profile?.avatar_url,
        lastLogin: new Date().toISOString(),
        notifications: {
          email: true,
          desktop: true,
          sms: false
        }
      };

      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        await fetchUserData(data.user);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, subscriptionPlan: string = 'trial'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            subscription_plan: subscriptionPlan
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        // User will be automatically created with trigger
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        setIsLoading(false);
        return false;
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasSeenOnboarding(false);
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
      completeSubscriptionSelection
    }}>
      {children}
    </AuthContext.Provider>
  );
};