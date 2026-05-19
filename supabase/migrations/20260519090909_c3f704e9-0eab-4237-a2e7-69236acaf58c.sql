ALTER TABLE livestock_batches 
  ADD COLUMN IF NOT EXISTS male_weight numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS female_weight numeric DEFAULT 0;

ALTER TABLE feed_stocks
  ADD COLUMN IF NOT EXISTS bag_count numeric,
  ADD COLUMN IF NOT EXISTS kg_per_bag numeric;