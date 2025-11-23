import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Onboarding from '@/components/Onboarding';

/**
 * Page de flux d'onboarding - Affichée aux nouveaux utilisateurs
 */
const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const handleComplete = () => {
    completeOnboarding();
  };

  const handleLogin = () => {
    handleComplete();
    navigate('/auth', { replace: true });
  };

  const handleRegister = () => {
    handleComplete();
    navigate('/auth', { replace: true });
  };

  return (
    <Onboarding 
      onComplete={handleComplete}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default OnboardingFlow;
