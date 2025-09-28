
import React from 'react';
import MainLayout from '@/components/MainLayout';
import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <MainLayout />
      <Toaster />
    </div>
  );
};

export default App;
