import React from 'react';
import MainLayout from '@/components/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';

const Index = () => {
  return (
    <AuthProvider>
      <ProductionUnitsProvider>
        <IoTProvider>
          <MainLayout />
        </IoTProvider>
      </ProductionUnitsProvider>
    </AuthProvider>
  );
};
export default Index;