
-- Drop the unique constraint on slug to prevent duplicate key errors
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
