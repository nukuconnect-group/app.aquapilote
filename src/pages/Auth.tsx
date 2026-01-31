import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from '@/components/LoginDialog';
import EnhancedRegistration from '@/components/EnhancedRegistration';
import { supabase } from '@/integrations/supabase/clientConfig';

/**
 * Page d'authentification
 * Redirige automatiquement vers /dashboard si l'utilisateur est déjà connecté
 * Gère les callbacks OAuth de Google
 */
const Auth: React.FC = () => {
  const [showEnhancedRegister, setShowEnhancedRegister] = useState(false);
  const { user, isLoading, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback - check for error or code in URL
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.error('OAuth error:', error, errorDescription);
    }

    // Check for hash fragment containing access_token (OAuth callback)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      // OAuth callback detected - session will be handled by Supabase auth listener
      console.log('OAuth callback detected, session will be processed...');
    }
  }, [searchParams]);

  // Redirection automatique si déjà connecté ou en mode démo
  useEffect(() => {
    if (!isLoading && (user || isDemoMode)) {
      navigate('/dashboard', { replace: true });
    } else if (!isLoading && !user && !isDemoMode) {
      // S'assurer que la page reste sur /auth si pas connecté
      setShowEnhancedRegister(false);
    }
  }, [user, isLoading, isDemoMode, navigate]);

  const handleLogin = () => {
    setShowEnhancedRegister(false);
  };

  const handleRegister = () => {
    setShowEnhancedRegister(true);
  };

  // Afficher rien si en cours de redirection
  if ((user || isDemoMode) && !isLoading) {
    return null;
  }

  return (
    <>
      <LoginDialog 
        isOpen={!showEnhancedRegister} 
        onClose={() => {}}
        isRegistering={false} 
        onToggleMode={handleRegister}
      />
      
      {showEnhancedRegister && (
        <EnhancedRegistration
          onClose={() => setShowEnhancedRegister(false)}
          onSwitchToLogin={handleLogin}
        />
      )}
    </>
  );
};

export default Auth;
