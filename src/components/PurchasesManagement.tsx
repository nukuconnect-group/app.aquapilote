
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import PurchaseManager from './accounting/PurchaseManager';
import ProductionUnitSelector from './ProductionUnitSelector';
import { useSettings } from '@/contexts/SettingsContext';

const PurchasesManagement = () => {
  const { t } = useSettings();
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 md:p-6 rounded-xl text-white">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
              <span>{t('purchases_management')}</span>
            </h2>
            <p className="text-sm md:text-base text-orange-100">{t('purchases_management_desc')}</p>
          </div>
          <ProductionUnitSelector />
        </div>
      </div>

      {/* Contenu principal */}
      <PurchaseManager />
    </div>
  );
};

export default PurchasesManagement;
