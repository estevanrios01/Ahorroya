create index if not exists idx_store_products_available_master
  on public.store_products (available, master_product_id);

create index if not exists idx_store_products_available_branch
  on public.store_products (available, branch_id);
