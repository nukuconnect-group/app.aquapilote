/**
 * Données fictives pour le mode démonstration
 * Chaque nouvelle session en mode démo génère des données uniques
 */

export interface DemoProductionUnit {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface DemoProductionCycle {
  id: string;
  unitId: string;
  unitName: string;
  unitType: string;
  name: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'completed' | 'planned';
  initialQuantity: number;
  currentQuantity: number;
  targetQuantity: number;
  species: string;
}

export interface DemoFeedingRecord {
  id: string;
  unitId: string;
  cycleId: string;
  date: string;
  time: string;
  quantity: number;
  feedType: string;
  notes: string;
}

export interface DemoHealthRecord {
  id: string;
  unitId: string;
  cycleId: string;
  date: string;
  temperature: number;
  ph: number;
  oxygen: number;
  mortality: number;
  averageWeight: number;
  notes: string;
}

/**
 * Génère des unités de production fictives
 */
export const generateDemoProductionUnits = (): DemoProductionUnit[] => {
  return [
    {
      id: 'demo-unit-1',
      name: 'Ferme Koumba Diallo',
      type: 'Bassin d\'élevage',
      capacity: 50000,
      status: 'active'
    },
    {
      id: 'demo-unit-2',
      name: 'Étang Mamadou Traoré',
      type: 'Étang',
      capacity: 30000,
      status: 'active'
    },
    {
      id: 'demo-unit-3',
      name: 'Nurserie Fatou Sow',
      type: 'Nurserie',
      capacity: 20000,
      status: 'active'
    },
    {
      id: 'demo-unit-4',
      name: 'Cage Ibrahima Ndiaye',
      type: 'Cage en mer',
      capacity: 40000,
      status: 'maintenance'
    }
  ];
};

/**
 * Génère des cycles de production fictifs
 */
export const generateDemoProductionCycles = (units: DemoProductionUnit[]): DemoProductionCycle[] => {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const twoMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());

  return [
    {
      id: 'demo-cycle-1',
      unitId: units[0].id,
      unitName: units[0].name,
      unitType: units[0].type,
      name: 'Cycle Tilapia Koumba',
      startDate: threeMonthsAgo.toISOString().split('T')[0],
      endDate: null,
      status: 'active',
      initialQuantity: 5000,
      currentQuantity: 4750,
      targetQuantity: 4000,
      species: 'Tilapia du Nil'
    },
    {
      id: 'demo-cycle-2',
      unitId: units[1].id,
      unitName: units[1].name,
      unitType: units[1].type,
      name: 'Cycle Clarias Mamadou',
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: null,
      status: 'active',
      initialQuantity: 3000,
      currentQuantity: 2950,
      targetQuantity: 2500,
      species: 'Clarias (Silure africain)'
    },
    {
      id: 'demo-cycle-3',
      unitId: units[2].id,
      unitName: units[2].name,
      unitType: units[2].type,
      name: 'Alevinage Fatou 2024',
      startDate: now.toISOString().split('T')[0],
      endDate: twoMonthsFromNow.toISOString().split('T')[0],
      status: 'planned',
      initialQuantity: 10000,
      currentQuantity: 10000,
      targetQuantity: 9000,
      species: 'Tilapia du Nil'
    }
  ];
};

/**
 * Génère des enregistrements d'alimentation fictifs
 */
export const generateDemoFeedingRecords = (cycles: DemoProductionCycle[]): DemoFeedingRecord[] => {
  const records: DemoFeedingRecord[] = [];
  const now = new Date();

  cycles.forEach((cycle, cycleIndex) => {
    if (cycle.status === 'active') {
      // Générer 10 enregistrements par cycle actif
      for (let i = 0; i < 10; i++) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        records.push({
          id: `demo-feeding-${cycleIndex}-${i}`,
          unitId: cycle.unitId,
          cycleId: cycle.id,
          date: date.toISOString().split('T')[0],
          time: `${8 + (i % 3) * 4}:00`,
          quantity: 25 + Math.random() * 10,
          feedType: i % 2 === 0 ? 'Granulés 3mm' : 'Granulés 5mm',
          notes: i % 3 === 0 ? 'Appétit normal' : 'Bon comportement alimentaire'
        });
      }
    }
  });

  return records;
};

/**
 * Génère des enregistrements de santé fictifs
 */
export const generateDemoHealthRecords = (cycles: DemoProductionCycle[]): DemoHealthRecord[] => {
  const records: DemoHealthRecord[] = [];
  const now = new Date();

  cycles.forEach((cycle, cycleIndex) => {
    if (cycle.status === 'active') {
      // Générer 7 enregistrements par cycle actif (une semaine)
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        records.push({
          id: `demo-health-${cycleIndex}-${i}`,
          unitId: cycle.unitId,
          cycleId: cycle.id,
          date: date.toISOString().split('T')[0],
          temperature: 24 + Math.random() * 4,
          ph: 6.8 + Math.random() * 0.8,
          oxygen: 6 + Math.random() * 2,
          mortality: Math.floor(Math.random() * 5),
          averageWeight: 150 + (i * 10) + Math.random() * 20,
          notes: i % 2 === 0 ? 'Paramètres normaux' : 'Population en bonne santé'
        });
      }
    }
  });

  return records;
};

/**
 * Génère des lots de poissons fictifs
 */
export const generateDemoLivestockBatches = (): any[] => {
  const now = new Date();
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
  
  return [
    {
      id: 'demo-livestock-1',
      user_id: 'demo-user',
      species: 'Tilapia du Nil',
      variety: 'Rouge',
      type: 'Alevins',
      quantity: 5000,
      average_weight: 50,
      total_weight: 250000,
      acquisition_date: twoMonthsAgo.toISOString().split('T')[0],
      source: 'Écloserie Koumba',
      unit_id: 'demo-unit-1',
      unit_name: 'Ferme Koumba Diallo',
      status: 'healthy',
      notes: 'Lot en excellente santé',
      expected_harvest_date: new Date(now.getFullYear(), now.getMonth() + 4, now.getDate()).toISOString().split('T')[0],
      current_age: 60,
      feeding_plan: 'Plan standard tilapia',
      last_health_check: now.toISOString().split('T')[0],
      expected_survival_rate: 95,
      male_count: 2500,
      female_count: 2500,
      created_at: twoMonthsAgo.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: 'demo-livestock-2',
      user_id: 'demo-user',
      species: 'Clarias (Silure africain)',
      variety: null,
      type: 'Juvéniles',
      quantity: 3000,
      average_weight: 120,
      total_weight: 360000,
      acquisition_date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().split('T')[0],
      source: 'Ferme Traoré',
      unit_id: 'demo-unit-2',
      unit_name: 'Étang Mamadou Traoré',
      status: 'healthy',
      notes: 'Bonne croissance',
      expected_harvest_date: new Date(now.getFullYear(), now.getMonth() + 3, 15).toISOString().split('T')[0],
      current_age: 45,
      feeding_plan: 'Plan intensif',
      last_health_check: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString().split('T')[0],
      expected_survival_rate: 92,
      male_count: 1500,
      female_count: 1500,
      created_at: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(),
      updated_at: now.toISOString()
    }
  ];
};

/**
 * Génère des ventes fictives
 */
export const generateDemoSales = (): any[] => {
  const now = new Date();
  
  return [
    {
      id: 'demo-sale-1',
      user_id: 'demo-user',
      date: now.toISOString().split('T')[0],
      client_name: 'Restaurant Les Délices',
      client_contact: '+221 77 123 45 67',
      total_amount: 450000,
      paid_amount: 450000,
      unit_id: 'demo-unit-1',
      status: 'confirmed',
      payment_method: 'Espèces',
      notes: 'Livraison effectuée',
      is_credit: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: 'demo-sale-2',
      user_id: 'demo-user',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString().split('T')[0],
      client_name: 'Supermarché Auchan',
      client_contact: '+221 77 987 65 43',
      total_amount: 1200000,
      paid_amount: 600000,
      unit_id: 'demo-unit-2',
      status: 'pending',
      payment_method: 'Virement',
      notes: 'Paiement partiel - solde à 30 jours',
      is_credit: true,
      due_date: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString().split('T')[0],
      payment_terms: '50% à la livraison, solde à 30 jours',
      created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString(),
      updated_at: now.toISOString()
    }
  ];
};

/**
 * Génère des enregistrements de reproduction fictifs
 */
export const generateDemoReproductionRecords = (): any[] => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  return [
    {
      id: 'demo-repro-1',
      user_id: 'demo-user',
      unit_id: 'demo-unit-3',
      unit_name: 'Nurserie Fatou Sow',
      species: 'Tilapia du Nil',
      reproduction_method: 'hormonal',
      reproduction_date: oneMonthAgo.toISOString().split('T')[0],
      broodstock_male_count: 10,
      broodstock_female_count: 30,
      hormone_used: 'HCG',
      hormone_dose: 500,
      spawning_date: new Date(oneMonthAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      spawning_rate: 85,
      egg_count: 50000,
      fertilization_rate: 90,
      hatching_date: new Date(oneMonthAgo.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hatching_rate: 88,
      larvae_count: 39600,
      fry_count: 38000,
      survival_rate: 96,
      status: 'completed',
      notes: 'Excellente reproduction',
      created_at: oneMonthAgo.toISOString(),
      updated_at: now.toISOString()
    }
  ];
};

/**
 * Génère des fournisseurs fictifs
 */
export const generateDemoSuppliers = (): any[] => {
  return [
    {
      id: 'demo-supplier-1',
      user_id: 'demo-user',
      name: 'Biomar Sénégal',
      category: 'Aliments',
      contact: 'Moussa Diop',
      phone: '+221 77 555 01 23',
      email: 'contact@biomar-sn.com',
      address: 'Zone Industrielle, Dakar',
      products: ['Granulés flottants', 'Aliment croissance', 'Aliment finition'],
      rating: 5,
      status: 'active',
      notes: 'Livraison rapide, bon rapport qualité-prix',
      unit_id: 'demo-unit-1',
      created_at: '2024-01-01',
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-supplier-2',
      user_id: 'demo-user',
      name: 'Aqua Service SARL',
      category: 'Équipements',
      contact: 'Fatima Ba',
      phone: '+221 77 444 56 78',
      email: 'info@aquaservice.sn',
      address: 'Pikine, Dakar',
      products: ['Pompes', 'Aérateurs', 'Filets', 'Équipements de mesure'],
      rating: 4,
      status: 'active',
      notes: 'Service après-vente excellent',
      unit_id: 'demo-unit-2',
      created_at: '2024-01-15',
      updated_at: new Date().toISOString()
    }
  ];
};

/**
 * Initialise toutes les données de démonstration
 */
export const initializeDemoData = () => {
  const units = generateDemoProductionUnits();
  const cycles = generateDemoProductionCycles(units);
  const feedingRecords = generateDemoFeedingRecords(cycles);
  const healthRecords = generateDemoHealthRecords(cycles);
  const livestockBatches = generateDemoLivestockBatches();
  const sales = generateDemoSales();
  const reproductionRecords = generateDemoReproductionRecords();
  const suppliers = generateDemoSuppliers();

  // Stocker dans localStorage pour la session
  localStorage.setItem('demo_production_units', JSON.stringify(units));
  localStorage.setItem('demo_production_cycles', JSON.stringify(cycles));
  localStorage.setItem('demo_feeding_records', JSON.stringify(feedingRecords));
  localStorage.setItem('demo_health_records', JSON.stringify(healthRecords));
  localStorage.setItem('demo_livestock_batches', JSON.stringify(livestockBatches));
  localStorage.setItem('demo_sales', JSON.stringify(sales));
  localStorage.setItem('demo_reproduction_records', JSON.stringify(reproductionRecords));
  localStorage.setItem('demo_suppliers', JSON.stringify(suppliers));

  return {
    units,
    cycles,
    feedingRecords,
    healthRecords,
    livestockBatches,
    sales,
    reproductionRecords,
    suppliers
  };
};

/**
 * Récupère les données de démonstration depuis localStorage
 */
export const getDemoData = () => {
  const units = JSON.parse(localStorage.getItem('demo_production_units') || '[]');
  const cycles = JSON.parse(localStorage.getItem('demo_production_cycles') || '[]');
  const feedingRecords = JSON.parse(localStorage.getItem('demo_feeding_records') || '[]');
  const healthRecords = JSON.parse(localStorage.getItem('demo_health_records') || '[]');
  const livestockBatches = JSON.parse(localStorage.getItem('demo_livestock_batches') || '[]');
  const sales = JSON.parse(localStorage.getItem('demo_sales') || '[]');
  const reproductionRecords = JSON.parse(localStorage.getItem('demo_reproduction_records') || '[]');
  const suppliers = JSON.parse(localStorage.getItem('demo_suppliers') || '[]');

  // Si pas de données, initialiser
  if (units.length === 0) {
    return initializeDemoData();
  }

  return {
    units,
    cycles,
    feedingRecords,
    healthRecords,
    livestockBatches,
    sales,
    reproductionRecords,
    suppliers
  };
};

/**
 * Efface toutes les données de démonstration
 */
export const clearDemoData = () => {
  localStorage.removeItem('demo_production_units');
  localStorage.removeItem('demo_production_cycles');
  localStorage.removeItem('demo_feeding_records');
  localStorage.removeItem('demo_health_records');
  localStorage.removeItem('demo_livestock_batches');
  localStorage.removeItem('demo_sales');
  localStorage.removeItem('demo_reproduction_records');
  localStorage.removeItem('demo_suppliers');
};
