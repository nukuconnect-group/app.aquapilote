import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type ProductionUnitType = 
  | 'ecloserie' 
  | 'grossissement' 
  | 'transformation' 
  | 'conservation' 
  | 'fabrication_aliment' 
  | 'commercialisation';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  specifications: Record<string, any>;
  status: 'active' | 'maintenance' | 'inactive';
  unitId: string;
  purchasePrice?: number;
  purchaseDate?: string;
  depreciationRate?: number;
  currentValue?: number;
}

export interface ProductionCycle {
  id: string;
  unitId: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  targetQuantity: number;
  currentQuantity: number;
  notes: string;
}

export interface UnitFinancialData {
  unitId: string;
  revenue: number;
  expenses: number;
  profit: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export interface ProductionUnit {
  id: string;
  name: string;
  type: ProductionUnitType;
  description: string;
  isActive: boolean;
  capacity: number;
  currentStock: number;
  manager: string;
  createdAt: string;
  photoUrl?: string;
  customEquipment?: Equipment[];
  activeCycles?: ProductionCycle[];
  financialData?: UnitFinancialData;
}

export interface Infrastructure {
  id: string;
  name: string;
  unitId: string;
  type: string;
  customTypeName?: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  specifications: Record<string, any>;
}

// Purchase interface intégrée
export interface Purchase {
  id: string;
  date: string;
  category: string;
  subcategory?: string;
  description: string;
  supplier: string;
  amount: number;
  currency: 'XOF' | 'EUR' | 'USD' | 'MAD';
  quantity?: number;
  unit?: string;
  paymentMethod: string;
  reference?: string;
  unitId?: string;
  unitName?: string;
  status: 'pending' | 'received' | 'cancelled';
  deliveryDate?: string;
  notes?: string;
}

// Transaction interface pour le module comptabilité
export interface Transaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense';
  category: string;
  description: string;
  amount: number;
  currency: 'XOF' | 'EUR' | 'USD' | 'MAD';
  paymentMethod: string;
  reference?: string;
  supplier?: string;
  client?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  unitId?: string;
  unitName?: string;
  purchaseId?: string; // Lien avec les achats
}

// Interface pour les équipements à amortir
export interface DepreciableAsset {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  currency: 'XOF' | 'EUR' | 'USD' | 'MAD';
  purchaseDate: string;
  depreciationMethod: 'linear' | 'accelerated';
  usefulLife: number; // en années
  currentValue: number;
  accumulatedDepreciation: number;
  unitId?: string;
  status: 'active' | 'disposed' | 'inactive';
}

interface ProductionUnitsContextType {
  units: ProductionUnit[];
  infrastructures: Infrastructure[];
  transactions: Transaction[];
  purchases: Purchase[];
  depreciableAssets: DepreciableAsset[];
  currency: 'XOF' | 'EUR' | 'USD' | 'MAD';
  formatCurrency: (amount: number) => string;
  activeUnit: ProductionUnit | null;
  setActiveUnit: (unit: ProductionUnit | null) => void;
  setCurrency: (currency: 'XOF' | 'EUR' | 'USD' | 'MAD') => void;
  setInfrastructures: (infrastructures: Infrastructure[]) => void;
  addUnit: (unit: Omit<ProductionUnit, 'id' | 'createdAt'>) => void;
  updateUnit: (id: string, updates: Partial<ProductionUnit>) => void;
  deleteUnit: (id: string) => void;
  getUnitInfrastructures: (unitId: string) => Infrastructure[];
  addInfrastructure: (infrastructure: Omit<Infrastructure, 'id'>) => void;
  updateInfrastructure: (id: string, updates: Partial<Infrastructure>) => void;
  deleteInfrastructure: (id: string) => void;
  getUnitEquipment: (unitId: string) => Equipment[];
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  getUnitCycles: (unitId: string) => ProductionCycle[];
  addCycle: (cycle: Omit<ProductionCycle, 'id'>) => void;
  updateCycle: (id: string, updates: Partial<ProductionCycle>) => void;
  getUnitFinancialData: (unitId: string) => UnitFinancialData | null;
  getGlobalFinancialData: () => UnitFinancialData;
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getUnitTransactions: (unitId: string) => Transaction[];
  // Purchase methods
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  getUnitPurchases: (unitId: string) => Purchase[];
  // Depreciable assets methods
  addDepreciableAsset: (asset: Omit<DepreciableAsset, 'id'>) => void;
  updateDepreciableAsset: (id: string, updates: Partial<DepreciableAsset>) => void;
  deleteDepreciableAsset: (id: string) => void;
  getUnitDepreciableAssets: (unitId: string) => DepreciableAsset[];
  calculateDepreciation: (assetId: string) => number;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

const ProductionUnitsContext = createContext<ProductionUnitsContextType | undefined>(undefined);

export const useProductionUnits = () => {
  const context = useContext(ProductionUnitsContext);
  if (!context) {
    throw new Error('useProductionUnits must be used within a ProductionUnitsProvider');
  }
  return context;
};

// Données de démonstration
const getDemoUnits = (): ProductionUnit[] => [
  {
    id: 'ECLO001',
    name: 'Écloserie Principale',
    type: 'ecloserie',
    description: 'Production d\'alevins de tilapia et carpe',
    isActive: true,
    capacity: 100000,
    currentStock: 85000,
    manager: 'Dr. Marie Dubois',
    createdAt: '2024-01-15',
    financialData: {
      unitId: 'ECLO001',
      revenue: 25000,
      expenses: 15000,
      profit: 10000,
      monthlyData: [
        { month: 'Jan', revenue: 20000, expenses: 12000, profit: 8000 },
        { month: 'Fév', revenue: 22000, expenses: 13000, profit: 9000 },
        { month: 'Mar', revenue: 25000, expenses: 15000, profit: 10000 }
      ]
    }
  },
  {
    id: 'GROSS001',
    name: 'Unité de Grossissement A',
    type: 'grossissement',
    description: 'Élevage jusqu\'à maturité commerciale',
    isActive: true,
    capacity: 50000,
    currentStock: 42000,
    manager: 'Jean Martin',
    createdAt: '2024-02-01',
    financialData: {
      unitId: 'GROSS001',
      revenue: 45000,
      expenses: 28000,
      profit: 17000,
      monthlyData: [
        { month: 'Jan', revenue: 40000, expenses: 25000, profit: 15000 },
        { month: 'Fév', revenue: 42000, expenses: 26000, profit: 16000 },
        { month: 'Mar', revenue: 45000, expenses: 28000, profit: 17000 }
      ]
    }
  },
  {
    id: 'TRANSF001',
    name: 'Unité de Transformation',
    type: 'transformation',
    description: 'Découpe et préparation des poissons',
    isActive: true,
    capacity: 2000,
    currentStock: 1500,
    manager: 'Sarah Laurent',
    createdAt: '2024-03-10',
    financialData: {
      unitId: 'TRANSF001',
      revenue: 35000,
      expenses: 22000,
      profit: 13000,
      monthlyData: [
        { month: 'Jan', revenue: 30000, expenses: 18000, profit: 12000 },
        { month: 'Fév', revenue: 32000, expenses: 20000, profit: 12000 },
        { month: 'Mar', revenue: 35000, expenses: 22000, profit: 13000 }
      ]
    }
  }
];

const getDemoInfrastructures = (): Infrastructure[] => [
  {
    id: 'INF001',
    name: 'Bassin d\'incubation 1',
    unitId: 'ECLO001',
    type: 'bassin_incubation',
    capacity: 20000,
    status: 'active',
    specifications: { temperature: 26, ph: 7.2, oxygenLevel: 8.5 }
  },
  {
    id: 'INF002',
    name: 'Bassin de grossissement A1',
    unitId: 'GROSS001',
    type: 'bassin_grossissement',
    capacity: 15000,
    status: 'active',
    specifications: { volume: 15000, profondeur: 2.5 }
  },
  {
    id: 'INF003',
    name: 'Chambre froide principale',
    unitId: 'TRANSF001',
    type: 'chambre_froide',
    capacity: 1000,
    status: 'active',
    specifications: { temperature: -18, humidity: 85 }
  }
];

export const ProductionUnitsProvider = ({ children }: { children: ReactNode }) => {
  const { isDemoMode, isAuthenticated, user } = useAuth();
  const [currency, setCurrency] = useState<'XOF' | 'EUR' | 'USD' | 'MAD'>('XOF');
  
  // Initialiser avec des tableaux vides - les données démo seront ajoutées via useEffect
  const [units, setUnits] = useState<ProductionUnit[]>([]);
  const [infrastructures, setInfrastructures] = useState<Infrastructure[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [cycles, setCycles] = useState<ProductionCycle[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depreciableAssets, setDepreciableAssets] = useState<DepreciableAsset[]>([]);
  const [activeUnit, setActiveUnit] = useState<ProductionUnit | null>(null);

  // Charger les données démo uniquement en mode démonstration
  useEffect(() => {
    if (isDemoMode) {
      // Mode démo: charger les données de démonstration
      const demoUnits = getDemoUnits();
      const demoInfrastructures = getDemoInfrastructures();
      
      setUnits(demoUnits);
      setInfrastructures(demoInfrastructures);
      setActiveUnit(demoUnits[0] || null);
      
      // Données démo pour équipements
      setEquipment([
        {
          id: 'EQ001',
          name: 'Four électrique principal',
          type: 'four_electrique',
          unitId: 'TRANSF001',
          status: 'active',
          specifications: { power: '15kW', capacity: '500kg/h', temperature_max: 200 },
          purchasePrice: 2500000,
          purchaseDate: '2024-01-15',
          depreciationRate: 10,
          currentValue: 2250000
        }
      ]);
      
      // Données démo pour cycles
      setCycles([
        {
          id: 'CY001',
          unitId: 'ECLO001',
          name: 'Cycle Tilapia Q1 2024',
          startDate: '2024-01-15',
          status: 'active',
          targetQuantity: 50000,
          currentQuantity: 45000,
          notes: 'Excellente croissance observée'
        }
      ]);
      
      // Données démo pour achats
      setPurchases([
        {
          id: '1',
          date: '2024-01-18',
          category: 'Aliments',
          subcategory: 'Granulés flottants',
          description: 'Aliment poisson croissance 25kg',
          supplier: 'Biomar France',
          amount: 425000,
          currency: 'XOF',
          quantity: 10,
          unit: 'sacs',
          paymentMethod: 'Virement',
          reference: 'CMD-2024-001',
          unitId: 'GROSS001',
          unitName: 'Unité de Grossissement A',
          status: 'received'
        }
      ]);
      
      // Données démo pour transactions
      setTransactions([
        {
          id: '1',
          date: '2024-01-18',
          type: 'revenue',
          category: 'Vente de poissons',
          description: 'Vente carpes - Restaurant Les Saveurs',
          amount: 1250000,
          currency: 'XOF',
          paymentMethod: 'Virement',
          client: 'Restaurant Les Saveurs',
          status: 'confirmed',
          unitId: 'GROSS001',
          unitName: 'Unité de Grossissement A'
        }
      ]);
      
      // Données démo pour amortissements
      setDepreciableAssets([
        {
          id: '1',
          name: 'Four électrique principal',
          category: 'Équipements de transformation',
          purchasePrice: 2500000,
          currency: 'XOF',
          purchaseDate: '2024-01-15',
          depreciationMethod: 'linear',
          usefulLife: 10,
          currentValue: 2250000,
          accumulatedDepreciation: 250000,
          unitId: 'TRANSF001',
          status: 'active'
        }
      ]);
    } else if (isAuthenticated && user) {
      // Utilisateur connecté: commencer avec des données vides
      // Les vraies données viendront de la base de données via les hooks appropriés
      setUnits([]);
      setInfrastructures([]);
      setEquipment([]);
      setCycles([]);
      setPurchases([]);
      setTransactions([]);
      setDepreciableAssets([]);
      setActiveUnit(null);
    }
  }, [isDemoMode, isAuthenticated, user]);

  const formatCurrency = (amount: number): string => {
    const currencySymbols = {
      'XOF': 'FCFA',
      'EUR': '€',
      'USD': '$',
      'MAD': 'DH'
    };
    
    const symbol = currencySymbols[currency];
    const formatted = amount.toLocaleString('fr-FR');
    
    if (currency === 'XOF' || currency === 'MAD') {
      return `${formatted} ${symbol}`;
    } else {
      return currency === 'USD' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
    }
  };

  const exchangeRates = {
    'XOF': 1,
    'EUR': 655.957,
    'USD': 600,
    'MAD': 10.8
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convertir d'abord en XOF (Franc CFA)
    const xofAmount = fromCurrency === 'XOF' ? amount : amount * exchangeRates[fromCurrency as keyof typeof exchangeRates];
    
    // Puis convertir vers la devise cible
    return toCurrency === 'XOF' ? xofAmount : xofAmount / exchangeRates[toCurrency as keyof typeof exchangeRates];
  };

  const addUnit = (unitData: Omit<ProductionUnit, 'id' | 'createdAt'>) => {
    const newUnit: ProductionUnit = {
      ...unitData,
      id: `UNIT${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUnits([...units, newUnit]);
  };

  const updateUnit = (id: string, updates: Partial<ProductionUnit>) => {
    setUnits(units.map(unit => 
      unit.id === id ? { ...unit, ...updates } : unit
    ));
  };

  const deleteUnit = (id: string) => {
    setUnits(units.filter(unit => unit.id !== id));
    setInfrastructures(infrastructures.filter(inf => inf.unitId !== id));
    setEquipment(equipment.filter(eq => eq.unitId !== id));
    setCycles(cycles.filter(cy => cy.unitId !== id));
  };

  const getUnitInfrastructures = (unitId: string) => {
    return infrastructures.filter(inf => inf.unitId === unitId);
  };

  const addInfrastructure = (infraData: Omit<Infrastructure, 'id'>) => {
    const newInfrastructure: Infrastructure = {
      ...infraData,
      id: `INF${Date.now()}`
    };
    setInfrastructures([...infrastructures, newInfrastructure]);
  };

  const updateInfrastructure = (id: string, updates: Partial<Infrastructure>) => {
    setInfrastructures(infrastructures.map(inf => 
      inf.id === id ? { ...inf, ...updates } : inf
    ));
  };

  const deleteInfrastructure = (id: string) => {
    setInfrastructures(infrastructures.filter(inf => inf.id !== id));
  };

  const getUnitEquipment = (unitId: string) => {
    return equipment.filter(eq => eq.unitId === unitId);
  };

  const addEquipment = (equipData: Omit<Equipment, 'id'>) => {
    const newEquipment: Equipment = {
      ...equipData,
      id: `EQ${Date.now()}`
    };
    setEquipment([...equipment, newEquipment]);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipment(equipment.map(eq => 
      eq.id === id ? { ...eq, ...updates } : eq
    ));
  };

  const getUnitCycles = (unitId: string) => {
    return cycles.filter(cy => cy.unitId === unitId);
  };

  const addCycle = (cycleData: Omit<ProductionCycle, 'id'>) => {
    const newCycle: ProductionCycle = {
      ...cycleData,
      id: `CY${Date.now()}`
    };
    setCycles([...cycles, newCycle]);
  };

  const updateCycle = (id: string, updates: Partial<ProductionCycle>) => {
    setCycles(cycles.map(cy => 
      cy.id === id ? { ...cy, ...updates } : cy
    ));
  };

  const getUnitFinancialData = (unitId: string): UnitFinancialData | null => {
    const unit = units.find(u => u.id === unitId);
    return unit?.financialData || null;
  };

  const getGlobalFinancialData = (): UnitFinancialData => {
    const allFinancialData = units.map(unit => unit.financialData).filter(Boolean) as UnitFinancialData[];
    
    const totalRevenue = allFinancialData.reduce((sum, data) => sum + data.revenue, 0);
    const totalExpenses = allFinancialData.reduce((sum, data) => sum + data.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;

    // Aggregate monthly data
    const monthlyData = ['Jan', 'Fév', 'Mar'].map(month => {
      const monthRevenue = allFinancialData.reduce((sum, data) => {
        const monthData = data.monthlyData.find(m => m.month === month);
        return sum + (monthData?.revenue || 0);
      }, 0);
      
      const monthExpenses = allFinancialData.reduce((sum, data) => {
        const monthData = data.monthlyData.find(m => m.month === month);
        return sum + (monthData?.expenses || 0);
      }, 0);

      return {
        month,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      };
    });

    return {
      unitId: 'GLOBAL',
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalProfit,
      monthlyData
    };
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      currency: transactionData.currency || currency
    };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getUnitTransactions = (unitId: string) => {
    return transactions.filter(t => t.unitId === unitId);
  };

  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: Date.now().toString(),
      currency: purchaseData.currency || currency
    };
    setPurchases([...purchases, newPurchase]);

    if (newPurchase.status === 'received') {
      const correspondingTransaction: Omit<Transaction, 'id'> = {
        date: newPurchase.date,
        type: 'expense',
        category: newPurchase.category,
        description: newPurchase.description,
        amount: newPurchase.amount,
        currency: newPurchase.currency,
        paymentMethod: newPurchase.paymentMethod,
        supplier: newPurchase.supplier,
        status: 'confirmed',
        unitId: newPurchase.unitId,
        unitName: newPurchase.unitName,
        purchaseId: newPurchase.id,
        reference: newPurchase.reference
      };
      addTransaction(correspondingTransaction);
    }
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    setPurchases(purchases.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));

    const correspondingTransaction = transactions.find(t => t.purchaseId === id);
    if (correspondingTransaction && updates.status === 'received') {
      updateTransaction(correspondingTransaction.id, {
        status: 'confirmed',
        amount: updates.amount || correspondingTransaction.amount
      });
    }
  };

  const deletePurchase = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
    const correspondingTransaction = transactions.find(t => t.purchaseId === id);
    if (correspondingTransaction) {
      deleteTransaction(correspondingTransaction.id);
    }
  };

  const getUnitPurchases = (unitId: string) => {
    return purchases.filter(p => p.unitId === unitId);
  };

  const addDepreciableAsset = (assetData: Omit<DepreciableAsset, 'id'>) => {
    const newAsset: DepreciableAsset = {
      ...assetData,
      id: Date.now().toString(),
      currency: assetData.currency || (currency === 'XOF' ? 'XOF' : currency)
    };
    setDepreciableAssets([...depreciableAssets, newAsset]);
  };

  const updateDepreciableAsset = (id: string, updates: Partial<DepreciableAsset>) => {
    setDepreciableAssets(depreciableAssets.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ));
  };

  const deleteDepreciableAsset = (id: string) => {
    setDepreciableAssets(depreciableAssets.filter(asset => asset.id !== id));
  };

  const getUnitDepreciableAssets = (unitId: string) => {
    return depreciableAssets.filter(asset => asset.unitId === unitId);
  };

  const calculateDepreciation = (assetId: string): number => {
    const asset = depreciableAssets.find(a => a.id === assetId);
    if (!asset) return 0;

    const purchaseDate = new Date(asset.purchaseDate);
    const currentDate = new Date();
    const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (asset.depreciationMethod === 'linear') {
      const annualDepreciation = asset.purchasePrice / asset.usefulLife;
      return Math.min(annualDepreciation * yearsElapsed, asset.purchasePrice);
    }

    return 0;
  };

  return (
    <ProductionUnitsContext.Provider value={{
      units,
      infrastructures,
      transactions,
      purchases,
      depreciableAssets,
      currency,
      formatCurrency,
      activeUnit,
      setActiveUnit,
      setCurrency,
      setInfrastructures,
      addUnit,
      updateUnit,
      deleteUnit,
      getUnitInfrastructures,
      addInfrastructure,
      updateInfrastructure,
      deleteInfrastructure,
      getUnitEquipment,
      addEquipment,
      updateEquipment,
      getUnitCycles,
      addCycle,
      updateCycle,
      getUnitFinancialData,
      getGlobalFinancialData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getUnitTransactions,
      addPurchase,
      updatePurchase,
      deletePurchase,
      getUnitPurchases,
      addDepreciableAsset,
      updateDepreciableAsset,
      deleteDepreciableAsset,
      getUnitDepreciableAssets,
      calculateDepreciation,
      convertCurrency
    }}>
      {children}
    </ProductionUnitsContext.Provider>
  );
};
