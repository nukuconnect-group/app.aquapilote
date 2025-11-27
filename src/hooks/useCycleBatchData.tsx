import { useState, useEffect } from 'react';
import { useCycleInfrastructures } from './useCycleInfrastructures';
import { useLivestockBatches } from './useLivestockBatches';
import { useHealthRecords } from './useHealthRecords';

export const useCycleBatchData = (cycleId: string) => {
  const { infrastructures, loading: infraLoading } = useCycleInfrastructures(cycleId);
  const { batches, loading: batchesLoading } = useLivestockBatches();
  const { records: healthRecords } = useHealthRecords(cycleId);
  
  const [cycleBatchData, setCycleBatchData] = useState({
    totalInitialQuantity: 0,
    totalCurrentQuantity: 0,
    totalMortality: 0,
    survivalRate: 100,
    expectedSurvivalRate: 95,
    batchesDetails: [] as Array<{
      batch: any;
      infrastructure: any;
      mortality: number;
      survivalRate: number;
    }>
  });

  useEffect(() => {
    if (!infraLoading && !batchesLoading && infrastructures.length > 0) {
      // Récupérer les lots associés aux infrastructures
      const batchesDetails = infrastructures
        .map(infra => {
          const batch = batches.find(b => b.id === infra.livestock_batch_id);
          if (!batch) return null;
          
          // Calculer les mortalités pour cette infrastructure
          const infraMortality = healthRecords
            .filter(r => r.basin_id === infra.id)
            .reduce((sum, r) => sum + (r.mortality || 0), 0);
          
          const initialQty = batch.quantity;
          const currentQty = initialQty - infraMortality;
          const survivalRate = initialQty > 0 ? (currentQty / initialQty) * 100 : 100;
          
          return {
            batch,
            infrastructure: infra,
            mortality: infraMortality,
            survivalRate
          };
        })
        .filter(Boolean);
      
      // Calculer les totaux
      const totalInitial = batchesDetails.reduce((sum, d) => sum + (d?.batch.quantity || 0), 0);
      const totalMort = batchesDetails.reduce((sum, d) => sum + (d?.mortality || 0), 0);
      const totalCurrent = totalInitial - totalMort;
      const avgSurvival = totalInitial > 0 ? (totalCurrent / totalInitial) * 100 : 100;
      const avgExpected = batchesDetails.length > 0
        ? batchesDetails.reduce((sum, d) => sum + (d?.batch.expected_survival_rate || 95), 0) / batchesDetails.length
        : 95;
      
      setCycleBatchData({
        totalInitialQuantity: totalInitial,
        totalCurrentQuantity: totalCurrent,
        totalMortality: totalMort,
        survivalRate: avgSurvival,
        expectedSurvivalRate: avgExpected,
        batchesDetails: batchesDetails as any
      });
    }
  }, [infrastructures, batches, healthRecords, infraLoading, batchesLoading]);

  return {
    ...cycleBatchData,
    loading: infraLoading || batchesLoading
  };
};
