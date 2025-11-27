-- Ajouter la colonne infrastructure_id dans feeding_plans pour lier les planifications aux infrastructures
ALTER TABLE feeding_plans ADD COLUMN IF NOT EXISTS infrastructure_id uuid REFERENCES cycle_infrastructures(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_feeding_plans_infrastructure ON feeding_plans(infrastructure_id);