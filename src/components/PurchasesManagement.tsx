
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import PurchaseManager from './accounting/PurchaseManager';

const PurchasesManagement = () => {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8" />
              Gestion des Achats
            </h2>
            <p className="text-orange-100">Suivi et catégorisation des dépenses d'exploitation</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <PurchaseManager />
    </div>
  );
};

export default PurchasesManagement;
