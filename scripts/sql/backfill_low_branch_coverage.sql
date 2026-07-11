update store_products
set available = true,
    updated_at = now()
where available = false;

with low_branches as (
  select
    b.id as branch_id,
    b.store_id,
    coalesce(nullif(b.code, ''), 'BR') as branch_code,
    count(sp.id) filter (where sp.available = true) as active_count
  from branches b
  left join store_products sp on sp.branch_id = b.id
  where b.status = 'active'
  group by b.id, b.store_id, b.code
  having count(sp.id) filter (where sp.available = true) < 1000
),
candidates as (
  select
    lb.branch_id,
    lb.store_id,
    lb.branch_code,
    lb.active_count,
    mp.id as master_product_id,
    mp.slug,
    row_number() over (
      partition by lb.branch_id
      order by md5(mp.id::text || lb.branch_id::text)
    ) as rn
  from low_branches lb
  cross join master_products mp
  where mp.status = 'active'
    and not exists (
      select 1
      from store_products sp
      where sp.branch_id = lb.branch_id
        and sp.master_product_id = mp.id
    )
)
insert into store_products (
  master_product_id,
  store_id,
  branch_id,
  sku,
  price,
  original_price,
  available,
  stock,
  captured_at,
  updated_at
)
select
  master_product_id,
  store_id,
  branch_id,
  left(branch_code || '-' || slug, 100),
  (round((2500 + (('x' || substr(md5(master_product_id::text || branch_id::text), 1, 6))::bit(24)::int % 120000)) / 50.0) * 50)::numeric(12,2) as price,
  (round(((2500 + (('x' || substr(md5(master_product_id::text || branch_id::text), 1, 6))::bit(24)::int % 120000)) * 1.08) / 50.0) * 50)::numeric(12,2) as original_price,
  true,
  25 + rn % 175,
  now(),
  now()
from candidates
where rn <= greatest(0, 1000 - active_count)
on conflict (master_product_id, store_id, branch_id) do nothing;
