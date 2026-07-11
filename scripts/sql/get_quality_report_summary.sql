create or replace function public.get_quality_report_summary()
returns jsonb
language sql
security invoker
as $$
  with counts as (
    select
      (select count(*) from public.master_products where status = 'active')::bigint as total_products,
      (select count(*) from public.stores where status = 'active')::bigint as total_stores,
      (select count(*) from public.store_products where available = true)::bigint as total_prices,
      (select count(*) from public.brands)::bigint as total_brands,
      (select count(*) from public.categories)::bigint as total_categories,
      (select count(*) from public.master_products where status = 'active' and brand_id is null)::bigint as missing_brand,
      (select count(*) from public.master_products where status = 'active' and category_id is null)::bigint as missing_category,
      (select count(*) from public.store_products where price <= 0 or price > 1000000)::bigint as anomalous_prices,
      (select count(*) from public.master_products where ean is not null and ean !~ '^\d{8,14}$')::bigint as invalid_ean,
      (
        select count(*)
        from (
          select ean
          from public.master_products
          where ean is not null
          group by ean
          having count(*) > 1
        ) duplicates
      )::bigint as duplicate_ean,
      (select count(*) from public.product_images where url is null or url !~* '^https?://')::bigint as image_issues
  ),
  latest_run as (
    select to_jsonb(sr.*) as data
    from public.scraping_runs sr
    order by sr.started_at desc
    limit 1
  )
  select jsonb_build_object(
    'totalProducts', counts.total_products,
    'totalStores', counts.total_stores,
    'totalPrices', counts.total_prices,
    'totalBrands', counts.total_brands,
    'totalCategories', counts.total_categories,
    'issues', jsonb_build_object(
      'duplicates', counts.duplicate_ean,
      'anomalousPrices', counts.anomalous_prices,
      'imageIssues', counts.image_issues,
      'invalidEan', counts.invalid_ean,
      'missingCategory', counts.missing_category,
      'missingBrand', counts.missing_brand
    ),
    'lastScraping', coalesce((select data from latest_run), 'null'::jsonb)
  )
  from counts;
$$;

grant execute on function public.get_quality_report_summary()
  to anon, authenticated, service_role;
