import React from 'react';
import PrivacyPolicy from './PrivacyPolicy';
interface OnboardingProps {
  onComplete: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({
  onComplete,
  onLogin,
  onRegister
}) => {
  const handleAccept = () => {
    onComplete();
    onLogin();
  };

  return <PrivacyPolicy onAccept={handleAccept} />;
};
export default Onboarding;