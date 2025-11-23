-- Add species and duration_months columns to production_cycles table
ALTER TABLE production_cycles
ADD COLUMN IF NOT EXISTS species TEXT,
ADD COLUMN IF NOT EXISTS duration_months INTEGER;

-- Add comment to explain the columns
COMMENT ON COLUMN production_cycles.species IS 'Species or product type for the production cycle (predefined or custom)';
COMMENT ON COLUMN production_cycles.duration_months IS 'Duration of the cycle in months';