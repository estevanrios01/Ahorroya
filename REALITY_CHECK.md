# AhorroYa Reality Check

Fecha: 2026-07-11

## Estado Verificado

- Rama local: `master`.
- Build local: `npm run build` pasa.
- Lint: `npm run lint` pasa sin errores ni warnings.
- Tests: `npm run test -- --runInBand` pasa con 46 tests; integración queda opt-in con `RUN_INTEGRATION_TESTS=1`.
- Supabase REST responde y las 14 tablas principales ya existen:
  - `brands`
  - `categories`
  - `master_products`
  - `stores`
  - `branches`
  - `store_products`
- `store_product_history`
- `product_images`
- `inventory`
- `baskets`
- `basket_items`
- `scraping_jobs`
- `scraping_runs`
- `analytics_events`

## Cambios Aplicados En Esta Pasada

- Eliminado `VERCEL_OIDC_TOKEN` de `.env.local`.
- Reemplazado `/api/barcode/[code]` para consultar Supabase en vez de `mockCatalog`.
- Agregado `db.products.getByBarcode()`.
- Ajustados tests de integración para no fallar si el servidor local no está levantado.
- Migrado Inter a `next/font/google`.
- Corregidos atributos ARIA en `SearchInput`.
- Reemplazado `<img>` restante en `ProductCardPremium` por `next/image`.
- Ignorado `coverage/**` en ESLint.
- Creado `supabase/config.toml` con `npx supabase init`.
- Agregados scripts `db:check`, `db:link` y `db:push`.
- Endurecida la migración RLS para que `users` no sea público y use solo acceso propio.
- Cambiado el rol del proxy de `user_metadata` a `app_metadata`.
- Corregidos workflows de GitHub para ejecutar sobre `master`.
- Reemplazada la Home para cargar productos desde `/api/products` en lugar de usar productos/testimonios hardcodeados.
- Eliminados los links `href="#"` del banner de app en Home.
- Cambiado `DELETE /api/images/[id]` para responder `501` cuando no hay storage backend, en vez de simular eliminación.
- Enlazado el proyecto Supabase `vnfiqibpgpfsevfplvdp`.
- Aplicadas las migraciones `00001_initial.sql` y `00002_security_policies.sql`.
- Ampliado y aplicado el seed inicial con 12 marcas, 7 categorías, 12 productos, 8 comercios, 8 sucursales, 15 precios y 15 eventos históricos.
- Corregidas páginas `/ciudades` y `/marcas` para usar campos reales (`productCount`) del catálogo.

## Bloqueadores Reales

1. La `SUPABASE_SERVICE_ROLE_KEY` fue expuesta en chat y debe rotarse.
2. La base ya existe, pero el catálogo sigue siendo seed inicial pequeño; faltan datos nacionales reales y scrapers robustos.
3. El storage backend para imágenes aún no está configurado.

## Comandos Útiles

- `npm run db:check`: verifica por REST si las tablas existen.
- `npm run db:link`: intenta enlazar el proyecto Supabase `vnfiqibpgpfsevfplvdp`.
- `npm run db:push`: aplica migraciones cuando el proyecto esté enlazado/autorizado.
- `npx supabase db query --linked --file supabase/seed/001_productos.sql`: reaplica el seed inicial.

## Siguiente Paso Técnico

Rotar `SUPABASE_SERVICE_ROLE_KEY`, actualizar Vercel con la clave rotada y desplegar el código actual. Después ejecutar una auditoría de rutas contra producción.
