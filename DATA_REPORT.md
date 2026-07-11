# AhorroYa Data Report

Fecha: 2026-07-11

## Estado de poblacion

La base de datos de Supabase fue alimentada con una semilla nacional operativa para validar el modelo de comparacion por ciudad, comercio, sede, producto, precio e historial.

## Conteos actuales

| Tabla | Total |
|---|---:|
| brands | 73 |
| categories | 13 |
| master_products | 1.476 |
| stores | 15 |
| branches | 324 |
| store_products | 134.227 |
| store_product_history | 143.819 |
| product_images | 1.465 |

## Cobertura

- 40 ciudades principales e intermedias.
- 15 cadenas entre supermercados y farmacias.
- 324 sedes operativas.
- Cada sede activa tiene minimo 200 productos asociados.
- Los precios quedan relacionados por producto, comercio y sede.
- El historial de precios conserva eventos sin sobrescribir.

## Cadenas incluidas

Exito, Carulla, Surtimax, Super Inter, D1, Ara, Olimpica, Jumbo, Metro, Makro, Farmatodo, Cruz Verde, La Rebaja, Pasteur y Locatel.

## Nota de calidad de datos

Esta carga deja funcionando la estructura nacional y permite probar busqueda, ciudad, sedes, comparacion e historial a escala inicial.

No debe considerarse todavia un catalogo oficial completo. Los precios masivos son una semilla operativa controlada y deben ser reemplazados o validados progresivamente por scrapers reales, APIs autorizadas, feeds comerciales o carga administrativa verificada.

## Verificacion tecnica

- `TARGET_PRODUCTS=1000 PRODUCTS_PER_BRANCH=200 npm run data:populate`: OK.
- `npm run data:backfill-branches`: OK.
- `npm run data:audit`: OK, minimo 200 productos por sede.
- `npm run db:check`: OK, 14/14 tablas accesibles.
- `npm run lint`: OK.
- `npm run test -- --runInBand`: OK, 8 suites pasadas, 1 suite de integracion omitida por requerir servidor.
- `npm run build`: OK, 47 rutas compiladas.

## Siguiente bloque recomendado

1. Mejorar scrapers por comercio, empezando por Olimpica y Farmatodo porque sus paginas publicas exponen productos con mayor facilidad.
2. Agregar captura por ciudad/sede cuando el comercio lo permita.
3. Descargar o cachear imagenes oficiales en Supabase Storage.
4. Agregar estado de verificacion por precio para distinguir `seed`, `scraper`, `admin` y `api`.
5. Subir el volumen de `master_products` de 1.476 a 10.000 y luego 100.000.
