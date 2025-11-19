export interface WaterQualityRecommendation {
  parameter: string;
  currentValue: number;
  optimalRange: string;
  status: 'critical' | 'warning' | 'optimal';
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  healthImpact: string;
  technicalDetails: string;
  timeline: string;
  preventiveMeasures: string[];
  estimatedCost?: string;
}

export interface WaterQualityAnalysis {
  healthScore: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  recommendations: WaterQualityRecommendation[];
  summary: string;
}

const getOptimalDensity = (pondType: string): number => {
  switch (pondType?.toLowerCase()) {
    case 'incubation':
    case 'ecloserie':
      return 200;
    case 'nursery':
    case 'pre-grossissement':
      return 100;
    case 'grossissement':
      return 30;
    case 'finition':
      return 15;
    default:
      return 50;
  }
};

export const analyzeWaterQuality = (
  temperature: number,
  pH: number,
  oxygen: number,
  ammonia: number,
  fishCount: number,
  pondVolume: number,
  averageWeight: number,
  pondType: string = 'grossissement'
): WaterQualityAnalysis => {
  const recommendations: WaterQualityRecommendation[] = [];
  let healthScore = 100;

  if (temperature < 15 || temperature > 30) {
    const isCritical = temperature < 12 || temperature > 32;
    recommendations.push({
      parameter: 'Température',
      currentValue: temperature,
      optimalRange: '18-28°C',
      status: isCritical ? 'critical' : 'warning',
      priority: isCritical ? 'high' : 'medium',
      action: temperature < 15 
        ? '🚨 URGENT: Activer le système de chauffage immédiatement. Augmenter progressivement de 1°C par heure maximum jusqu\'à atteindre 20-22°C.' 
        : '🚨 URGENT: Arrêter l\'alimentation temporairement. Augmenter l\'aération et installer des ombrages ou écrans solaires.',
      reason: temperature < 15
        ? 'Le métabolisme des poissons est fortement ralenti en dessous de 15°C. En dessous de 12°C, les fonctions vitales sont compromises.'
        : 'L\'oxygène dissous chute drastiquement au-dessus de 28°C. Au-delà de 32°C, risque de choc thermique mortel.',
      healthImpact: isCritical
        ? '⚠️ CRITIQUE: Mortalité massive imminente (30-100% dans les 24-48h). Arrêt de la croissance, immunosuppression sévère, vulnérabilité maximale aux pathogènes.'
        : 'Croissance réduite de 40-60%, appétit diminué, stress chronique, sensibilité accrue aux maladies (costiose, columnariose).',
      technicalDetails: temperature < 15
        ? 'Installer un système de chauffage de 1-2 kW par m³. Isoler les bassins avec des bâches thermiques la nuit. Vérifier l\'absence de fuites thermiques.'
        : 'Augmenter le débit d\'aération à 2-3x la normale. Renouveler 20-30% du volume d\'eau avec de l\'eau fraîche. Installer des filets d\'ombrage (70-80% de réduction lumineuse).',
      timeline: isCritical ? 'IMMÉDIAT (0-2h)' : 'Urgent (2-6h)',
      preventiveMeasures: temperature < 15 
        ? ['Installer un thermostat automatique avec alarmes', 'Prévoir un système de chauffage de secours', 'Isoler thermiquement les parois des bassins']
        : ['Installer des systèmes d\'ombrage automatiques', 'Prévoir un système de refroidissement par évaporation', 'Programmer l\'alimentation aux heures fraîches'],
      estimatedCost: temperature < 15 ? '150,000-500,000 XOF (système de chauffage)' : '50,000-200,000 XOF (ombrage et aération)'
    });
    healthScore -= isCritical ? 40 : 20;
  }

  if (pH < 6.5 || pH > 8.5) {
    const isCritical = pH < 6.0 || pH > 9.0;
    recommendations.push({
      parameter: 'pH',
      currentValue: pH,
      optimalRange: '6.8-8.2',
      status: isCritical ? 'critical' : 'warning',
      priority: isCritical ? 'high' : 'medium',
      action: pH < 6.5
        ? '🚨 Corriger immédiatement: Ajouter 100-200g de bicarbonate de sodium par m³ OU 50-100g de chaux agricole par m³.'
        : '🚨 Corriger immédiatement: Augmenter l\'aération à maximum. Ajouter 50ml d\'acide citrique (solution 10%) par m³ OU renouveler 30-50% du volume.',
      reason: pH < 6.5
        ? 'En milieu acide, l\'hémoglobine perd son efficacité de transport d\'oxygène. Le pouvoir tampon de l\'eau est compromis.'
        : 'En milieu alcalin (pH>8.5), l\'ammoniac (NH3) devient majoritairement sous forme toxique libre. Au-delà de pH 9, les branchies sont chimiquement brûlées.',
      healthImpact: isCritical
        ? '⚠️ CRITIQUE: Mortalité 20-80% dans les 12-36h. Nécroses branchiales, lyse des muqueuses, hémorragies internes, asphyxie progressive.'
        : 'Stress osmotique chronique, croissance réduite de 30-50%, sensibilité extrême aux pathogènes (Aeromonas, Flavobacterium).',
      technicalDetails: pH < 6.5
        ? 'Dose de bicarbonate: 100g/m³ augmente le pH de ~0.3 unités. Surveiller toutes les 2h. Analyser l\'alcalinité totale (TAC) - doit être >50 mg/L CaCO3.'
        : 'Dose d\'acide citrique: 50ml (10%) par m³ réduit le pH de ~0.2 unités. Éviter les chutes brutales >0.5 pH/jour.',
      timeline: isCritical ? 'IMMÉDIAT (0-1h)' : 'Urgent (1-4h)',
      preventiveMeasures: ['Installer une sonde pH avec alarmes', 'Maintenir l\'alcalinité (TAC) entre 80-120 mg/L CaCO3', 'Tester le pH 2x/jour'],
      estimatedCost: '20,000-80,000 XOF (correcteurs pH + sonde)'
    });
    healthScore -= isCritical ? 35 : 18;
  }

  if (oxygen < 4) {
    const isCritical = oxygen < 3;
    recommendations.push({
      parameter: 'Oxygène dissous',
      currentValue: oxygen,
      optimalRange: '5-8 mg/L',
      status: isCritical ? 'critical' : 'warning',
      priority: isCritical ? 'high' : 'medium',
      action: isCritical
        ? '🚨🚨 ACTION IMMÉDIATE: 1) ARRÊTER L\'ALIMENTATION. 2) Activer TOUS les aérateurs au maximum. 3) Renouveler 30-50% eau IMMÉDIATEMENT.'
        : '🚨 URGENT: Doubler la capacité d\'aération immédiatement. Installer des aérateurs/oxygénateurs supplémentaires.',
      reason: 'Les poissons consomment O2 pour la respiration cellulaire. En dessous de 4 mg/L, le métabolisme anaérobie produit de l\'acide lactique. En dessous de 3 mg/L, l\'asphyxie commence.',
      healthImpact: isCritical
        ? '⚠️⚠️ CRITIQUE EXTRÊME: MORTALITÉ 50-100% dans les 2-6h. Asphyxie aiguë, poissons en surface bouche ouverte, convulsions, coma hypoxique.'
        : '⚠️ GRAVE: Stress hypoxique sévère, croissance stoppée, perte de poids, immunodépression majeure, risque mortalité 10-30%.',
      technicalDetails: isCritical
        ? 'Saturation en O2 <40% = urgence absolue. Installer: 1) Aérateurs de surface (1 par 20m³), 2) Diffuseurs à bulles fines (débit 5-10 L/min par m³).'
        : 'Saturation 40-60% = insuffisant. Ajouter aération: Paddlewheels ou aérateurs (puissance 0.5-1 kW par 100m³). Objectif: >5 mg/L en 3-6h.',
      timeline: isCritical ? '⏰ IMMÉDIAT (0-30min) - VIE EN DANGER' : '⏰ URGENT (0-2h)',
      preventiveMeasures: ['Installer des sondes O2 avec alarmes (seuil: 4 mg/L)', 'Aération continue 24h/24h', 'Capacité d\'aération: minimum 1 kW par 50m³', 'Prévoir des aérateurs de secours'],
      estimatedCost: isCritical ? '200,000-800,000 XOF (aérateurs urgence)' : '100,000-400,000 XOF (aérateurs supplémentaires)'
    });
    healthScore -= isCritical ? 50 : 25;
  }

  if (ammonia > 0.5) {
    const isCritical = ammonia > 1.0;
    recommendations.push({
      parameter: 'Ammoniac',
      currentValue: ammonia,
      optimalRange: '< 0.02 mg/L',
      status: isCritical ? 'critical' : 'warning',
      priority: isCritical ? 'high' : 'medium',
      action: isCritical
        ? '🚨🚨 PROTOCOLE D\'URGENCE: 1) ARRÊTER ALIMENTATION 48-72h. 2) Renouveler 50-70% eau IMMÉDIATEMENT. 3) Répéter renouvellement 30% toutes les 6-8h.'
        : '🚨 URGENT: 1) Renouveler 30-40% eau immédiatement. 2) Arrêter alimentation 24h. 3) Nettoyer biofiltre + augmenter débit filtration de 50%.',
      reason: 'L\'ammoniac (NH3) provient de l\'excrétion azotée des poissons. NH3 traverse librement les membranes cellulaires → toxicité immédiate. À pH >8, forme toxique augmente exponentiellement.',
      healthImpact: isCritical
        ? '⚠️⚠️ CRITIQUE SÉVÈRE: MORTALITÉ 30-90% dans les 24-96h. Nécroses branchiales massives, œdème cérébral, convulsions, hémorragies.'
        : '⚠️ GRAVE: Empoisonnement chronique, nécrose branchiale (efficacité respiratoire réduite 40-70%), croissance stoppée, immunosuppression sévère.',
      technicalDetails: isCritical
        ? 'NH3-N >1 mg/L = toxicité aiguë. Renouvellements répétés (objectif <0.5 mg/L en 24h). Zeolite (100g/m³) pour adsorber NH4+.'
        : 'NH3-N 0.5-1.0 mg/L = toxique subcritique. Ensemencement bactérien (dose: 5-10mL/m³ concentré). Vérifier surface filtrante.',
      timeline: isCritical ? '⏰ IMMÉDIAT (0-2h) puis suivi toutes les 6h pendant 72h' : '⏰ URGENT (0-4h) puis suivi quotidien',
      preventiveMeasures: ['Test NH3/NH4+ 2x/jour en phase critique', 'Dimensionner biofiltre: 1-2 m² surface/kg aliment/jour', 'Ensemencement bactérien mensuel', 'Éviter suralimentation'],
      estimatedCost: isCritical ? '150,000-600,000 XOF (bactéries + zeolite)' : '50,000-200,000 XOF (bactéries + entretien)'
    });
    healthScore -= isCritical ? 45 : 22;
  }

  const density = fishCount / pondVolume;
  const optimalDensity = getOptimalDensity(pondType);
  
  if (density > optimalDensity * 1.2) {
    const isCritical = density > optimalDensity * 1.5;
    const excessPercentage = ((density / optimalDensity - 1) * 100).toFixed(0);
    const fishToRemove = Math.round((density - optimalDensity) * pondVolume);
    
    recommendations.push({
      parameter: 'Densité de poissons',
      currentValue: density,
      optimalRange: `${optimalDensity} poissons/m³`,
      status: isCritical ? 'critical' : 'warning',
      priority: isCritical ? 'high' : 'medium',
      action: isCritical
        ? `🚨 SURPOPULATION CRITIQUE (+${excessPercentage}%): Transférer immédiatement ${fishToRemove} poissons. Doubler l\'aération ET la filtration.`
        : `🚨 SURPOPULATION (+${excessPercentage}%): Planifier transfert de ${fishToRemove} poissons dans les 7-14 jours. Augmenter aération de 50%.`,
      reason: `Surpopulation génère: 1) COMPÉTITION pour O2. 2) ACCUMULATION de toxiques (NH3). 3) STRESS social: combats. 4) ESPACE vital insuffisant.`,
      healthImpact: isCritical
        ? `⚠️⚠️ CRITIQUE: MORTALITÉ chronique 5-30% par mois. Nanisme généralisé, déformations squelettiques, cannibalisme, immunosuppression totale.`
        : `⚠️ GRAVE: Croissance hétérogène, stress chronique, agressivité accrue, vulnérabilité parasitaire, mortalité larvée 2-10% par mois.`,
      technicalDetails: `Densité: ${density.toFixed(1)} vs ${optimalDensity}/m³. Biomasse: ${((density * pondVolume * averageWeight) / 1000).toFixed(1)} kg. Transférer ${fishToRemove} poissons.`,
      timeline: isCritical ? '⏰ IMMÉDIAT (0-48h)' : '⏰ URGENT (7-14 jours)',
      preventiveMeasures: [`Respecter densité max: ${optimalDensity} poissons/m³`, 'Compter régulièrement le stock', 'Prévoir bassins de délestage', 'Calibrer dès 20% variation taille'],
      estimatedCost: isCritical ? '100,000-500,000 XOF (transfert urgence)' : '50,000-200,000 XOF (transfert planifié)'
    });
    healthScore -= isCritical ? 30 : 15;
  }

  healthScore = Math.max(0, Math.min(100, healthScore));
  
  let status: 'critical' | 'warning' | 'good' | 'excellent';
  if (healthScore < 40) status = 'critical';
  else if (healthScore < 70) status = 'warning';
  else if (healthScore < 90) status = 'good';
  else status = 'excellent';

  let summary = '';
  if (status === 'critical') {
    summary = `⚠️⚠️ SITUATION CRITIQUE - Score: ${healthScore}/100. Actions d'urgence IMMÉDIATES requises pour éviter mortalité massive. ${recommendations.length} problèmes critiques.`;
  } else if (status === 'warning') {
    summary = `⚠️ ATTENTION - Score: ${healthScore}/100. Plusieurs paramètres hors normes. ${recommendations.length} problèmes nécessitent corrections rapides.`;
  } else if (status === 'good') {
    summary = `✅ BON - Score: ${healthScore}/100. Conditions acceptables mais améliorables. ${recommendations.length > 0 ? `${recommendations.length} ajustement(s) recommandé(s)` : 'Surveillance continue'}.`;
  } else {
    summary = `✅✅ EXCELLENT - Score: ${healthScore}/100. Paramètres optimaux. Environnement idéal pour croissance maximale.`;
  }

  return { healthScore, status, recommendations, summary };
};
