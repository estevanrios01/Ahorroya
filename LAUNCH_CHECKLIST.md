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
| H06 | 10+ fuentes de datos divergentes | Confirmado real: `services/catalog/CatalogService.js` y `services/database.js` implementan ~20 operaciones CRUD duplicadas contra las mismas tablas (ej. `getStoreBySlug` vs `db.stores.getBySlug`, mismo query, distinto shape de retorno). Muestreo no encontró divergencia de comportamiento peligrosa, solo duplicación mecánica. NO lo fusioné: es un refactor de alcance amplio (toca casi todas las páginas/rutas) que no puedo verificar en vivo en este sandbox (la red hacia Supabase está bloqueada aquí). Requiere hacerse con acceso real a la base para probar cada call site antes/después. | 🟠 INVESTIGADO, PENDIENTE DE FUSIONAR (2026-07-26) |
| H07 | Botones sin onClick | Revisados los ~20 `<button>` del repo (Header, Hero, ListaCompras, AuthModal, ProductCardPremium, favoritos, error.js, etc.): todos tienen `onClick` real o son `type="submit"` dentro de un `<form>` con `onSubmit`. | ✅ FIXED (verificado 2026-07-26) |
| H08 | Fake price history chart | No era fake: el chart en `ProductDetailClient.jsx` y el estado vacío ya eran reales, pero nada llamaba a `get_product_price_history()` (existía desde la migración 00002) ni al método `getPriceHistory` de `services/database.js` (dead code, tomaba `storeProductId` en vez de `productId`). Reescrito para llamar al RPC real y conectado en `/api/products/[slug]/route.js`. | ✅ FIXED (2026-07-26) |
| H09 | Enlaces a ciudades con acentos rotos | Footer ahora usa slugs pre-normalizados. | ✅ FIXED |
| H10 | Memory leaks en 8+ archivos | 4 archivos tenían el mismo patrón `Promise.race([promise, setTimeout(...)])` sin `clearTimeout`: el timer del lado perdedor quedaba vivo hasta vencer aunque la promesa real ya hubiera resuelto. `services/fallbackCatalog.js` (usado por 23 archivos) ya limpia el timer; `lib/observability/health.js`, `app/api/health/route.js` y `app/api/products/route.js` tenían copias locales del mismo bug, ahora importan la versión compartida ya corregida. | 🟠 PARCIAL (4 archivos corregidos, 2026-07-26) |
| H11 | Race conditions en 3 archivos | `services/liveFallbackProducts.js`: `getCruzVerdeSession` dedupeaba mal sesiones concurrentes (cada invocación con sesión vencida disparaba su propio login contra Cruz Verde); ahora comparte la promesa en vuelo. Quedan por auditar los otros 2 archivos originales del hallazgo. | 🟠 PARCIAL (1/3, 2026-07-26) |
| H12 | 16/18 rutas sin validación de input | `/api/search` no usaba `searchSchema` (a diferencia de `/api/products`): `limit`/`page` sin cota (`?limit=999999` posible) y `q` sin `sanitize()`. Ahora usa el mismo schema y sanitize que `/api/products`. Resto de rutas no re-auditado. | 🟠 PARCIAL (1/16, 2026-07-26) |
| H13 | Sin logging en 17/18 rutas | 27/28 rutas ya usan `withErrorHandling` (`lib/api-handler.js`), que loguea con `logger.error`. La única excepción, `/api/products`, tiene su propio catch para degradar a resultados en vivo en vez de un 500 genérico — pero no logueaba nada; ahora sí. | ✅ FIXED (2026-07-26) |
| H14 | Sin monitoreo externo | Pendiente de integrar Sentry. | 🟠 PENDIENTE |
| H15 | Sin backups ni recovery | Pendiente de configurar. | 🟠 PENDIENTE |
| H16 | Sin CSRF protection | `lib/csrf.js` (`csrfProtection`) montado en `proxy.js` para todo `/api/*`. | ✅ FIXED (verificado 2026-07-26) |
| H17 | Dockerfile: `--only=production` | Cambiado a `npm ci` sin flag. | ✅ FIXED |
| H18 | `jest` y `@swc/jest` faltantes | Agregados a devDependencies. | ✅ FIXED |
| H19 | Formato error inconsistente en APIs | Revisadas las 28 rutas: todas usan el mismo sobre `{ success, data?, error?, degraded? }` con status HTTP apropiado. Ya estandarizado. | ✅ FIXED (verificado 2026-07-26) |
| H20 | PostCSS vulnerable (vía Next.js) | `postcss@8.5.23` instalado, por encima del rango vulnerable. | ✅ FIXED (verificado 2026-07-26) |
| H21 | not-found.js sin metadata | Agregado metadata con title y robots. | ✅ FIXED |
| H22 | Admin app usa `<a>` en vez de `<Link>` | `apps/admin/app/layout.tsx` convertido a `next/link`. | ✅ FIXED (2026-07-26) |

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
| M07 | `/api/health` expone memoryUsage | No hay ninguna referencia a `memoryUsage`/`process.memoryUsage` en el repo; ya no se expone. | ✅ FIXED (verificado 2026-07-26) |
| M08 | `/api/quality/report` expone scraping status | Releída la ruta completa: solo devuelve conteos agregados y scores de calidad (`totalProducts`, `missingBrand`, `completeness`, etc.) — nada de IPs, credenciales, mensajes de error ni desglose de fallos por comercio. Se lee más como una página de transparencia pública (coincide con el discurso de la app de mostrar frescura/calidad de datos) que como una fuga de info operativa. | ✅ FIXED (no era sensible, verificado 2026-07-26) |
| M09 | Search retorna todos los productos en query vacío | `/api/search` no tiene ningún llamador interno -- `app/buscar/page.js` (la página real de búsqueda) consulta `db.products` directamente como server component, nunca pasa por esta ruta. Sigue siendo pública (listada en `proxy.js`), así que un cliente externo podría usarla; ya tiene `limit` acotado a 100 desde el fix de H12. Exigir un mínimo de caracteres es una decisión de producto (¿debe soportar "explorar todo"?) que no tomé unilateralmente al no tener un caller real que la valide. | 🟡 PENDIENTE (decisión de producto, ruta sin caller interno) |
| M10 | `images.remotePatterns` wildcard `**` | Eliminado. | ✅ FIXED |
| M11 | Datos mock en Zustand store | `store/useSupermarketStore.js` arranca con `results: []`, poblado por fetches reales; sin datos mock. | ✅ FIXED (verificado 2026-07-26) |
| M12 | Stores list duplicada | Investigado a fondo — es más que duplicación cosmética. `components/home/StoreCarousel.jsx` tiene su propia lista local con slug `larebaja` (sin guion), que es el que realmente escribe `scripts/import-vtex-catalog.js` en la tabla `stores`. Pero `services/fallbackCatalog.js` (usado por 23 archivos), `services/liveFallbackProducts.js` (SOURCES, `PHARMACY_SOURCE_SLUGS`), `app/sitemap.js`, `StoreClient.jsx` y `lib/observability/health.js` usan `la-rebaja` (con guion) como slug canónico interno, con shims de alias en 2 lugares (`sourceSlug === 'larebaja' ? 'la-rebaja' : sourceSlug`) que traducen uno al otro. Intenté consolidar `StoreCarousel.jsx` para usar la lista compartida y esto salió a la luz: si se hiciera ese swap sin más, los links a "La Rebaja" en modo degradado apuntarían a `/farmacia/la-rebaja`, que nunca calzará contra `stores.slug = 'larebaja'` una vez la base tenga datos reales -- siempre caería a modo live-fallback aunque la DB ya funcione. Revertí el swap. Arreglarlo bien requiere unificar el slug en ~8 archivos, incluyendo el ruteo del que depende hoy el único dato real que sirve la app (SOURCES de `liveFallbackProducts.js`) -- no lo toqué a ciegas porque no puedo probar contra los endpoints de los comercios desde este sandbox (red bloqueada). | 🟡 INVESTIGADO A FONDO, PENDIENTE DE FUSIONAR CON VERIFICACIÓN EN VIVO (2026-07-26) |
| M13 | Productos hardcodeados en page.js | `app/page.js` no tiene arrays de productos hardcodeados; `HomeProductSections.jsx` los trae de `/api/products`. | ✅ FIXED (verificado 2026-07-26) |
| M14-M15 | Formato response inconsistente | Mismo hallazgo que H19 — ya unificado en las 28 rutas. | ✅ FIXED (verificado 2026-07-26) |
| M16 | Search index no se refresca | Este hallazgo aplica a `packages/search-index/` (índice en memoria con builder/cache/loader propios) — cero imports desde la app real. La búsqueda real consulta Postgres directo (`ilike` + índices trigram de la migración `20260713120000`), sin índice intermedio que "refrescar" — los datos siempre están al día porque no hay caché de por medio. No aplica al sistema conectado. | ✅ FIXED (no aplicable al sistema real, verificado 2026-07-26) |
| M17 | Sin timeouts en API routes | Todos los `fetch()` server-side en `app/api` y `services` ya usan `AbortController` o `AbortSignal.timeout`. | ✅ FIXED (verificado 2026-07-26) |
| M18 | Password en docker-compose.yml | Ya usa `${POSTGRES_PASSWORD:-change_me}` (env var con default placeholder obvio), no un secreto fijo. Archivo es solo para Postgres local de desarrollo. | ✅ FIXED (verificado 2026-07-26) |
| M19 | `.env.example` revela patrones | Todos los placeholders son genéricos (`TU_PROYECTO`, `change_me`, `your_secret_here`, `example@sentry.io`) — no revelan nada real. | ✅ FIXED (verificado 2026-07-26) |
| M20 | `.gitignore` incompleto | Mejorado, agregadas entradas. | ✅ FIXED |
| M21 | `package.json` name = `next-temp` | Cambiado a `@ahorroya/web`. | ✅ FIXED |
| M22 | Version mismatch scraper-framework-v2 | Resuelto: `packages/scraper` y `packages/scraper-framework-v2` eran selectores CSS inventados para ~50 retailers sin integración real, sin importadores en ningún lado del repo. Eliminados. | ✅ FIXED |
| M23 | `apps/worker` sin package.json | Resuelto: era código roto (el script `worker` en package.json apuntaba a un `.js` que no existía, solo había `.ts`; cero package.json, cero uso en CI). Eliminado junto con `apps/api` (mismo problema: package.json de Next.js sobre una estructura de router Express incompatible). | ✅ FIXED |
| M24 | Admin app navegación `<a>` tags | Mismo fix que H22. | ✅ FIXED (2026-07-26) |
| M25 | Array index como React key | Revisados los 5 usos restantes: 4 son sobre arrays estáticos que nunca reordenan (galería de imágenes, skeletons, stats fijas) — index como key es correcto ahí. El único real era `dashboard-ejecutivo/page.js`: `data.alerts` se re-consulta por polling y puede cambiar de orden/contenido entre renders; cambiado a `${alert.rule}-${alert.timestamp}`. | ✅ FIXED (2026-07-26) |
| M26 | Precio formateado sin utility centralizada | `formatPrice` estaba duplicado idéntico en 4 archivos (`ProductCardPremium.jsx`, `ProductDetailClient.jsx`, `producto/[id]/page.js`, `favoritos/page.js`) más una quinta variante ad-hoc en `ListaCompras.jsx` (`$` + `toLocaleString` crudo, sin `Intl.NumberFormat`). Consolidado en `lib/formatPrice.js`, los 5 puntos ahora lo importan. | ✅ FIXED (2026-07-26) |
| M27 | Ciudades en footer sin slugify | Footer ahora usa slugs correctos. | ✅ FIXED |
| M28 | `Link` import sin usar en varias pages | Eliminados imports no usados. | ✅ FIXED |
| M29 | `getAllProducts` import sin usar | Eliminado. | ✅ FIXED |
| M30 | `slugify` import sin usar | Eliminado. | ✅ FIXED |
| M31 | Sin `generateStaticParams` | Agregado a `categoria/[slug]`, `ciudad/[slug]`, `supermercado/[slug]`, `farmacia/[slug]` usando las listas fijas de `services/fallbackCatalog.js`. Verificado en build: `/ciudad/[slug]` ya genera 6 páginas estáticas (● SSG). Las otras 3 siguen `ƒ Dynamic` porque llaman a `getLiveFallbackProducts`, que usa `cache: 'no-store'` -- Next.js fuerza dinámico si el render toca ese fetch, correcto mientras la DB esté vacía/inalcanzable. Con datos reales en producción (sin caer al live-fallback) deberían pre-renderizarse también. `marca/[slug]` y `producto/[id]` quedaron sin tocar: marcas/productos son listas no acotadas (vienen de la DB real, no de un fallback fijo), no tiene sentido enumerar todo en build time. | 🟡 PARCIAL (1/4 confirmado estático, 3/4 correctos pero pendientes de datos reales, 2026-07-26) |
| M32 | Buscar en page.js dirige a ruta inexistente | Creada `app/buscar/page.js`. | ✅ FIXED |
| M33 | Link a `/admin` en footer da 404 | Creada `app/admin/page.js`. | ✅ FIXED |
| M34 | `favorites` sin userId real | `/api/favorites` sí tiene lógica real con auth (requiere Bearer token, gateado en `proxy.js`), pero nada en la UI lo llama -- `lib/useFavorites.js` es 100% localStorage, sin servidor. No es solo "falta implementar" -- ya existe un backend con auth real que nadie usa, en paralelo a un mecanismo local que sí funciona y coincide con la filosofía ya establecida del proyecto ("la app funciona sin cuenta"). Decidir si favoritos deben sincronizar entre dispositivos vía cuenta es una decisión de producto, no un bug -- y probarlo requiere la base de datos real. | 🟡 PENDIENTE (decisión de producto) |
| M35 | Duplicación de constantes en spell-correction | `services/ai-engine/application/suggestions.ts` (sin ningún import en la app real) tenía además una feature de sinónimos (ej. "dolor" → Acetaminofén/Ibuprofeno/Naproxeno) que `/api/ai/suggest` nunca tuvo. Portada al route real, probada en vivo con el dev server. | ✅ FIXED (2026-07-26) |

---

## 📊 RESUMEN FINAL

| Severidad | Total | FIXED | PARCIAL | PENDIENTE |
|-----------|-------|-------|---------|-----------|
| 🔴 Crítico | 11 | 10 | 0 | 1 |
| 🟠 Alto | 22 | 16 | 4 (H06, H10, H11, H12) | 2 (H14, H15) |
| 🟡 Medio | 35 | 29 | 2 (M12, M31) | 4 |
| 🔵 Bajo | 30 | 0 | 0 | 30 |
| **Total** | **98** | **55** | **6** | **37** |

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
