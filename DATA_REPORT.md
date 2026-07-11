# AhorroYa Data Report

Fecha: 2026-07-11

## Estado actual

AhorroYa ya tiene una primera base real verificable desde catalogos publicos VTEX:

- Olimpica: 2.011 precios online reales con imagen oficial.
- Exito: 4.313 precios online reales con imagen oficial.
- Carulla: 4.118 precios online reales con imagen oficial.
- Productos maestros totales: 18.615.
- Imagenes de producto totales: 21.734.
- Marcas: 1.410.
- Categorias: 217.
- Historial de precios: 1.467.840 eventos.

Los productos reales importados conservan:

- nombre publicado por el comercio
- marca
- categoria
- EAN cuando existe
- precio actual
- precio anterior cuando existe
- disponibilidad
- URL de producto
- imagen original del comercio
- evento historico de precio

## Fuentes reales conectadas

| Comercio | Fuente | Estado |
| --- | --- | --- |
| Olimpica | API publica VTEX `www.olimpica.com` | Activa |
| Exito | API publica VTEX `www.exito.com` | Activa |
| Carulla | API publica VTEX `www.carulla.com` | Activa |

## Cambios tecnicos

- Se creo `scripts/import-vtex-catalog.js` como importador generico para comercios VTEX.
- El importador soporta paginacion por ventana y busqueda por termino para ampliar cobertura.
- Se agregaron dominios oficiales de imagenes a `next.config.mjs`.
- La portada ahora consulta el catalogo general reciente, evitando ocultar datos reales online por filtros de ciudad.
- Los listados globales de marcas/categorias ya no hacen miles de conteos exactos durante build.
- CI/CD instala dependencias opcionales nativas y usa `next build --webpack` para evitar fallos de `lightningcss`/Turbopack en Linux.

## Limitaciones honestas

- Los precios importados de VTEX son precios online/nacionales. No se deben presentar como precio exacto de cada sede fisica hasta conectar endpoints o fuentes que entreguen precio por ciudad/sucursal.
- D1, Ara, Jumbo, Makro, Farmatodo, Cruz Verde y La Rebaja todavia requieren conectores especificos. No se deben poblar con datos inventados.
- VTEX limita la paginacion publica directa a `_from <= 2500`; para crecer se debe seguir importando por categorias, busquedas y/o endpoints segmentados.
- Aun queda data sintetica historica en la base. La direccion correcta es ir reemplazandola por fuentes reales comercio por comercio.

## Proximo bloque recomendado

1. Importar mas terminos reales para Exito/Carulla/Olimpica por categoria.
2. Crear conectores especificos para Farmatodo y Cruz Verde.
3. Separar visualmente "precio online" de "precio por sede".
4. Ajustar busqueda por ciudad para mezclar precios por sucursal con precios online cuando no exista precio local.
5. Eliminar progresivamente productos sinteticos cuando exista cobertura real suficiente.
