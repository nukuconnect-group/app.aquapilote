import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Page d'accueil - Redirige directement vers le dashboard
 */
const Welcome: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Welcome;
