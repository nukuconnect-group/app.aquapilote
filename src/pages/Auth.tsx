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
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleLogin = () => {
    setShowEnhancedRegister(false);
  };

  const handleRegister = () => {
    setShowEnhancedRegister(true);
  };

  // Afficher rien si en cours de redirection
  if (user && !isLoading) {
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
