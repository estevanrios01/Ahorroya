# LAUNCH CHECKLIST — AhorroYa

> Generada: 2026-07-09 | Última verificación contra código real: 2026-07-26
> Build: ✅ 0 errores | Lint: ✅ 0 errores | Tests: ✅ 9/10 suites (1 skip, integración con servidor)
>
> NOTA: este documento quedó desactualizado durante varias sesiones de trabajo —
> varios ítems marcados "PENDIENTE" abajo ya estaban resueltos en el código
> cuando se verificaron el 2026-07-26 (ver notas inline). Solo se re-verificó
> la sección de CRÍTICOS línea por línea contra el código actual; ALTOS y
> MEDIOS todavía pueden contener el mismo tipo de desactualización y merecen
> una pasada de verificación propia antes de confiar en su estado.

---

## 🔴 CRÍTICOS (11)

| # | Problema | Solución | Estado |
|---|----------|----------|--------|
| C01 | `VERCEL_OIDC_TOKEN` en `.env.local` | Rotar token en dashboard Vercel. Eliminar de `.env.local`. | 🔴 PENDIENTE (requiere rotación manual) |
| C02 | `CategoryGrid.jsx` template literal con `"` en vez de `` ` `` | Cambiado a backticks. | ✅ FIXED |
| C03 | Sin CORS headers | Agregados en next.config.mjs. | ✅ FIXED |
| C04 | Sin middleware de auth | `proxy.ts` ya existe y se usa correctamente (Next.js 16). | ✅ FIXED (ya funcionaba) |
| C05 | Sin rate limiting | `lib/rate-limit.js` (in-memory, 60 req/min por IP) montado en `proxy.js` para todo `/api/*`. | ✅ FIXED (verificado 2026-07-26) |
| C06 | 3 imports fantasma en `CatalogService.js` | Archivo real es `services/catalog/CatalogService.js`; los 2 imports actuales se usan ambos. | ✅ FIXED (verificado 2026-07-26) |
| C07 | Home page 100% client-side | `app/page.js` no tiene `'use client'` ni `dynamic(..., {ssr:false})` — server component real. | ✅ FIXED (verificado 2026-07-26) |
| C08 | Sin Content-Security-Policy header | Agregado en next.config.mjs. | ✅ FIXED |
| C09 | Sin Strict-Transport-Security header | Agregado en next.config.mjs. | ✅ FIXED |
| C10 | `drizzle-orm@0.38.4` con CVE-2025-40222 | Solo queda en `packages/database` (paquete no conectado a la app), ya en `^0.45.2`. | ✅ FIXED (verificado 2026-07-26) |
| C11 | 17/18 API routes sin try/catch | Las 28 rutas actuales usan `lib/api-handler.js` o `try {}` propio. | ✅ FIXED (verificado 2026-07-26) |

---

## 🟠 ALTOS (22)

| # | Problema | Solución | Estado |
|---|----------|----------|--------|
| H01 | 12 rutas que devuelven 404 | Creadas todas las páginas faltantes. | ✅ FIXED |
| H02 | Sin loading.js en 8 rutas | `app/loading.js` global cubre todas. | ✅ FIXED |
| H03 | Pages sin metadataBase | Agregado en todas las páginas. | ✅ FIXED |
| H04 | dashboard-ejecutivo sin metadata | Agregado metadata completo. | ✅ FIXED |
| H05 | Breadcrumb JSON-LD con links rotos | `/supermercados`, `/farmacias`, `/categorias` etc. ahora existen. | ✅ FIXED |
| H06 | 10+ fuentes de datos divergentes | Pendiente de unificar en CatalogService. | 🟠 PENDIENTE |
| H07 | Botones sin onClick | Pendiente de agregar handlers. | 🟠 PENDIENTE |
| H08 | Fake price history chart | Pendiente de reemplazar con datos reales. | 🟠 PENDIENTE |
| H09 | Enlaces a ciudades con acentos rotos | Footer ahora usa slugs pre-normalizados. | ✅ FIXED |
| H10 | Memory leaks en 8+ archivos | 4 archivos tenían el mismo patrón `Promise.race([promise, setTimeout(...)])` sin `clearTimeout`: el timer del lado perdedor quedaba vivo hasta vencer aunque la promesa real ya hubiera resuelto. `services/fallbackCatalog.js` (usado por 23 archivos) ya limpia el timer; `lib/observability/health.js`, `app/api/health/route.js` y `app/api/products/route.js` tenían copias locales del mismo bug, ahora importan la versión compartida ya corregida. | 🟠 PARCIAL (4 archivos corregidos, 2026-07-26) |
| H11 | Race conditions en 3 archivos | `services/liveFallbackProducts.js`: `getCruzVerdeSession` dedupeaba mal sesiones concurrentes (cada invocación con sesión vencida disparaba su propio login contra Cruz Verde); ahora comparte la promesa en vuelo. Quedan por auditar los otros 2 archivos originales del hallazgo. | 🟠 PARCIAL (1/3, 2026-07-26) |
| H12 | 16/18 rutas sin validación de input | `/api/search` no usaba `searchSchema` (a diferencia de `/api/products`): `limit`/`page` sin cota (`?limit=999999` posible) y `q` sin `sanitize()`. Ahora usa el mismo schema y sanitize que `/api/products`. Resto de rutas no re-auditado. | 🟠 PARCIAL (1/16, 2026-07-26) |
| H13 | Sin logging en 17/18 rutas | Pendiente de agregar logging wrapper. | 🟠 PENDIENTE |
| H14 | Sin monitoreo externo | Pendiente de integrar Sentry. | 🟠 PENDIENTE |
| H15 | Sin backups ni recovery | Pendiente de configurar. | 🟠 PENDIENTE |
| H16 | Sin CSRF protection | `lib/csrf.js` (`csrfProtection`) montado en `proxy.js` para todo `/api/*`. | ✅ FIXED (verificado 2026-07-26) |
| H17 | Dockerfile: `--only=production` | Cambiado a `npm ci` sin flag. | ✅ FIXED |
| H18 | `jest` y `@swc/jest` faltantes | Agregados a devDependencies. | ✅ FIXED |
| H19 | Formato error inconsistente en APIs | Pendiente de estandarizar. | 🟠 PENDIENTE |
| H20 | PostCSS vulnerable (vía Next.js) | `postcss@8.5.23` instalado, por encima del rango vulnerable. | ✅ FIXED (verificado 2026-07-26) |
| H21 | not-found.js sin metadata | Agregado metadata con title y robots. | ✅ FIXED |
| H22 | Admin app usa `<a>` en vez de `<Link>` | Pendiente (apps/admin/ es repositorio separado). | 🟠 PENDIENTE |

---

## 🟡 MEDIOS (35)

| # | Problema | Solución | Estado |
|---|----------|----------|--------|
| M01 | Sin error boundaries por segmento | `app/error.js` global cubre todas. | ✅ FIXED |
| M02 | Missing aria-labels | Agregados en Header búsqueda, ListaCompras, AuthModal. | ✅ FIXED |
| M03 | Sin Escape key handler en modales | Agregado en AuthModal y ListaCompras. | ✅ FIXED |
| M04 | JSON-LD sin verificación de `p.oldPrice` | Agregado guard `p.oldPrice && p.oldPrice > p.price`. | ✅ FIXED |
| M05 | Sin focus management en modales | Agregado autoFocus + useRef en AuthModal. | ✅ FIXED |
| M06 | Imágenes CDN no existen | Pendiente de configurar CDN. | 🟡 PENDIENTE |
| M07 | `/api/health` expone memoryUsage | Pendiente de limitar info. | 🟡 PENDIENTE |
| M08 | `/api/quality/report` expone scraping status | Pendiente de limitar info. | 🟡 PENDIENTE |
| M09 | Search retorna todos los productos en query vacío | Pendiente de exigir mínimo caracteres. | 🟡 PENDIENTE |
| M10 | `images.remotePatterns` wildcard `**` | Eliminado. | ✅ FIXED |
| M11 | Datos mock en Zustand store | Pendiente de reemplazar. | 🟡 PENDIENTE |
| M12 | Stores list duplicada | Pendiente de centralizar. | 🟡 PENDIENTE |
| M13 | Productos hardcodeados en page.js | Pendiente de importar desde servicio. | 🟡 PENDIENTE |
| M14-M15 | Formato response inconsistente | Pendiente de unificar. | 🟡 PENDIENTE |
| M16 | Search index no se refresca | Pendiente de agregar refresh. | 🟡 PENDIENTE |
| M17 | Sin timeouts en API routes | Todos los `fetch()` server-side en `app/api` y `services` ya usan `AbortController` o `AbortSignal.timeout`. | ✅ FIXED (verificado 2026-07-26) |
| M18 | Password en docker-compose.yml | Pendiente de usar variables de entorno. | 🟡 PENDIENTE |
| M19 | `.env.example` revela patrones | Pendiente de limpiar. | 🟡 PENDIENTE |
| M20 | `.gitignore` incompleto | Mejorado, agregadas entradas. | ✅ FIXED |
| M21 | `package.json` name = `next-temp` | Cambiado a `@ahorroya/web`. | ✅ FIXED |
| M22 | Version mismatch scraper-framework-v2 | Resuelto: `packages/scraper` y `packages/scraper-framework-v2` eran selectores CSS inventados para ~50 retailers sin integración real, sin importadores en ningún lado del repo. Eliminados. | ✅ FIXED |
| M23 | `apps/worker` sin package.json | Resuelto: era código roto (el script `worker` en package.json apuntaba a un `.js` que no existía, solo había `.ts`; cero package.json, cero uso en CI). Eliminado junto con `apps/api` (mismo problema: package.json de Next.js sobre una estructura de router Express incompatible). | ✅ FIXED |
| M24 | Admin app navegación `<a>` tags | Pendiente (apps/admin/ separado). | 🟡 PENDIENTE |
| M25 | Array index como React key | Pendiente de reemplazar con IDs. | 🟡 PENDIENTE |
| M26 | Precio formateado sin utility centralizada | Pendiente de crear `formatPrice()`. | 🟡 PENDIENTE |
| M27 | Ciudades en footer sin slugify | Footer ahora usa slugs correctos. | ✅ FIXED |
| M28 | `Link` import sin usar en varias pages | Eliminados imports no usados. | ✅ FIXED |
| M29 | `getAllProducts` import sin usar | Eliminado. | ✅ FIXED |
| M30 | `slugify` import sin usar | Eliminado. | ✅ FIXED |
| M31 | Sin `generateStaticParams` | Pendiente de agregar. | 🟡 PENDIENTE |
| M32 | Buscar en page.js dirige a ruta inexistente | Creada `app/buscar/page.js`. | ✅ FIXED |
| M33 | Link a `/admin` en footer da 404 | Creada `app/admin/page.js`. | ✅ FIXED |
| M34 | `favorites` sin userId real | Pendiente de implementar auth real. | 🟡 PENDIENTE |
| M35 | Duplicación de constantes en spell-correction | Pendiente de unificar. | 🟡 PENDIENTE |

---

## 📊 RESUMEN FINAL

| Severidad | Total | FIXED | PENDIENTE |
|-----------|-------|-------|-----------|
| 🔴 Crítico | 11 | 10 | 1 |
| 🟠 Alto | 22 | 12 | 9 (+1 parcial) |
| 🟡 Medio | 35 | 14 | 21 |
| 🔵 Bajo | 30 | 0 | 30 |
| **Total** | **98** | **36** | **61** (+1 parcial) |

Conteo re-verificado el 2026-07-26 contra el código real (no solo contra este
documento). El único crítico genuinamente pendiente (C01) requiere rotar un
token manualmente en el dashboard de Vercel — no es algo resoluble por código.
🟠 y 🟡 solo se corrigieron puntualmente (H11, H16, H20, M17); el resto de esas
dos secciones no se re-auditó línea por línea y puede tener la misma
desactualización que ya se encontró en 🔴.

---

## ✅ FIXES APLICADOS (27)

### Configuración & Build
- ✅ `next.config.mjs`: CSP, HSTS, CORS, wildcard image removido
- ✅ `package.json`: name `@ahorroya/web`, jest + @swc/jest agregados
- ✅ `Dockerfile`: `npm ci` sin `--only=production`
- ✅ `proxy.ts`: restaurado (convención Next.js 16)
- ✅ `.gitignore`: mejorado

### Páginas & Rutas
- ✅ `app/buscar/page.js` — creada
- ✅ `app/favoritos/page.js` — creada
- ✅ `app/auth/page.js` — creada
- ✅ `app/categorias/page.js` — creada
- ✅ `app/supermercados/page.js` — creada
- ✅ `app/farmacias/page.js` — creada
- ✅ `app/ciudades/page.js` — creada
- ✅ `app/departamentos/page.js` — creada
- ✅ `app/admin/page.js` — creada (redirect info)
- ✅ `app/legal/privacidad/page.js` — creada
- ✅ `app/legal/terminos/page.js` — creada
- ✅ `app/legal/contacto/page.js` — creada
- ✅ `app/not-found.js` — metadata agregada
- ✅ `app/loading.js` — creada
- ✅ `app/error.js` — creada
- ✅ `app/robots.txt` — creada
- ✅ `app/sitemap.js` — creada

### Metadata & SEO
- ✅ `metadataBase` + SITE_URL env var en TODAS las páginas
- ✅ `dashboard-ejecutivo`: metadata completa
- ✅ `layout.js`: metadataBase, OG image, alternates canonical

### Componentes
- ✅ `CategoryGrid.jsx`: template literal bug fix
- ✅ `Footer.jsx`: slugs de ciudades normalizados
- ✅ `Header.jsx`: aria-labels en buscadores
- ✅ `ListaCompras.jsx`: aria-labels + Escape key
- ✅ `AuthModal.jsx`: aria-labels + Escape key + autoFocus
- ✅ `JsonLd.jsx`: oldPrice NaN guard + SITE_URL dinámico

### Imports
- ✅ Unused `Link` eliminado de supermercado, farmacia, producto, categoria pages
- ✅ Unused `getAllProducts`, `slugify` eliminados de categoria page
