-- Enforce product gallery rules: up to 8 images per product, unique sort order per product (0-7), and single primary image
-- Safe to run multiple times using DO blocks for idempotent constraint creation.

BEGIN;

-- 1) Ensure FK from product_images.product_id -> products.id (with cascade deletes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'product_images'
    AND constraint_name = 'product_images_product_id_fkey'
  ) THEN
    ALTER TABLE public.product_images
      ADD CONSTRAINT product_images_product_id_fkey
      FOREIGN KEY (product_id)
      REFERENCES public.products(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 2) Ensure sort_order is within 0..7 when present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'product_images'
    AND constraint_name = 'product_images_sort_order_range_chk'
  ) THEN
    ALTER TABLE public.product_images
      ADD CONSTRAINT product_images_sort_order_range_chk
      CHECK (sort_order IS NULL OR (sort_order >= 0 AND sort_order <= 7));
  END IF;
END $$;

-- 3) Unique sort_order within a product (NULL allowed to temporarily skip ordering)
--    This allows at most one row per (product_id, sort_order) pair.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'product_images'
    AND indexname = 'product_images_product_sort_order_uidx'
  ) THEN
    CREATE UNIQUE INDEX product_images_product_sort_order_uidx
      ON public.product_images(product_id, sort_order)
      WHERE sort_order IS NOT NULL;
  END IF;
END $$;

-- 4) Enforce only one primary image per product using a partial unique index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'product_images'
    AND indexname = 'product_images_one_primary_per_product_uidx'
  ) THEN
    CREATE UNIQUE INDEX product_images_one_primary_per_product_uidx
      ON public.product_images(product_id)
      WHERE is_primary = true;
  END IF;
END $$;

-- 5) Trigger function to:
--    - Auto-assign the smallest available sort_order between 0 and 7 if NULL
--    - Enforce a hard limit of 8 images per product
--    - Coerce is_primary to false if another primary exists (unless this row is being set as primary)
CREATE OR REPLACE FUNCTION public.enforce_product_gallery_rules()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
  v_taken boolean[] := ARRAY[false,false,false,false,false,false,false,false];
  v_slot integer := NULL;
BEGIN
  -- Count existing images for this product (excluding the current row in update by id)
  SELECT COUNT(*) INTO v_count
  FROM public.product_images pi
  WHERE pi.product_id = NEW.product_id
    AND (TG_OP = 'INSERT' OR pi.id <> NEW.id);

  IF TG_OP = 'INSERT' THEN
    IF v_count >= 8 THEN
      RAISE EXCEPTION 'Maximum of 8 gallery images per product allowed (product_id=%).', NEW.product_id
        USING ERRCODE = 'check_violation';
    END IF;
  ELSE
    -- UPDATE: if the row is moving from another product or new insert-like condition, recheck the cap
    IF NEW.product_id IS DISTINCT FROM OLD.product_id THEN
      IF v_count >= 8 THEN
        RAISE EXCEPTION 'Maximum of 8 gallery images per product allowed (product_id=%).', NEW.product_id
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  END IF;

  -- Auto-assign sort_order if NULL: find the smallest free slot 0..7
  IF NEW.sort_order IS NULL THEN
    FOR v_slot IN 0..7 LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.product_images pi
        WHERE pi.product_id = NEW.product_id AND pi.sort_order = v_slot
      ) THEN
        NEW.sort_order := v_slot;
        EXIT;
      END IF;
    END LOOP;

    IF NEW.sort_order IS NULL THEN
      -- All slots taken - should have been caught by the v_count check, but double-guard
      RAISE EXCEPTION 'No free gallery slots available for product_id=%.', NEW.product_id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- If marking this row as primary, ensure no other primary exists (partial unique index already enforces this)
  -- If not primary, no action. If primary set to true on update and another exists, the unique index will error.

  RETURN NEW;
END;
$$;

-- 6) Create triggers for INSERT/UPDATE to enforce rules and auto-assign sort_order
DROP TRIGGER IF EXISTS product_images_gallery_rules_ins_tg ON public.product_images;
CREATE TRIGGER product_images_gallery_rules_ins_tg
BEFORE INSERT ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.enforce_product_gallery_rules();

DROP TRIGGER IF EXISTS product_images_gallery_rules_upd_tg ON public.product_images;
CREATE TRIGGER product_images_gallery_rules_upd_tg
BEFORE UPDATE ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.enforce_product_gallery_rules();

COMMIT;
