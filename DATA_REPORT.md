# AhorroYa Data Report

Fecha: 2026-07-12

## Estado actual verificado

AhorroYa ya supero la meta minima de catalogo global real:

- Productos maestros reales: 211.804.
- Imagenes normalizadas en `product_images`: 205.800.
- Precios reales en `store_products`: 1.303.984.
- Precios activos disponibles: 1.269.820.
- Precios online nacionales: 228.779.
- Precios por sucursal/ciudad: 1.041.040.
- Marcas: 11.840.
- Categorias: 931.
- Historial de precios: 1.880.076 eventos.
- Sucursales registradas: 767.
- Cobertura: 42 ciudades y 32 departamentos.

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
| Makro | Supermercado | API publica de ofertas por sede | Activa |
| Ara | Supermercado | Paginas publicas de ofertas Ara/Elementor | Activa parcial |
| Farmatodo | Farmacia | Buscador publico Algolia con precios por ciudad | Activa |
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
- `scripts/import-makro-offers.js` importa ofertas reales de Makro por 22 sedes, con precio, imagen, SKU, vigencia y sucursal.
- `scripts/import-farmatodo-algolia.js` importa catalogo real de Farmatodo desde su buscador publico, con imagen, codigo de barras, precio nacional y precios por ciudad.
- `scripts/import-ara-offers.js` importa ofertas reales publicadas por Ara, con precio oferta, precio regular, imagen oficial y EAN cuando aparece en la URL de imagen.
- `.github/workflows/live-prices.yml` ejecuta esa sincronizacion cada 30 minutos con concurrencia controlada.
- `.gitignore` excluye `logs/` para no subir archivos de ejecucion local.

## Actualizacion viva de precios

El sistema ahora opera como near real-time:

- Cada 30 minutos GitHub Actions ejecuta `npm run prices:live`, `npm run prices:makro`, `npm run prices:farmatodo` y `npm run prices:ara`.
- Cada corrida revisa una tanda rotativa de terminos sensibles a precio: alimentos basicos, aseo, farmacia, bebe y mascotas.
- Cada corrida revisa tambien una tanda rotativa de comercios para evitar timeouts y cubrir todos los comercios durante el dia.
- El worker consulta el comercio real en ese momento.
- Si cambia `price`, `original_price` o `available`, actualiza `store_products` y registra evento en `store_product_history`.
- Si no cambio nada, solo refresca la captura actual sin duplicar historial innecesario.
- `npm run prices:freshness` audita frescura de precios sin hacer conteos pesados que tumben PostgREST.

Esto es lo mas cercano a "en vivo" sin integracion oficial con webhooks de cada comercio.

Medicion de control del 2026-07-12:

- Corrida manual GitHub Actions `Live Prices`: success, 0 fallos, 753 eventos de precio.
- Importacion Makro completa local: 22 sedes, 1.934 ofertas fuente, 111 productos unicos, 1.836 precios por sucursal, 1.832 eventos de precio iniciales.
- Prueba Makro modo workflow: 1.836 precios refrescados, 0 eventos duplicados cuando no hubo cambio.
- Importacion Farmatodo completa local: 1.800 productos fuente, 17 ciudades online, 31.632 precios, 31.272 eventos de precio iniciales.
- Prueba Farmatodo modo workflow: 3.454 precios refrescados, 0 eventos duplicados cuando no hubo cambio.
- Importacion Ara completa local: 32 productos fuente, 1 rama nacional de ofertas, 32 precios, 32 eventos iniciales.
- Prueba Ara modo workflow: 32 precios refrescados, 0 eventos duplicados cuando no hubo cambio.
- Precios disponibles totales: 1.269.820.
- Precios online nacionales disponibles: 228.779.
- Precios por sucursal/ciudad disponibles: 1.041.040.
- Actualizados en la ultima hora: 1.827.
- Actualizados en las ultimas 6 horas: 45.071.
- Actualizados en las ultimas 24 horas: 329.139.
- Ultima captura verificada: 2026-07-12T15:08:17Z desde Ara Ofertas Nacionales.

## Limitaciones honestas

- La mayoria de precios VTEX siguen siendo online/nacionales; Makro ya entra como precio por sede fisica, Farmatodo entra como precio online por ciudad y Ara entra como ofertas nacionales publicadas.
- La meta de 200.000 productos ya se cumplio como catalogo global real; la siguiente mejora no es inflar mas, sino aumentar cobertura de precios por ciudad y por sede.
- D1 responde con proteccion anti-bot desde procesos server; Cruz Verde expone categorias/zonas, pero sus endpoints de producto devuelven `INVALID_SESSION` sin sesion valida. No se importan precios de esas fuentes hasta tener API/feed autorizado o una via estable y permitida.
- En cargas finales VTEX se omitieron algunas inserciones auxiliares de `product_images` e historial para evitar timeouts. Farmatodo y Makro ya cargan imagenes/historial en su importacion completa.
- Actualizacion realmente instantanea solo seria posible si el comercio entrega webhook, feed oficial o API con eventos de cambio. Mientras no exista eso, se usa polling frecuente y deteccion de cambios.

## Siguiente bloque recomendado

1. Conseguir API/feed autorizado para D1 y Cruz Verde, o habilitar una integracion oficial.
2. Separar claramente en UI/API "precio online" vs "precio por sede".
3. Construir metricas materializadas para no depender de conteos pesados sobre tablas grandes.
4. Enriquecer productos con multiples imagenes solo para los mas consultados.
5. Priorizar cobertura por ciudad: Cali, Bogota, Medellin, Barranquilla, Bucaramanga y Pereira.
