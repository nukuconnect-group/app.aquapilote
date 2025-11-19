export interface WaterParameters {
  temperature: number;
  pH: number;
  oxygen: number;
  ammonia?: number;
  turbidity?: number;
}

export interface DensityParameters {
  fishCount: number;
  basinVolume: number; // en m³
  averageWeight: number; // en grammes
}

export interface WaterQualityRecommendation {
  type: 'water_renewal' | 'oxygenation' | 'temperature' | 'ph_adjustment' | 'treatment' | 'feeding' | 'density';
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  action: string;
  healthImpact: string;
  parameter: string;
  currentValue: number;
  optimalRange: string;
}

const OPTIMAL_RANGES = {
  temperature: { min: 24, max: 28, critical_low: 20, critical_high: 32 },
  pH: { min: 7.0, max: 8.0, critical_low: 6.0, critical_high: 9.0 },
  oxygen: { min: 5.0, optimal: 7.0, critical: 3.0 },
  ammonia: { safe: 0.05, warning: 0.1, critical: 0.2 },
  density: { 
    fingerlings: { min: 100, max: 300 }, // poissons/m³
    juveniles: { min: 50, max: 150 },
    adults: { min: 20, max: 80 }
  }
};

export function analyzeWaterQuality(params: WaterParameters): WaterQualityRecommendation[] {
  const recommendations: WaterQualityRecommendation[] = [];

  // Analyse de la température
  if (params.temperature < OPTIMAL_RANGES.temperature.critical_low || 
      params.temperature > OPTIMAL_RANGES.temperature.critical_high) {
    recommendations.push({
      type: 'temperature',
      priority: 'critical',
      message: `Température critique à ${params.temperature}°C`,
      action: params.temperature < OPTIMAL_RANGES.temperature.critical_low
        ? 'Activer le système de chauffage immédiatement'
        : 'Activer le refroidissement ou l\'ombrage, réduire l\'alimentation',
      healthImpact: 'Risque élevé de mortalité massive, stress thermique sévère, arrêt de l\'alimentation',
      parameter: 'temperature',
      currentValue: params.temperature,
      optimalRange: `${OPTIMAL_RANGES.temperature.min}-${OPTIMAL_RANGES.temperature.max}°C`
    });
  } else if (params.temperature < OPTIMAL_RANGES.temperature.min || 
             params.temperature > OPTIMAL_RANGES.temperature.max) {
    recommendations.push({
      type: 'temperature',
      priority: 'high',
      message: `Température sous-optimale à ${params.temperature}°C`,
      action: params.temperature < OPTIMAL_RANGES.temperature.min
        ? 'Augmenter progressivement la température (0.5°C/heure maximum)'
        : 'Augmenter l\'aération, créer de l\'ombre, renouveler 20% de l\'eau',
      healthImpact: 'Ralentissement de la croissance, baisse de l\'immunité, risque de maladies opportunistes',
      parameter: 'temperature',
      currentValue: params.temperature,
      optimalRange: `${OPTIMAL_RANGES.temperature.min}-${OPTIMAL_RANGES.temperature.max}°C`
    });
  }

  // Analyse du pH
  if (params.pH < OPTIMAL_RANGES.pH.critical_low || params.pH > OPTIMAL_RANGES.pH.critical_high) {
    recommendations.push({
      type: 'ph_adjustment',
      priority: 'critical',
      message: `pH critique à ${params.pH}`,
      action: params.pH < OPTIMAL_RANGES.pH.critical_low
        ? 'Ajouter du bicarbonate de sodium (100g/1000L), renouveler 30% de l\'eau'
        : 'Renouveler 40% de l\'eau immédiatement, vérifier la source d\'eau',
      healthImpact: 'Détresse respiratoire sévère, brûlures des branchies, mortalité imminente',
      parameter: 'pH',
      currentValue: params.pH,
      optimalRange: `${OPTIMAL_RANGES.pH.min}-${OPTIMAL_RANGES.pH.max}`
    });
  } else if (params.pH < OPTIMAL_RANGES.pH.min || params.pH > OPTIMAL_RANGES.pH.max) {
    recommendations.push({
      type: 'ph_adjustment',
      priority: 'high',
      message: `pH hors de la plage optimale à ${params.pH}`,
      action: params.pH < OPTIMAL_RANGES.pH.min
        ? 'Ajouter progressivement du bicarbonate (50g/1000L), surveiller toutes les 2h'
        : 'Renouveler 15% de l\'eau, réduire l\'alimentation de 30%',
      healthImpact: 'Stress physiologique, sensibilité aux infections bactériennes et fongiques',
      parameter: 'pH',
      currentValue: params.pH,
      optimalRange: `${OPTIMAL_RANGES.pH.min}-${OPTIMAL_RANGES.pH.max}`
    });
  }

  // Analyse de l'oxygène
  if (params.oxygen < OPTIMAL_RANGES.oxygen.critical) {
    recommendations.push({
      type: 'oxygenation',
      priority: 'critical',
      message: `Oxygène critique à ${params.oxygen} mg/L`,
      action: 'Activer TOUS les aérateurs, arrêter l\'alimentation, renouveler 20% de l\'eau en urgence',
      healthImpact: 'Asphyxie imminente, mortalité massive dans les 1-2 heures, panique des poissons',
      parameter: 'oxygen',
      currentValue: params.oxygen,
      optimalRange: `>${OPTIMAL_RANGES.oxygen.min} mg/L (optimal: >${OPTIMAL_RANGES.oxygen.optimal} mg/L)`
    });
  } else if (params.oxygen < OPTIMAL_RANGES.oxygen.min) {
    recommendations.push({
      type: 'oxygenation',
      priority: 'high',
      message: `Oxygène insuffisant à ${params.oxygen} mg/L`,
      action: 'Augmenter l\'aération de 50%, réduire la ration alimentaire de 40%, surveiller en continu',
      healthImpact: 'Stress respiratoire, ralentissement de la croissance, sensibilité aux maladies',
      parameter: 'oxygen',
      currentValue: params.oxygen,
      optimalRange: `>${OPTIMAL_RANGES.oxygen.min} mg/L (optimal: >${OPTIMAL_RANGES.oxygen.optimal} mg/L)`
    });
  } else if (params.oxygen < OPTIMAL_RANGES.oxygen.optimal) {
    recommendations.push({
      type: 'oxygenation',
      priority: 'medium',
      message: `Oxygène acceptable mais sous-optimal à ${params.oxygen} mg/L`,
      action: 'Augmenter l\'aération de 20%, surtout durant les heures chaudes (14h-18h)',
      healthImpact: 'Performance de croissance réduite, efficacité alimentaire diminuée',
      parameter: 'oxygen',
      currentValue: params.oxygen,
      optimalRange: `>${OPTIMAL_RANGES.oxygen.min} mg/L (optimal: >${OPTIMAL_RANGES.oxygen.optimal} mg/L)`
    });
  }

  // Analyse de l'ammoniac
  if (params.ammonia !== undefined) {
    if (params.ammonia > OPTIMAL_RANGES.ammonia.critical) {
      recommendations.push({
        type: 'water_renewal',
        priority: 'critical',
        message: `Ammoniac toxique à ${params.ammonia} mg/L`,
        action: 'Renouveler 50% de l\'eau immédiatement, arrêter l\'alimentation pour 48h, ajouter du sel (3g/L)',
        healthImpact: 'Toxicité aiguë, lésions branchiales irréversibles, hémorragies, mortalité élevée',
        parameter: 'ammonia',
        currentValue: params.ammonia,
        optimalRange: `<${OPTIMAL_RANGES.ammonia.safe} mg/L`
      });
    } else if (params.ammonia > OPTIMAL_RANGES.ammonia.warning) {
      recommendations.push({
        type: 'water_renewal',
        priority: 'high',
        message: `Ammoniac élevé à ${params.ammonia} mg/L`,
        action: 'Renouveler 30% de l\'eau, réduire l\'alimentation de 50%, vérifier le système de filtration',
        healthImpact: 'Irritation des branchies, immunodépression, risque accru d\'infections bactériennes',
        parameter: 'ammonia',
        currentValue: params.ammonia,
        optimalRange: `<${OPTIMAL_RANGES.ammonia.safe} mg/L`
      });
    } else if (params.ammonia > OPTIMAL_RANGES.ammonia.safe) {
      recommendations.push({
        type: 'water_renewal',
        priority: 'medium',
        message: `Ammoniac légèrement élevé à ${params.ammonia} mg/L`,
        action: 'Renouveler 15% de l\'eau, surveiller quotidiennement, nettoyer le bassin',
        healthImpact: 'Stress chronique, croissance ralentie, sensibilité aux pathogènes',
        parameter: 'ammonia',
        currentValue: params.ammonia,
        optimalRange: `<${OPTIMAL_RANGES.ammonia.safe} mg/L`
      });
    }
  }

  return recommendations;
}

export function analyzeDensity(params: DensityParameters): WaterQualityRecommendation | null {
  // Calcul de la densité actuelle (poissons/m³)
  const currentDensity = params.fishCount / params.basinVolume;
  
  // Calcul de la biomasse (kg/m³)
  const currentBiomass = (params.fishCount * params.averageWeight) / 1000 / params.basinVolume;

  // Déterminer la catégorie en fonction du poids moyen
  let category: 'fingerlings' | 'juveniles' | 'adults';
  let optimalRange: { min: number; max: number };
  
  if (params.averageWeight < 50) {
    category = 'fingerlings';
    optimalRange = OPTIMAL_RANGES.density.fingerlings;
  } else if (params.averageWeight < 200) {
    category = 'juveniles';
    optimalRange = OPTIMAL_RANGES.density.juveniles;
  } else {
    category = 'adults';
    optimalRange = OPTIMAL_RANGES.density.adults;
  }

  if (currentDensity > optimalRange.max) {
    return {
      type: 'density',
      priority: currentDensity > optimalRange.max * 1.5 ? 'critical' : 'high',
      message: `Surpopulation détectée: ${currentDensity.toFixed(1)} poissons/m³ (biomasse: ${currentBiomass.toFixed(1)} kg/m³)`,
      action: currentDensity > optimalRange.max * 1.5
        ? 'Transférer immédiatement 30-40% des poissons, augmenter l\'aération de 100%'
        : 'Planifier un transfert de 20% des poissons, renforcer l\'oxygénation',
      healthImpact: 'Stress élevé, compétition alimentaire, risque de maladies contagieuses, croissance ralentie, qualité d\'eau dégradée',
      parameter: 'density',
      currentValue: currentDensity,
      optimalRange: `${optimalRange.min}-${optimalRange.max} poissons/m³ pour des poissons de ${params.averageWeight}g`
    };
  } else if (currentDensity < optimalRange.min) {
    return {
      type: 'density',
      priority: 'low',
      message: `Sous-population: ${currentDensity.toFixed(1)} poissons/m³`,
      action: 'Considérer l\'ajout de poissons pour optimiser l\'espace et la rentabilité',
      healthImpact: 'Utilisation sous-optimale de l\'espace, perte de rentabilité potentielle',
      parameter: 'density',
      currentValue: currentDensity,
      optimalRange: `${optimalRange.min}-${optimalRange.max} poissons/m³ pour des poissons de ${params.averageWeight}g`
    };
  }

  return null;
}

export function generateComprehensiveAnalysis(
  waterParams: WaterParameters,
  densityParams: DensityParameters
): WaterQualityRecommendation[] {
  const waterRecommendations = analyzeWaterQuality(waterParams);
  const densityRecommendation = analyzeDensity(densityParams);

  const allRecommendations = [...waterRecommendations];
  if (densityRecommendation) {
    allRecommendations.push(densityRecommendation);
  }

  // Trier par priorité
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return allRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
