-- Add expected survival rate to livestock_batches
ALTER TABLE livestock_batches
ADD COLUMN expected_survival_rate numeric DEFAULT 95.0;

COMMENT ON COLUMN livestock_batches.expected_survival_rate IS 'Taux de survie prévisionnel en pourcentage (0-100)';