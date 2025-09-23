
import React from 'react';
import IntelligentDashboard from './IntelligentDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tableau de bord intelligent */}
      <IntelligentDashboard />
    </div>
  );
};

export default Dashboard;
