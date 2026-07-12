import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from '@/components/LoginDialog';
import EnhancedRegistration from '@/components/EnhancedRegistration';

/**
 * Page d'authentification
 * Redirige automatiquement vers /dashboard si l'utilisateur est déjà connecté.
 * Supporte /auth?mode=register pour partager directement le lien d'inscription.
 */
const Auth: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRegister = searchParams.get('mode') === 'register';
  const [showEnhancedRegister, setShowEnhancedRegister] = useState(initialRegister);
  const { user, isLoading, isDemoMode } = useAuth();
  const navigate = useNavigate();

  // Redirection automatique si déjà connecté ou en mode démo
  useEffect(() => {
    if (!isLoading && (user || isDemoMode)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, isDemoMode, navigate]);

  // Sync URL with current mode so links are shareable
  useEffect(() => {
    if (showEnhancedRegister && searchParams.get('mode') !== 'register') {
      setSearchParams({ mode: 'register' }, { replace: true });
    } else if (!showEnhancedRegister && searchParams.get('mode')) {
      setSearchParams({}, { replace: true });
    }
  }, [showEnhancedRegister]);

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
