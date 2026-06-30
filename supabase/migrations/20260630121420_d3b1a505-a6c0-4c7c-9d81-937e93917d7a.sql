
-- Phase 1: Référentiels AquaPilote

CREATE TABLE public.fish_species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  scientific_name text,
  description text,
  image_url text,
  default_cycle_days integer DEFAULT 180,
  default_growth_rate numeric DEFAULT 0.015,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fish_species TO authenticated;
GRANT ALL ON public.fish_species TO service_role;
ALTER TABLE public.fish_species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fish_species_read" ON public.fish_species FOR SELECT TO authenticated USING (true);
CREATE POLICY "fish_species_admin" ON public.fish_species FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fish_species_upd BEFORE UPDATE ON public.fish_species
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.feeding_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id uuid NOT NULL REFERENCES public.fish_species(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('alevin','juvenile','grossissement','geniteur')),
  weight_min_g numeric NOT NULL,
  weight_max_g numeric NOT NULL,
  feed_rate_pct numeric NOT NULL,
  meals_per_day integer NOT NULL DEFAULT 3,
  optimal_temp_min numeric,
  optimal_temp_max numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feeding_rules TO authenticated;
GRANT ALL ON public.feeding_rules TO service_role;
ALTER TABLE public.feeding_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feeding_rules_read" ON public.feeding_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "feeding_rules_admin" ON public.feeding_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_feeding_rules_upd BEFORE UPDATE ON public.feeding_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX idx_feeding_rules_species ON public.feeding_rules(species_id);

CREATE TABLE public.disease_symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disease_symptoms TO authenticated;
GRANT ALL ON public.disease_symptoms TO service_role;
ALTER TABLE public.disease_symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "symptoms_read" ON public.disease_symptoms FOR SELECT TO authenticated USING (true);
CREATE POLICY "symptoms_admin" ON public.disease_symptoms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_symptoms_upd BEFORE UPDATE ON public.disease_symptoms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.aqua_diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('bacterial','parasitic','fungal','viral','other')),
  description text,
  causes text,
  favoring_factors text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  mortality_rate_pct numeric,
  prevention text,
  images text[] DEFAULT ARRAY[]::text[],
  documents text[] DEFAULT ARRAY[]::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.aqua_diseases TO authenticated;
GRANT ALL ON public.aqua_diseases TO service_role;
ALTER TABLE public.aqua_diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diseases_read" ON public.aqua_diseases FOR SELECT TO authenticated USING (true);
CREATE POLICY "diseases_admin" ON public.aqua_diseases FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_diseases_upd BEFORE UPDATE ON public.aqua_diseases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.disease_symptom_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES public.aqua_diseases(id) ON DELETE CASCADE,
  symptom_id uuid NOT NULL REFERENCES public.disease_symptoms(id) ON DELETE CASCADE,
  weight numeric NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  UNIQUE(disease_id, symptom_id)
);
GRANT SELECT ON public.disease_symptom_map TO authenticated;
GRANT ALL ON public.disease_symptom_map TO service_role;
ALTER TABLE public.disease_symptom_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsm_read" ON public.disease_symptom_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "dsm_admin" ON public.disease_symptom_map FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.disease_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES public.aqua_diseases(id) ON DELETE CASCADE,
  name text NOT NULL,
  active_ingredient text,
  dosage text,
  duration text,
  administration text,
  water_actions text,
  isolation_required boolean DEFAULT false,
  follow_up text,
  order_index integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disease_treatments TO authenticated;
GRANT ALL ON public.disease_treatments TO service_role;
ALTER TABLE public.disease_treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treat_read" ON public.disease_treatments FOR SELECT TO authenticated USING (true);
CREATE POLICY "treat_admin" ON public.disease_treatments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_treat_upd BEFORE UPDATE ON public.disease_treatments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX idx_treat_disease ON public.disease_treatments(disease_id);

CREATE TABLE public.aqua_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  unit_id text,
  batch_id uuid,
  selected_symptoms text[] NOT NULL DEFAULT ARRAY[]::text[],
  other_symptoms text,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_disease_id uuid REFERENCES public.aqua_diseases(id) ON DELETE SET NULL,
  risk_level text CHECK (risk_level IN ('low','medium','high','critical')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aqua_diagnoses TO authenticated;
GRANT ALL ON public.aqua_diagnoses TO service_role;
ALTER TABLE public.aqua_diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_own" ON public.aqua_diagnoses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_diag_user ON public.aqua_diagnoses(user_id, created_at DESC);

CREATE TABLE public.feed_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  unit_id text,
  batch_id uuid,
  species_id uuid REFERENCES public.fish_species(id) ON DELETE SET NULL,
  species_name text,
  fish_count integer NOT NULL,
  avg_weight_g numeric NOT NULL,
  biomass_kg numeric NOT NULL,
  stage text,
  feed_rate_pct numeric NOT NULL,
  daily_ration_kg numeric NOT NULL,
  meals_per_day integer NOT NULL,
  ration_per_meal_kg numeric NOT NULL,
  water_temp numeric,
  cycle_days integer,
  projected_final_weight_g numeric,
  projected_total_feed_kg numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_calculations TO authenticated;
GRANT ALL ON public.feed_calculations TO service_role;
ALTER TABLE public.feed_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedcalc_own" ON public.feed_calculations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_feedcalc_user ON public.feed_calculations(user_id, created_at DESC);

CREATE TABLE public.premium_library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('pdf','video','sop','guide','fiche','webinar','other')),
  file_path text,
  external_url text,
  thumbnail_url text,
  plan_min text NOT NULL DEFAULT 'premium' CHECK (plan_min IN ('free','standard','premium','enterprise')),
  tags text[] DEFAULT ARRAY[]::text[],
  duration_minutes integer,
  size_bytes bigint,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_library_items TO authenticated;
GRANT ALL ON public.premium_library_items TO service_role;
ALTER TABLE public.premium_library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lib_read" ON public.premium_library_items FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "lib_admin" ON public.premium_library_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_lib_upd BEFORE UPDATE ON public.premium_library_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.premium_library_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.premium_library_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.premium_library_views TO authenticated;
GRANT ALL ON public.premium_library_views TO service_role;
ALTER TABLE public.premium_library_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "libv_ins" ON public.premium_library_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "libv_read" ON public.premium_library_views FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_libv_item ON public.premium_library_views(item_id);

-- ============== SEED ==============

INSERT INTO public.fish_species (name, scientific_name, description, default_cycle_days, default_growth_rate) VALUES
('Tilapia du Nil','Oreochromis niloticus','Espèce la plus élevée en Afrique',180,0.018),
('Clarias','Clarias gariepinus','Poisson-chat africain à croissance rapide',150,0.022),
('Carpe commune','Cyprinus carpio','Cyprinidé robuste',240,0.012),
('Hétérotis','Heterotis niloticus','Omnivore d''Afrique de l''Ouest',210,0.014),
('Capitaine','Lates niloticus','Perche du Nil',270,0.013),
('Silure','Heterobranchus longifilis','Silure africain',180,0.019),
('Black bass','Micropterus salmoides','Carnassier',240,0.011),
('Mâchoiron','Chrysichthys nigrodigitatus','Bagride africain',240,0.012);

INSERT INTO public.disease_symptoms (key, label, description) VALUES
('appetite_loss','Perte d''appétit','Refus de la nourriture'),
('abnormal_swimming','Nage anormale','Nage en spirale ou sur le côté'),
('surface_gasping','Poissons en surface','Cherche l''air en surface'),
('red_spots','Taches rouges','Hémorragies cutanées'),
('pale_gills','Branchies pâles','Branchies décolorées'),
('swollen_abdomen','Abdomen gonflé','Ascite ou ballonnement'),
('skin_lesions','Lésions cutanées','Plaies, ulcères'),
('unusual_mortality','Mortalités inhabituelles','Pic de mortalité soudain'),
('wall_rubbing','Frottements contre les parois','Gratte les parasites'),
('exophthalmia','Exophtalmie','Yeux exorbités'),
('white_spots','Points blancs','Granulations blanches'),
('cotton_growth','Filaments cotonneux','Aspect coton (mycose)'),
('fin_rot','Pourriture des nageoires','Nageoires effilochées'),
('color_loss','Décoloration','Perte de pigmentation'),
('lethargy','Léthargie','Mouvements ralentis');

-- Règles de nourrissage
DO $$
DECLARE t uuid; c uuid; ca uuid;
BEGIN
  SELECT id INTO t FROM public.fish_species WHERE name='Tilapia du Nil';
  SELECT id INTO c FROM public.fish_species WHERE name='Clarias';
  SELECT id INTO ca FROM public.fish_species WHERE name='Carpe commune';

  INSERT INTO public.feeding_rules (species_id, stage, weight_min_g, weight_max_g, feed_rate_pct, meals_per_day, optimal_temp_min, optimal_temp_max) VALUES
  (t,'alevin',0,5,10,6,26,30),
  (t,'alevin',5,20,7,5,26,30),
  (t,'juvenile',20,100,4.5,4,26,30),
  (t,'grossissement',100,300,3,3,26,30),
  (t,'grossissement',300,600,2,3,26,30),
  (t,'geniteur',600,5000,1.5,2,26,30),
  (c,'alevin',0,5,12,6,25,30),
  (c,'alevin',5,30,8,5,25,30),
  (c,'juvenile',30,150,5,4,25,30),
  (c,'grossissement',150,500,3,3,25,30),
  (c,'grossissement',500,1200,2,3,25,30),
  (c,'geniteur',1200,8000,1.5,2,25,30),
  (ca,'alevin',0,20,6,4,22,28),
  (ca,'juvenile',20,200,3.5,3,22,28),
  (ca,'grossissement',200,1000,2,2,22,28),
  (ca,'geniteur',1000,6000,1,2,22,28);
END $$;

-- Maladies + liaisons + traitements
DO $$
DECLARE
  d uuid;
  s_app uuid; s_swim uuid; s_surf uuid; s_red uuid; s_pale uuid;
  s_swl uuid; s_les uuid; s_mor uuid; s_rub uuid; s_exo uuid;
  s_whi uuid; s_cot uuid; s_fin uuid; s_col uuid; s_let uuid;
BEGIN
  SELECT id INTO s_app FROM public.disease_symptoms WHERE key='appetite_loss';
  SELECT id INTO s_swim FROM public.disease_symptoms WHERE key='abnormal_swimming';
  SELECT id INTO s_surf FROM public.disease_symptoms WHERE key='surface_gasping';
  SELECT id INTO s_red FROM public.disease_symptoms WHERE key='red_spots';
  SELECT id INTO s_pale FROM public.disease_symptoms WHERE key='pale_gills';
  SELECT id INTO s_swl FROM public.disease_symptoms WHERE key='swollen_abdomen';
  SELECT id INTO s_les FROM public.disease_symptoms WHERE key='skin_lesions';
  SELECT id INTO s_mor FROM public.disease_symptoms WHERE key='unusual_mortality';
  SELECT id INTO s_rub FROM public.disease_symptoms WHERE key='wall_rubbing';
  SELECT id INTO s_exo FROM public.disease_symptoms WHERE key='exophthalmia';
  SELECT id INTO s_whi FROM public.disease_symptoms WHERE key='white_spots';
  SELECT id INTO s_cot FROM public.disease_symptoms WHERE key='cotton_growth';
  SELECT id INTO s_fin FROM public.disease_symptoms WHERE key='fin_rot';
  SELECT id INTO s_col FROM public.disease_symptoms WHERE key='color_loss';
  SELECT id INTO s_let FROM public.disease_symptoms WHERE key='lethargy';

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Streptococcose','bacterial','Infection à Streptococcus iniae/agalactiae chez le tilapia.','Streptococcus spp.','Eau chaude >28°C, forte densité, stress','high',50,'Réduire densité, qualité d''eau, désinfection.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_exo,1.0),(d,s_swim,0.9),(d,s_mor,0.8),(d,s_app,0.6),(d,s_red,0.5),(d,s_let,0.5);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Antibiothérapie orale','Florfénicol','10 mg/kg/jour','10 jours','Aliment médicamenté','Réduire température, augmenter aération',true,'Suivi mortalité 14 jours');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Aeromonose','bacterial','Septicémie hémorragique à Aeromonas hydrophila.','Aeromonas hydrophila','Stress, blessures, mauvaise qualité d''eau','high',40,'Manipulation douce, désinfection.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_red,1.0),(d,s_les,0.9),(d,s_swl,0.7),(d,s_exo,0.6),(d,s_mor,0.7),(d,s_app,0.5);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Oxytétracycline','Oxytétracycline','75 mg/kg/jour','7-10 jours','Aliment médicamenté','Renouveler 30% eau',true,'Contrôle hebdomadaire 1 mois');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Columnariose','bacterial','Maladie de la bouche cotonneuse (Flavobacterium columnare).','Flavobacterium columnare','Eau chaude, blessures','high',35,'Qualité d''eau, éviter stress thermique.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_cot,1.0),(d,s_fin,0.9),(d,s_les,0.7),(d,s_col,0.5),(d,s_app,0.4);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Bain au sel','NaCl','3-5 g/L','30 min, 3 jours','Bain','Baisser T°, oxygéner',true,'Surveiller branchies');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Edwardsiellose','bacterial','Infection à Edwardsiella spp. (Clarias).','Edwardsiella tarda/ictaluri','Forte densité, eau polluée','high',45,'Hygiène, biosécurité.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_swl,0.9),(d,s_les,0.8),(d,s_red,0.7),(d,s_mor,0.8),(d,s_app,0.5);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Florfénicol','Florfénicol','10 mg/kg/jour','10 jours','Aliment','Renouveler eau 30%',true,'Autopsie si persistance');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Trichodiniose','parasitic','Parasitose externe à Trichodina.','Trichodina spp.','Matière organique élevée','medium',15,'Renouvellement d''eau régulier.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_rub,1.0),(d,s_pale,0.7),(d,s_surf,0.6),(d,s_let,0.5);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Bain de sel','NaCl','5 g/L','30 min, 3 jours','Bain','Renouveler 30% eau',false,'Microscopie branchies');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Ichthyophthiriose','parasitic','Maladie des points blancs.','Ichthyophthirius multifiliis','Eau froide, stress','high',60,'Quarantaine, T° stable.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_whi,1.0),(d,s_rub,0.9),(d,s_surf,0.5),(d,s_app,0.4);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Vert de malachite + formol','Formol + vert de malachite','0,1 mg/L vert + 25 mg/L formol','3 traitements à 48h','Bain prolongé','T° à 28-30°C',true,'Cycle parasite ~7 jours');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Monogènes (Dactylogyrose/Gyrodactylose)','parasitic','Vers plats parasites des branchies/peau.','Dactylogyrus / Gyrodactylus','Stress, surdensité','medium',20,'Quarantaine, contrôle régulier.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_rub,1.0),(d,s_pale,0.8),(d,s_surf,0.7);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Praziquantel','Praziquantel','2 mg/L','24h','Bain prolongé','Aération forte',false,'Recontrôle 7 jours');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('Saprolegniose','fungal','Mycose à Saprolegnia.','Saprolegnia','Blessures, eau froide','medium',25,'Éviter blessures, désinfection.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_cot,1.0),(d,s_les,0.7),(d,s_col,0.5);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Bain sel + vert malachite','NaCl + vert de malachite','10 g/L + 0,1 mg/L','30 min','Bain','Réchauffer eau',true,'Désinfecter bassin');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('TiLV (Tilapia Lake Virus)','viral','Virose émergente du tilapia.','TiLV (Tilapia tilapinevirus)','Stress, T° élevée','critical',90,'Quarantaine, biosécurité, dépistage.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_mor,1.0),(d,s_exo,0.7),(d,s_swim,0.7),(d,s_let,0.6),(d,s_app,0.6),(d,s_col,0.5);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Aucun traitement curatif','—','—','—','Mesures sanitaires','Isolement total bassin, désinfection',true,'Déclarer aux autorités vétérinaires');

  INSERT INTO public.aqua_diseases (name, category, description, causes, favoring_factors, severity, mortality_rate_pct, prevention)
  VALUES ('ISKNV','viral','Iridovirose (Infectious Spleen and Kidney Necrosis Virus).','Megalocytivirus ISKNV','T° >25°C, densité','critical',70,'Quarantaine, dépistage.') RETURNING id INTO d;
  INSERT INTO public.disease_symptom_map (disease_id, symptom_id, weight) VALUES
   (d,s_mor,1.0),(d,s_swl,0.7),(d,s_pale,0.6),(d,s_let,0.6),(d,s_col,0.5);
  INSERT INTO public.disease_treatments (disease_id, name, active_ingredient, dosage, duration, administration, water_actions, isolation_required, follow_up) VALUES
   (d,'Aucun traitement curatif','—','—','—','Mesures sanitaires','Désinfection, abattage sanitaire',true,'Analyses PCR de confirmation');
END $$;
