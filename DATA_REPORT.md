# AhorroYa Data Report

Fecha: 2026-07-11

## Estado de poblacion

La base de datos de Supabase fue alimentada con una semilla nacional operativa para validar el modelo de comparacion por ciudad, comercio, sede, producto, precio e historial.

## Conteos actuales

| Tabla | Total |
|---|---:|
| brands | 73 |
| categories | 13 |
| master_products | 10.476 |
| stores | 15 |
| branches | 324 |
| store_products | 972.015 |
| store_product_history | 1.455.607 |
| product_images | 10.465 |

## Cobertura

- 40 ciudades principales e intermedias.
- 15 cadenas entre supermercados y farmacias.
- 324 sedes operativas.
- Cada sede activa tiene exactamente 3.000 productos asociados.
- Los 10.476 productos maestros tienen al menos un precio asociado.
- Los precios quedan relacionados por producto, comercio y sede.
- El historial de precios conserva eventos sin sobrescribir.

## Cadenas incluidas

Exito, Carulla, Surtimax, Super Inter, D1, Ara, Olimpica, Jumbo, Metro, Makro, Farmatodo, Cruz Verde, La Rebaja, Pasteur y Locatel.

## Nota de calidad de datos

Esta carga deja funcionando la estructura nacional y permite probar busqueda, ciudad, sedes, comparacion e historial a escala inicial.

No debe considerarse todavia un catalogo oficial completo. Los precios masivos son una semilla operativa controlada y deben ser reemplazados o validados progresivamente por scrapers reales, APIs autorizadas, feeds comerciales o carga administrativa verificada.

## Verificacion tecnica

- `TARGET_PRODUCTS=5000 PRODUCTS_PER_BRANCH=1000 npm run data:populate`: OK.
- `npm run data:backfill-branches`: OK.
- `npm run data:backfill-low`: OK.
- `TARGET_PRODUCTS=10000 PRODUCTS_PER_BRANCH=1000 npm run data:populate`: OK.
- `MIN_PRODUCTS_PER_BRANCH=2000 npm run data:backfill-low`: OK.
- `MIN_PRODUCTS_PER_BRANCH=3000 npm run data:backfill-low`: OK.
- `scripts/sql/backfill_missing_price_history.sql`: OK, historial inicial para precios sin evento.
- `node scripts/backfill-missing-price-history.js`: OK, historial inicial para precios nuevos.
- `npm run data:audit`: OK, minimo 3.000 productos por sede y 10.476 productos con precio.
- `npm run db:check`: OK, 14/14 tablas accesibles.
- `npm run lint`: OK.
- `npm run test -- --runInBand`: OK, 8 suites pasadas, 1 suite de integracion omitida por requerir servidor.
- `npm run build`: OK, 47 rutas compiladas.

## Siguiente bloque recomendado

1. Mejorar scrapers por comercio, empezando por Olimpica y Farmatodo porque sus paginas publicas exponen productos con mayor facilidad.
2. Agregar captura por ciudad/sede cuando el comercio lo permita.
3. Descargar o cachear imagenes oficiales en Supabase Storage.
4. Agregar estado de verificacion por precio para distinguir `seed`, `scraper`, `admin` y `api`.
5. Subir el catalogo maestro de 10.476 a 25.000 productos, manteniendo precios por sede sin perder rendimiento.
