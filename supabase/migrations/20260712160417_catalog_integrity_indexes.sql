-- Indices used by catalog verification, image cleanup and live price reads.
create index if not exists idx_store_products_store_url
  on public.store_products (store_id, url)
  where url is not null;

create index if not exists idx_product_images_url
  on public.product_images (url);

create index if not exists idx_master_products_image
  on public.master_products (image)
  where image is not null;

create index if not exists idx_product_images_product_primary
  on public.product_images (master_product_id, is_primary desc);

create index if not exists idx_store_product_history_listing_captured
  on public.store_product_history (store_product_id, captured_at desc);
