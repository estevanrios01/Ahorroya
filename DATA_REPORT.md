# AhorroYa Data Report

Fecha de verificacion: 2026-07-13

## Resumen ejecutivo

El catalogo publico de AhorroYa puede consultar productos, imagenes y precios publicados por comercios reales. Sin embargo, la base PostgreSQL de Supabase no esta disponible actualmente y rechaza conexiones con `57P03` (`database system is not accepting connections`). Por esta razon no es posible certificar hoy ningun total persistido de productos, precios, imagenes, marcas o sucursales.

La meta de 200.000 productos reales no se considera cumplida hasta que pueda medirse directamente en PostgreSQL, verificarse la procedencia de cada registro y distinguir productos maestros de ofertas por comercio.

## Estado verificado

| Componente | Estado | Evidencia |
| --- | --- | --- |
| Sitio web y catalogo de contingencia | Operativo | Busqueda, comercio y detalle consultados de extremo a extremo |
| Fuentes comerciales publicas | Operativas parcialmente | 14 comercios consultables desde el catalogo vivo |
| Imagenes de producto | Operativas en las muestras probadas | Las imagenes proceden de la respuesta del comercio y conservan su URL original |
| Comparacion por EAN | Operativa en las muestras probadas | Un producto exacto mostro ofertas de varios comercios |
| PostgreSQL / PostgREST | Critico | Las 14 tablas auditadas responden 503 y PostgreSQL rechaza conexiones |
| Conteos persistidos | No verificables | No se publican cifras estimadas como hechos |
| Historial persistido | No verificable | La escritura queda pendiente hasta recuperar PostgreSQL |
| Migracion de capacidad | Preparada, no aplicada | Pendiente de que PostgreSQL acepte conexiones |

## Fuentes comerciales conectadas

El modo de contingencia consulta catalogos publicos de estos comercios:

- Exito
- D1
- Olimpica
- Carulla
- Jumbo
- Metro
- La Rebaja
- Droguerias Colsubsidio
- Locatel
- Farmacias Pasteur
- Farmatodo
- Cruz Verde
- Makro
- Ara

La disponibilidad y cobertura dependen de lo que cada comercio exponga publicamente. Una fuente publica no equivale a una integracion oficial: no ofrece garantia de actualizacion instantanea, estabilidad contractual ni cobertura de todas las sedes.

## Integridad de datos

Se retiraron los procesos que generaban artificialmente:

- variantes de productos para aumentar el volumen
- sucursales y direcciones inexistentes
- precios calculados o aleatorios
- existencias por ciudad sin evidencia de origen
- eventos historicos iniciales duplicados

La poblacion masiva ahora exige `REAL_CATALOG_IMPORT=1` y solo acepta importadores basados en fuentes de comercios. El modo predeterminado es una simulacion sin escrituras.

El pipeline de precios evita actualizar registros cuando no cambio el precio, la disponibilidad ni los metadatos relevantes. El historial solo se crea cuando existe un cambio real de precio o disponibilidad.

## Incidente de Supabase

Acciones realizadas:

1. Se verifico que el proyecto figure activo en el plano de control.
2. Se probaron PostgREST, conexion PostgreSQL y Supabase CLI.
3. Se aumento de forma segura el `statement_timeout` a 120 segundos.
4. Se solicito un reinicio oficial del proyecto mediante Management API.
5. Se espero la recuperacion y se repitieron las pruebas.

Resultado: PostgreSQL continua rechazando conexiones y PostgREST devuelve 503. Los correos historicos del proyecto reportaron aproximadamente 1.393 MB usados sobre el limite de 500 MB del plan Free, ademas de agotamiento del presupuesto de Disk I/O. No se ejecutara una limpieza destructiva sin poder inspeccionar primero la base y conservar una copia.

## Mejoras preparadas

La migracion `20260713120000_catalog_capacity_and_retention.sql` incorpora:

- indices parciales para entidades activas
- indices trigram para busqueda textual
- tabla de metricas operacionales con RLS y permisos explicitos
- funcion de diagnostico de almacenamiento restringida a `service_role`
- funcion manual de retencion para historial y registros operacionales antiguos

La migracion no ha sido aplicada porque la base no acepta conexiones.

## Pruebas ejecutadas

- `npm run lint`: aprobado
- `npm test -- --runInBand`: 9 suites aprobadas, 50 pruebas aprobadas y 4 omitidas
- `npm run build`: aprobado con Next.js 16.2.10
- pruebas API de integracion con servidor local: 4 de 4 aprobadas
- busqueda exacta `arroz diana 500`: un producto con ofertas reales de varios comercios
- paginas de D1, Exito, Farmatodo y Cruz Verde: productos con imagen y precio en las muestras probadas
- detalle de producto: imagen correspondiente, EAN y comparacion entre comercios
- reporte de calidad: devuelve 503 degradado cuando no puede medir la base, en vez de mostrar ceros o cifras inventadas

## Trabajo pendiente real

1. Recuperar la instancia PostgreSQL o migrar el proyecto a una instancia con capacidad suficiente.
2. Aplicar las migraciones y obtener un reporte de almacenamiento antes de borrar datos.
3. Identificar y eliminar exclusivamente datos sinteticos mediante una transaccion controlada y con respaldo.
4. Reimportar catalogos oficiales por lotes, sin historial inicial redundante.
5. Medir productos maestros, ofertas, imagenes, sedes y frescura directamente desde la base.
6. Ampliar comercios y ciudades solo cuando exista una fuente comprobable para cada registro.

## Criterio de finalizacion

AhorroYa solo podra declarar 200.000 productos reales cuando una auditoria reproducible confirme:

- origen comercial verificable
- identificador estable o EAN cuando exista
- imagen correspondiente al producto
- oferta asociada al comercio correcto
- precio y fecha de captura
- deduplicacion entre comercios
- ausencia de sucursales, precios y existencias sinteticas

Hasta entonces, el sistema se considera operativo en modo de contingencia y la recuperacion de la base sigue siendo el bloqueador principal.
