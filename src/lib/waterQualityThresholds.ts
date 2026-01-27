// Seuils critiques pour les paramètres de qualité de l'eau en aquaculture
export interface ParameterThreshold {
  min_critical: number;
  min_warning: number;
  optimal_min: number;
  optimal_max: number;
  max_warning: number;
  max_critical: number;
  unit: string;
  name: string;
  icon: string;
}

export const WATER_QUALITY_THRESHOLDS: Record<string, ParameterThreshold> = {
  temperature: {
    min_critical: 12,
    min_warning: 18,
    optimal_min: 22,
    optimal_max: 28,
    max_warning: 30,
    max_critical: 32,
    unit: '°C',
    name: 'Température',
    icon: '🌡️'
  },
  ph: {
    min_critical: 5.5,
    min_warning: 6.5,
    optimal_min: 6.8,
    optimal_max: 8.2,
    max_warning: 8.5,
    max_critical: 9.0,
    unit: '',
    name: 'pH',
    icon: '⚗️'
  },
  oxygen: {
    min_critical: 3.0,
    min_warning: 4.0,
    optimal_min: 5.0,
    optimal_max: 8.0,
    max_warning: 12.0,
    max_critical: 15.0,
    unit: 'mg/L',
    name: 'Oxygène dissous',
    icon: '💨'
  },
  ammonia: {
    min_critical: 0,
    min_warning: 0,
    optimal_min: 0,
    optimal_max: 0.02,
    max_warning: 0.5,
    max_critical: 1.0,
    unit: 'mg/L',
    name: 'Ammoniaque',
    icon: '⚠️'
  },
  nitrite: {
    min_critical: 0,
    min_warning: 0,
    optimal_min: 0,
    optimal_max: 0.1,
    max_warning: 0.5,
    max_critical: 1.0,
    unit: 'mg/L',
    name: 'Nitrite',
    icon: '🧪'
  },
  nitrate: {
    min_critical: 0,
    min_warning: 0,
    optimal_min: 0,
    optimal_max: 25,
    max_warning: 50,
    max_critical: 100,
    unit: 'mg/L',
    name: 'Nitrate',
    icon: '📊'
  },
  salinity: {
    min_critical: 0,
    min_warning: 0,
    optimal_min: 0,
    optimal_max: 5,
    max_warning: 10,
    max_critical: 15,
    unit: 'ppt',
    name: 'Salinité',
    icon: '🧂'
  }
};

export type AlertLevel = 'critical' | 'warning' | 'optimal';

export interface ParameterAlert {
  parameter: string;
  value: number;
  unit: string;
  level: AlertLevel;
  icon: string;
  message: string;
  recommendation: string;
  urgency: string;
}

export function analyzeParameter(
  paramKey: string,
  value: number
): ParameterAlert | null {
  const threshold = WATER_QUALITY_THRESHOLDS[paramKey];
  if (!threshold) return null;

  let level: AlertLevel = 'optimal';
  let message = '';
  let recommendation = '';
  let urgency = '';

  // Vérifier les seuils critiques bas
  if (value <= threshold.min_critical) {
    level = 'critical';
    message = `${threshold.name} CRITIQUE: ${value}${threshold.unit} - Niveau dangereusement bas!`;
    recommendation = getRecommendation(paramKey, 'low_critical', value, threshold);
    urgency = 'IMMÉDIAT (0-30 min)';
  }
  // Vérifier les seuils d'alerte bas
  else if (value <= threshold.min_warning) {
    level = 'warning';
    message = `${threshold.name} bas: ${value}${threshold.unit} - Attention requise`;
    recommendation = getRecommendation(paramKey, 'low_warning', value, threshold);
    urgency = 'Urgent (1-4h)';
  }
  // Vérifier les seuils critiques hauts
  else if (value >= threshold.max_critical) {
    level = 'critical';
    message = `${threshold.name} CRITIQUE: ${value}${threshold.unit} - Niveau dangereusement élevé!`;
    recommendation = getRecommendation(paramKey, 'high_critical', value, threshold);
    urgency = 'IMMÉDIAT (0-30 min)';
  }
  // Vérifier les seuils d'alerte hauts
  else if (value >= threshold.max_warning) {
    level = 'warning';
    message = `${threshold.name} élevé: ${value}${threshold.unit} - Surveillance accrue`;
    recommendation = getRecommendation(paramKey, 'high_warning', value, threshold);
    urgency = 'Urgent (1-4h)';
  }
  // Niveau optimal
  else if (value >= threshold.optimal_min && value <= threshold.optimal_max) {
    level = 'optimal';
    message = `${threshold.name} optimal: ${value}${threshold.unit}`;
    recommendation = 'Maintenir les conditions actuelles. Continuer la surveillance régulière.';
    urgency = 'Routine';
  }
  // Entre warning et optimal
  else {
    level = 'optimal';
    message = `${threshold.name}: ${value}${threshold.unit} - Acceptable`;
    recommendation = 'Paramètre dans une plage acceptable. Surveiller l\'évolution.';
    urgency = 'Routine';
  }

  if (level === 'optimal') return null; // Ne pas retourner d'alerte si optimal

  return {
    parameter: threshold.name,
    value,
    unit: threshold.unit,
    level,
    icon: threshold.icon,
    message,
    recommendation,
    urgency
  };
}

function getRecommendation(
  paramKey: string,
  situation: 'low_critical' | 'low_warning' | 'high_critical' | 'high_warning',
  value: number,
  threshold: ParameterThreshold
): string {
  const recommendations: Record<string, Record<string, string>> = {
    temperature: {
      low_critical: `🚨 URGENCE: Température ${value}°C dangereusement basse! 
1) Activer immédiatement le système de chauffage
2) Couvrir les bassins avec des bâches isolantes
3) Arrêter l'alimentation - métabolisme trop lent
4) Augmenter progressivement de 1°C/heure max jusqu'à 22°C
⚠️ Risque: Mortalité massive si non corrigé rapidement`,

      low_warning: `⚠️ ATTENTION: Température ${value}°C trop basse.
1) Vérifier et activer le chauffage
2) Réduire l'alimentation de 50%
3) Surveiller le comportement (léthargie)
4) Objectif: remonter vers 22-25°C`,

      high_critical: `🚨 URGENCE: Température ${value}°C dangereusement élevée!
1) ARRÊTER immédiatement l'alimentation
2) Activer TOUS les aérateurs au maximum
3) Renouveler 30-50% de l'eau avec eau plus fraîche
4) Installer des ombrages d'urgence
5) Pulvériser de l'eau en surface pour évaporation
⚠️ Risque: Choc thermique et asphyxie imminents`,

      high_warning: `⚠️ ATTENTION: Température ${value}°C élevée.
1) Augmenter l'aération
2) Réduire l'alimentation aux heures fraîches
3) Installer des filets d'ombrage
4) Surveiller le comportement (halètement en surface)`
    },

    ph: {
      low_critical: `🚨 URGENCE: pH ${value} critique - Acidose!
1) ARRÊTER l'alimentation immédiatement
2) Ajouter 150-200g de bicarbonate de sodium par m³
3) Augmenter l'aération pour évacuer le CO2
4) Contrôler le pH toutes les heures
⚠️ Risque: Brûlures branchiales, mortalité 20-80% en 12-36h`,

      low_warning: `⚠️ ATTENTION: pH ${value} bas.
1) Ajouter 100g de bicarbonate de sodium par m³
2) Vérifier l'alcalinité (TAC) - doit être >50 mg/L
3) Augmenter légèrement l'aération
4) Contrôler dans 2 heures`,

      high_critical: `🚨 URGENCE: pH ${value} critique - Alcalose!
1) ARRÊTER l'alimentation - NH3 toxique!
2) Augmenter l'aération au maximum
3) Renouveler 30-50% de l'eau
4) Éviter tout apport de chaux
⚠️ Risque: Toxicité ammoniaque maximale, brûlures chimiques`,

      high_warning: `⚠️ ATTENTION: pH ${value} élevé.
1) Augmenter l'aération pour évacuer CO2
2) Éviter d'alimenter aux heures chaudes
3) Contrôler l'ammoniaque (toxicité accrue)
4) Envisager un léger renouvellement d'eau`
    },

    oxygen: {
      low_critical: `🚨🚨 URGENCE ABSOLUE: Oxygène ${value} mg/L - ASPHYXIE!
1) ACTIVER TOUS LES AÉRATEURS IMMÉDIATEMENT
2) ARRÊTER l'alimentation
3) Renouveler 30-50% de l'eau si possible
4) Ajouter des aérateurs d'urgence
5) Réduire la densité si possible
⚠️ DANGER: Mortalité 50-100% dans 2-6 heures!`,

      low_warning: `⚠️ URGENT: Oxygène ${value} mg/L insuffisant.
1) Doubler la capacité d'aération
2) Réduire l'alimentation de 50%
3) Installer des aérateurs supplémentaires
4) Objectif: >5 mg/L dans les 3h`,

      high_critical: `ℹ️ Oxygène ${value} mg/L très élevé (sursaturation).
Généralement non dangereux, mais peut indiquer:
1) Bloom algal intense - surveiller pH
2) Vérifier absence de bulles dans branchies (embolie)`,

      high_warning: `ℹ️ Oxygène ${value} mg/L élevé.
Situation généralement favorable mais:
1) Surveiller le pH (photosynthèse élevée)
2) Vérifier l'absence de sursaturation`
    },

    ammonia: {
      low_critical: '',
      low_warning: '',
      high_critical: `🚨 URGENCE: Ammoniaque ${value} mg/L - TOXIQUE!
1) ARRÊTER l'alimentation pour 48-72h
2) Renouveler 50-70% de l'eau IMMÉDIATEMENT
3) Répéter renouvellement 30% toutes 6-8h
4) Ajouter 100g zeolite par m³ pour absorber
5) Vérifier et nettoyer le biofiltre
⚠️ Risque: Mortalité 30-90% dans 24-96h`,

      high_warning: `⚠️ URGENT: Ammoniaque ${value} mg/L élevé.
1) Arrêter l'alimentation 24h
2) Renouveler 30-40% de l'eau
3) Augmenter débit de filtration de 50%
4) Ensemencer bactéries nitrifiantes
5) Éviter pH élevé (augmente toxicité)`
    },

    nitrite: {
      low_critical: '',
      low_warning: '',
      high_critical: `🚨 URGENCE: Nitrite ${value} mg/L - TOXIQUE!
1) ARRÊTER l'alimentation immédiatement
2) Ajouter 3-5 g/L de sel (NaCl) pour protéger
3) Renouveler 50% de l'eau
4) Augmenter l'aération au maximum
5) Ensemencer bactéries nitrifiantes
⚠️ Risque: Méthémoglobinémie (sang chocolat)`,

      high_warning: `⚠️ ATTENTION: Nitrite ${value} mg/L élevé.
1) Ajouter 1-2 g/L de sel (protection)
2) Réduire l'alimentation de 50%
3) Renouveler 20-30% de l'eau
4) Vérifier le fonctionnement du biofiltre`
    },

    nitrate: {
      low_critical: '',
      low_warning: '',
      high_critical: `⚠️ Nitrate ${value} mg/L très élevé.
1) Renouveler 30-50% de l'eau
2) Ajouter des plantes aquatiques si possible
3) Vérifier la suralimentation
4) Moins urgent que NH3/NO2 mais à corriger`,

      high_warning: `ℹ️ Nitrate ${value} mg/L modérément élevé.
1) Planifier renouvellement d'eau régulier
2) Éviter l'accumulation progressive
3) Surveiller hebdomadairement`
    },

    salinity: {
      low_critical: '',
      low_warning: '',
      high_critical: `⚠️ Salinité ${value} ppt élevée pour eau douce.
1) Vérifier la source d'eau
2) Diluer avec eau douce
3) Surveiller le stress osmotique des poissons`,

      high_warning: `ℹ️ Salinité ${value} ppt légèrement élevée.
1) Surveiller la source d'eau
2) Peut être bénéfique contre parasites
3) Vérifier la tolérance de l'espèce`
    }
  };

  return recommendations[paramKey]?.[situation] || `Paramètre hors normes. Consulter un expert.`;
}

export interface WaterQualityDiagnosis {
  overallStatus: 'critical' | 'warning' | 'good' | 'excellent';
  healthScore: number;
  alerts: ParameterAlert[];
  summary: string;
  recommendations: string[];
}

export function diagnoseWaterQuality(params: {
  temperature?: number;
  ph?: number;
  oxygen?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  salinity?: number;
}): WaterQualityDiagnosis {
  const alerts: ParameterAlert[] = [];
  let healthScore = 100;

  // Analyser chaque paramètre
  const paramMapping: Record<string, number | undefined> = {
    temperature: params.temperature,
    ph: params.ph,
    oxygen: params.oxygen,
    ammonia: params.ammonia,
    nitrite: params.nitrite,
    nitrate: params.nitrate,
    salinity: params.salinity
  };

  for (const [key, value] of Object.entries(paramMapping)) {
    if (value !== undefined && value !== null) {
      const alert = analyzeParameter(key, value);
      if (alert) {
        alerts.push(alert);
        // Réduire le score selon la gravité
        if (alert.level === 'critical') {
          healthScore -= 35;
        } else if (alert.level === 'warning') {
          healthScore -= 15;
        }
      }
    }
  }

  healthScore = Math.max(0, Math.min(100, healthScore));

  // Déterminer le statut global
  let overallStatus: 'critical' | 'warning' | 'good' | 'excellent';
  if (alerts.some(a => a.level === 'critical')) {
    overallStatus = 'critical';
  } else if (alerts.some(a => a.level === 'warning')) {
    overallStatus = 'warning';
  } else if (healthScore >= 90) {
    overallStatus = 'excellent';
  } else {
    overallStatus = 'good';
  }

  // Générer le résumé
  let summary = '';
  if (overallStatus === 'critical') {
    summary = `🚨 SITUATION CRITIQUE - ${alerts.filter(a => a.level === 'critical').length} paramètre(s) en zone dangereuse. Actions immédiates requises!`;
  } else if (overallStatus === 'warning') {
    summary = `⚠️ ATTENTION - ${alerts.filter(a => a.level === 'warning').length} paramètre(s) hors normes. Intervention recommandée.`;
  } else if (overallStatus === 'excellent') {
    summary = `✅ EXCELLENT - Tous les paramètres sont optimaux. Conditions idéales pour vos poissons.`;
  } else {
    summary = `✅ BON - Paramètres dans les normes acceptables. Continuez la surveillance.`;
  }

  // Trier les alertes par priorité
  alerts.sort((a, b) => {
    if (a.level === 'critical' && b.level !== 'critical') return -1;
    if (a.level !== 'critical' && b.level === 'critical') return 1;
    return 0;
  });

  return {
    overallStatus,
    healthScore,
    alerts,
    summary,
    recommendations: alerts.map(a => a.recommendation)
  };
}
