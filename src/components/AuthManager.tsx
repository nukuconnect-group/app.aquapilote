import React, { useState } from 'react';
import LoginDialog from './LoginDialog';
import RegistrationForm from './RegistrationForm';

interface AuthManagerProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
  selectedPlan?: string | null;
}

const AuthManager: React.FC<AuthManagerProps> = ({
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
  selectedPlan
}) => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const handleToggleToRegister = () => {
    onCloseLogin();
    setShowRegisterForm(true);
  };

  const handleToggleToLogin = () => {
    setShowRegisterForm(false);
    onCloseRegister();
  };

  const handleCloseRegister = () => {
    setShowRegisterForm(false);
    onCloseRegister();
  };

  return (
    <>
      <LoginDialog
        isOpen={isLoginOpen}
        onClose={onCloseLogin}
        isRegistering={false}
        onToggleMode={handleToggleToRegister}
        selectedPlan={selectedPlan}
      />
      
      {(isRegisterOpen || showRegisterForm) && (
        <RegistrationForm
          isOpen={true}
          onClose={handleCloseRegister}
          selectedPlan={selectedPlan}
          onToggleToLogin={handleToggleToLogin}
        />
      )}
    </>
  );
};

export default AuthManager;