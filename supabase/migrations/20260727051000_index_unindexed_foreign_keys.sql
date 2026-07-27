-- Supabase's own performance advisor flagged these 5 foreign keys as
-- missing a covering index. Without one, every update/delete on the
-- referenced row (master_products, users, stores, categories,
-- store_products) forces Postgres to sequentially scan the referencing
-- table to enforce the FK constraint, and any query joining or filtering
-- on these columns does the same. Harmless at today's pilot-scale row
-- counts, but exactly the kind of thing that turns into real lock
-- contention and slow queries under a traffic spike. Purely additive.

CREATE INDEX IF NOT EXISTS idx_basket_items_master_product_id ON public.basket_items (master_product_id);
CREATE INDEX IF NOT EXISTS idx_baskets_user_id ON public.baskets (user_id);
CREATE INDEX IF NOT EXISTS idx_branches_store_id ON public.branches (store_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store_product_id ON public.inventory (store_product_id);
