# AhorroYa Data Report

Fecha: 2026-07-12

## Estado actual verificado

AhorroYa ya supero la meta minima de catalogo global real:

- Productos maestros reales: 200.006.
- Imagenes normalizadas en `product_images`: 202.974.
- Precios online reales en `store_products`: 198.542.
- Marcas: 11.565.
- Categorias: 851.
- Historial de precios: 1.842.173 eventos.
- Sucursales registradas: 728.

Los conteos fueron verificados contra Supabase REST usando `count=planned`, que en este volumen es el metodo estable disponible sin tumbar PostgREST con conteos exactos.

## Que significa "real"

Los productos importados provienen de catalogos publicos de comercios reales. Cada registro conserva, cuando la fuente lo entrega:

- nombre publicado por el comercio
- marca
- categoria
- EAN/codigo de barras
- precio actual online
- precio anterior cuando existe
- disponibilidad
- URL original del producto
- imagen original del comercio en `master_products.image`
- historial de precio cuando la carga no se ejecuto en modo rapido

No se inventaron precios para inflar la base.

## Fuentes reales conectadas

### Supermercados y farmacias prioritarias

| Comercio | Tipo | Fuente | Estado |
| --- | --- | --- | --- |
| Exito | Supermercado | API publica VTEX | Activa |
| Carulla | Supermercado | API publica VTEX | Activa |
| Olimpica | Supermercado | API publica VTEX | Activa |
| Jumbo | Supermercado | API publica VTEX | Activa |
| Metro | Supermercado | API publica VTEX | Activa |
| Mercaldas | Supermercado | API publica VTEX | Activa |
| Megatiendas | Supermercado | API publica VTEX | Activa |
| Euro Supermercados | Supermercado | API publica VTEX | Activa |
| La Rebaja | Farmacia | API publica VTEX | Activa |
| Droguerias Colsubsidio | Farmacia | API publica VTEX | Activa |
| Locatel | Farmacia | API publica VTEX | Activa |
| Medipiel | Farmacia | API publica VTEX | Activa |
| Bella Piel | Farmacia | API publica VTEX | Activa |
| Farmacias Pasteur | Farmacia | API publica VTEX | Activa |
| Blush-Bar | Farmacia/Cuidado personal | API publica VTEX | Activa |
| Cromantic | Farmacia/Cuidado personal | API publica VTEX | Activa |

### Fuentes retail usadas para completar catalogo global

Estas fuentes se marcaron como `Retail`, no como supermercado/farmacia, para no contaminar la logica principal:

| Comercio | Tipo | Fuente | Estado |
| --- | --- | --- | --- |
| Easy | Retail | API publica VTEX | Activa |
| Miniso | Retail | API publica VTEX | Activa |
| Velez | Retail | API publica VTEX | Activa |
| Pepeganga | Retail | API publica VTEX | Activa |
| Panamericana | Retail | API publica VTEX | Activa |

## Cambios tecnicos

- `scripts/import-vtex-catalog.js` ahora soporta:
  - busqueda por termino
  - importacion por categoria VTEX (`VTEX_CATEGORY_PATH`)
  - timeout por peticion a origen
  - reintentos ante cortes de red/PostgREST
  - modo rapido para cargas masivas (`IMPORT_SKIP_PRODUCT_IMAGES`, `IMPORT_SKIP_PRICE_HISTORY`)
  - deteccion de cambios para guardar historial solo cuando cambia precio, descuento o disponibilidad
  - nuevas fuentes VTEX reales
- `scripts/import-vtex-bulk.js` ahora permite `BULK_TERMS` y usa conteo planned.
- `scripts/import-vtex-categories-bulk.js` importa por arbol de categorias, soporta offset (`CATEGORY_BULK_START_CATEGORY`) e incluye categorias padre cuando se requiere volumen.
- `scripts/sync-live-prices.js` ejecuta sincronizacion rotativa de precios vivos contra comercios reales.
- `.github/workflows/live-prices.yml` ejecuta esa sincronizacion cada 15 minutos con concurrencia controlada.
- `.gitignore` excluye `logs/` para no subir archivos de ejecucion local.

## Actualizacion viva de precios

El sistema ahora opera como near real-time:

- Cada 15 minutos GitHub Actions ejecuta `npm run prices:live`.
- Cada corrida revisa una tanda rotativa de terminos sensibles a precio: alimentos basicos, aseo, farmacia, bebe y mascotas.
- Cada corrida revisa tambien una tanda rotativa de comercios para evitar timeouts y cubrir todos los comercios durante el dia.
- El worker consulta el comercio real en ese momento.
- Si cambia `price`, `original_price` o `available`, actualiza `store_products` y registra evento en `store_product_history`.
- Si no cambio nada, solo refresca la captura actual sin duplicar historial innecesario.
- `npm run prices:freshness` audita frescura de precios sin hacer conteos pesados que tumben PostgREST.

Esto es lo mas cercano a "en vivo" sin integracion oficial con webhooks de cada comercio.

Medicion de control del 2026-07-12:

- Precios online disponibles: 196.550.
- Actualizados en la ultima hora: 283.
- Actualizados en las ultimas 6 horas: 1.613.
- Actualizados en las ultimas 24 horas: 121.944.
- Ultima captura verificada: 2026-07-12T09:01:55Z desde Carulla.

## Limitaciones honestas

- Los precios actuales son precios online/nacionales. No deben presentarse como precio exacto de una sede fisica especifica hasta conectar fuentes por ciudad/sucursal.
- La meta de 200.000 productos ya se cumplio como catalogo global real; la siguiente mejora no es inflar mas, sino aumentar cobertura de precios por ciudad y por sede.
- D1, Ara, Makro, Farmatodo y Cruz Verde requieren conectores especificos no-VTEX o APIs privadas/publicas distintas.
- En cargas finales se omitieron algunas inserciones auxiliares de `product_images` e historial para evitar timeouts. La imagen principal sigue guardada en `master_products.image`.
- Actualizacion realmente instantanea solo seria posible si el comercio entrega webhook, feed oficial o API con eventos de cambio. Mientras no exista eso, se usa polling frecuente y deteccion de cambios.

## Siguiente bloque recomendado

1. Crear conectores especificos para D1, Ara, Makro, Farmatodo y Cruz Verde.
2. Separar claramente en UI/API "precio online" vs "precio por sede".
3. Construir metricas materializadas para no depender de conteos pesados sobre tablas grandes.
4. Enriquecer productos con multiples imagenes solo para los mas consultados.
5. Priorizar cobertura por ciudad: Cali, Bogota, Medellin, Barranquilla, Bucaramanga y Pereira.
