-- Add ON DELETE CASCADE to all foreign keys referencing users (PostgreSQL syntax)
-- Example for activities table:
ALTER TABLE activities DROP CONSTRAINT IF EXISTS fk_activities_user;
ALTER TABLE activities ADD CONSTRAINT fk_activities_user FOREIGN KEY ("workerId") REFERENCES users(id) ON DELETE CASCADE;

-- Example for color_mix_formulas table:
ALTER TABLE color_mix_formulas DROP CONSTRAINT IF EXISTS fk_color_mix_formulas_user;
ALTER TABLE color_mix_formulas ADD CONSTRAINT fk_color_mix_formulas_user FOREIGN KEY ("createdBy") REFERENCES users(id) ON DELETE CASCADE;

-- Repeat for all tables referencing users as needed.
-- To find constraint names in PostgreSQL:
-- SELECT conname, conrelid::regclass FROM pg_constraint WHERE confrelid = 'users'::regclass;
