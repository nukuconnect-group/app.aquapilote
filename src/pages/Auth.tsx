import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from '@/components/LoginDialog';
import EnhancedRegistration from '@/components/EnhancedRegistration';

/**
 * Page d'authentification
 * Redirige automatiquement vers /dashboard si l'utilisateur est déjà connecté
 */
const Auth: React.FC = () => {
  const [showEnhancedRegister, setShowEnhancedRegister] = useState(false);
  const { user, isLoading, isDemoMode } = useAuth();
  const navigate = useNavigate();

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
