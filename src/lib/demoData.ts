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
 * Initialise toutes les données de démonstration
 */
export const initializeDemoData = () => {
  const units = generateDemoProductionUnits();
  const cycles = generateDemoProductionCycles(units);
  const feedingRecords = generateDemoFeedingRecords(cycles);
  const healthRecords = generateDemoHealthRecords(cycles);

  // Stocker dans localStorage pour la session
  localStorage.setItem('demo_production_units', JSON.stringify(units));
  localStorage.setItem('demo_production_cycles', JSON.stringify(cycles));
  localStorage.setItem('demo_feeding_records', JSON.stringify(feedingRecords));
  localStorage.setItem('demo_health_records', JSON.stringify(healthRecords));

  return {
    units,
    cycles,
    feedingRecords,
    healthRecords
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

  // Si pas de données, initialiser
  if (units.length === 0) {
    return initializeDemoData();
  }

  return {
    units,
    cycles,
    feedingRecords,
    healthRecords
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
};
