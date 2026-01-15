import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/clientConfig';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { initializeDemoData, clearDemoData } from '@/lib/demoData';

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
  isSuspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  country?: string;
  countryCode?: string;
  isTeamMember?: boolean;
  teamMemberOwnerId?: string;
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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    // Initialiser depuis localStorage
    return localStorage.getItem('aqua_pilot_onboarding') === 'true';
  });
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

      // Check if user is a team member (by email)
      let isTeamMember = false;
      let teamMemberOwnerId: string | undefined;
      
      if (supabaseUser.email) {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('owner_id, status')
          .eq('member_email', supabaseUser.email.toLowerCase())
          .eq('status', 'active')
          .maybeSingle();
        
        if (teamMember) {
          isTeamMember = true;
          teamMemberOwnerId = teamMember.owner_id;
        }
      }

      const role = userRoles && userRoles.length > 0 ? userRoles[0].role : 'user';

      const userData: User = {
        id: supabaseUser.id,
        name: profile?.full_name || supabaseUser.email || '',
        email: supabaseUser.email || '',
        role: role as 'admin' | 'manager' | 'operator' | 'user',
        avatar: profile?.avatar_url || undefined,
        lastLogin: new Date().toISOString(),
        isSuspended: profile?.is_suspended || false,
        suspensionReason: profile?.suspension_reason || undefined,
        suspendedAt: profile?.suspended_at || undefined,
        country: profile?.country || undefined,
        countryCode: profile?.country_code || undefined,
        isTeamMember,
        teamMemberOwnerId,
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

  // Set up auth state listener with improved session persistence (OPTIMIZED - no "verification de session" delay)
  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout | null = null;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        // Immediate update for session (no console log to reduce noise)
        setSession(session);
        
        if (session?.user) {
          // Utiliser setTimeout pour éviter les deadlocks - IMMEDIATE
          setTimeout(async () => {
            if (mounted) {
              await fetchUserData(session.user);
              setIsLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }

        // Gérer les événements spécifiques
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsDemoMode(false);
        }
      }
    );

    // THEN check for existing session - FAST PATH with timeout
    const initializeSession = async () => {
      try {
        // Fast timeout for session check - don't block UI
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        );

        let sessionResult;
        try {
          sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: Session | null }, error: any };
        } catch {
          // Timeout - continue without session, let auth listener handle it
          if (mounted) setIsLoading(false);
          return;
        }

        const { data: { session }, error } = sessionResult;
        
        if (error || !mounted) {
          if (mounted) setIsLoading(false);
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          await fetchUserData(session.user);
        }
        
        setIsLoading(false);
      } catch (error) {
        if (mounted) setIsLoading(false);
      }
    };

    initializeSession();

    // Rafraîchir la session périodiquement (toutes les 15 minutes - less aggressive)
    refreshInterval = setInterval(async () => {
      if (session?.user && navigator.onLine) {
        try {
          await supabase.auth.refreshSession();
        } catch {
          // Silent error - don't spam console
        }
      }
    }, 15 * 60 * 1000);

    // Set up realtime subscription for profile updates
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;
    
    // Attendre que la session soit chargée avant de s'abonner
    const setupRealtimeSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && mounted) {
        profileChannel = supabase
          .channel('profile-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${session.user.id}`
            },
            (payload) => {
              if (session?.user && mounted) {
                setTimeout(() => {
                  fetchUserData(session.user);
                }, 0);
              }
            }
          )
          .subscribe();
      }
    };
    
    setupRealtimeSubscription();

    // Écouter les événements de visibilité pour restaurer la session
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && session?.user) {
        // Vérifier et rafraîchir la session quand l'app revient au premier plan
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (error || !currentSession) {
            console.log('Session lost, user needs to re-authenticate');
          }
        } catch (err) {
          console.error('Error checking session on visibility change:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
    localStorage.setItem('aqua_pilot_onboarding', 'true');
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
        // Effacer les données de démonstration pour un utilisateur réel
        clearDemoData();
        setIsDemoMode(false);
        
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
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setIsLoading(false);
      return { success: false, error: 'Le mot de passe doit contenir au moins un caractère spécial' };
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
        // Detect country automatically and update profile
        try {
          console.log('Detecting country for new user:', data.user.id);
          const { data: countryData, error: countryError } = await supabase.functions.invoke('detect-country', {
            body: {
              user_id: data.user.id,
              update_profile: true
            }
          });
          
          if (countryError) {
            console.error('Country detection error:', countryError);
          } else if (countryData?.country) {
            console.log('Country detected:', countryData.country, countryData.countryCode);
          } else {
            console.log('No country detected from IP');
          }
        } catch (countryDetectionError) {
          console.error('Country detection failed:', countryDetectionError);
        }
        
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
    // Ne pas effacer l'onboarding au logout - l'utilisateur l'a déjà vu
    setIsDemoMode(false);
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setIsLoading(false);
    // Marquer l'onboarding comme vu en mode démo
    localStorage.setItem('aqua_pilot_onboarding', 'true');
    setHasSeenOnboarding(true);
    // Initialiser les données fictives
    initializeDemoData();
    
    // Créer un utilisateur démonstration
    const demoUser: User = {
      id: 'demo-user',
      name: 'Utilisateur Démo',
      email: 'demo@aquapilot.com',
      role: 'user',
      notifications: {
        email: true,
        desktop: true,
        sms: false
      }
    };
    setUser(demoUser);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    setUser(null);
    // Effacer les données fictives
    clearDemoData();
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