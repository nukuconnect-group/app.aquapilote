import { supabase } from '@/integrations/supabase/client';

export interface FeedingRule {
  id: string;
  species_id: string;
  stage: 'alevin' | 'juvenile' | 'grossissement' | 'geniteur';
  weight_min_g: number;
  weight_max_g: number;
  feed_rate_pct: number;
  meals_per_day: number;
  optimal_temp_min: number | null;
  optimal_temp_max: number | null;
}

export interface FishSpecies {
  id: string;
  name: string;
  scientific_name: string | null;
  default_cycle_days: number | null;
  default_growth_rate: number | null;
}

export interface FeedingResult {
  biomass_kg: number;
  stage: string;
  feed_rate_pct: number;
  daily_ration_kg: number;
  meals_per_day: number;
  ration_per_meal_kg: number;
  projected_final_weight_g: number;
  projected_total_feed_kg: number;
  growth_curve: Array<{ day: number; weight_g: number; biomass_kg: number; cumulative_feed_kg: number }>;
  rule_used: FeedingRule | null;
}

const DEFAULT_FALLBACK = (avg: number) => {
  if (avg < 5) return { rate: 10, meals: 6, stage: 'alevin' };
  if (avg < 30) return { rate: 7, meals: 5, stage: 'alevin' };
  if (avg < 150) return { rate: 4, meals: 4, stage: 'juvenile' };
  if (avg < 500) return { rate: 3, meals: 3, stage: 'grossissement' };
  if (avg < 1200) return { rate: 2, meals: 3, stage: 'grossissement' };
  return { rate: 1.5, meals: 2, stage: 'geniteur' };
};

export async function loadSpecies(): Promise<FishSpecies[]> {
  const { data } = await supabase
    .from('fish_species')
    .select('id,name,scientific_name,default_cycle_days,default_growth_rate')
    .eq('is_active', true)
    .order('name');
  return (data ?? []) as FishSpecies[];
}

export async function loadRulesForSpecies(speciesId: string): Promise<FeedingRule[]> {
  const { data } = await supabase
    .from('feeding_rules')
    .select('*')
    .eq('species_id', speciesId)
    .order('weight_min_g');
  return (data ?? []) as FeedingRule[];
}

export function computeFeeding(params: {
  fishCount: number;
  avgWeightG: number;
  rules: FeedingRule[];
  species?: FishSpecies | null;
  cycleDays?: number;
}): FeedingResult {
  const { fishCount, avgWeightG, rules, species, cycleDays } = params;
  const biomass_kg = (fishCount * avgWeightG) / 1000;
  const matching = rules.find(r => avgWeightG >= r.weight_min_g && avgWeightG <= r.weight_max_g);
  const fb = DEFAULT_FALLBACK(avgWeightG);
  const feed_rate_pct = matching?.feed_rate_pct ?? fb.rate;
  const meals_per_day = matching?.meals_per_day ?? fb.meals;
  const stage = matching?.stage ?? fb.stage;
  const daily_ration_kg = biomass_kg * (feed_rate_pct / 100);
  const ration_per_meal_kg = daily_ration_kg / Math.max(1, meals_per_day);

  const days = cycleDays ?? species?.default_cycle_days ?? 180;
  const dailyGrowthRate = species?.default_growth_rate ?? 0.015;
  const curve: FeedingResult['growth_curve'] = [];
  let weight = avgWeightG;
  let cumFeed = 0;
  const step = Math.max(1, Math.round(days / 30));
  for (let d = 0; d <= days; d += step) {
    const bm = (fishCount * weight) / 1000;
    const rule = rules.find(r => weight >= r.weight_min_g && weight <= r.weight_max_g);
    const rate = rule?.feed_rate_pct ?? DEFAULT_FALLBACK(weight).rate;
    cumFeed += bm * (rate / 100) * step;
    curve.push({ day: d, weight_g: Math.round(weight), biomass_kg: Math.round(bm * 100) / 100, cumulative_feed_kg: Math.round(cumFeed * 100) / 100 });
    weight = weight * Math.pow(1 + dailyGrowthRate, step);
  }

  return {
    biomass_kg: Math.round(biomass_kg * 1000) / 1000,
    stage,
    feed_rate_pct,
    daily_ration_kg: Math.round(daily_ration_kg * 1000) / 1000,
    meals_per_day,
    ration_per_meal_kg: Math.round(ration_per_meal_kg * 1000) / 1000,
    projected_final_weight_g: Math.round(weight),
    projected_total_feed_kg: Math.round(cumFeed * 100) / 100,
    growth_curve: curve,
    rule_used: matching ?? null,
  };
}
