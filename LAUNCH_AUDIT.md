# LAUNCH AUDIT — AhorroYa v0.1.0

> Auditoría integral pre-lanzamiento. Evaluación de 15 dimensiones críticas para determinar si la plataforma está lista para producción.

---

## 1. Arquitectura

| Campo | Valor |
|---|---|
| **Estado** | Mejorable |
| **Riesgo** | Alto |
| **Prioridad** | Alta |

**Justificación**
El proyecto tiene una estructura de monorepo bien organizada con 26 paquetes internos, pero la capa de datos es completamente ficticia: `CatalogService.js` (431 líneas) contiene toda la "base de datos" como arrays hardcodeados. Las rutas API (`/api/products`, `/api/stores`, `/api/promotions`, etc.) retornan datos mock. No existe integración real con Supabase desde la aplicación (solo el cliente `lib/supabase.js` está configurado). El archivo `proxy.ts` pretende ser middleware pero exporta una función llamada `proxy` en lugar de `middleware`, y aunque Next.js lo detecta como middleware (según el build), la validación de auth es superficial (solo verifica existencia del header `authorization`, nunca valida el token). Header y Footer no están en el root layout, requiriendo import manual en cada página.

**Acción recomendada**
- Conectar todas las rutas API a Supabase real
- Renombrar `proxy.ts` a `middleware.ts` con export `middleware` y validación de token real
- Mover Header/Footer al root `layout.js`
- Centralizar fetch de datos de navegación (categorías, tiendas, ciudades) en una fuente única

---

## 2. Seguridad

| Campo | Valor |
|---|---|
| **Estado** | Crítico |
| **Riesgo** | Crítico |
| **Prioridad** | Inmediata |

**Justificación**
- **VERCEL_OIDC_TOKEN** expuesto en `.env.local` (token JWT válido para despliegues)
- **Sin RLS en Supabase**: ninguna tabla tiene Row Level Security. La anon key (pública por diseño) permite acceso total a la base de datos
- **Sin autenticación** en `/api/favorites`, `/api/images/upload`, `/api/scrape`
- **CORS abierto**: `Access-Control-Allow-Origin: *` en todas las rutas
- **Password hardcodeada** en `docker-compose.yml`: `ahorroya_secret`
- **Subida de imágenes sin validación** de tipo, tamaño ni escaneo
- **Health endpoint** (`/api/health`) expone `process.memoryUsage()` y estado interno
- **CSP débil**: usa `'unsafe-inline'` y `'unsafe-eval'`

**Acción recomendada**
- Revocar VERCEL_OIDC_TOKEN inmediatamente y rotarlo
- Implementar RLS en todas las tablas de Supabase
- Agregar autenticación real a endpoints sensibles (favorites, images, scrape)
- Restringir CORS a orígenes conocidos
- Mover passwords a secrets de Vercel
- Agregar validación de archivos en upload
- Endurecer CSP eliminando unsafe-inline/eval (usar nonces)

---

## 3. Rendimiento

| Campo | Valor |
|---|---|
| **Estado** | Bueno |
| **Riesgo** | Medio |
| **Prioridad** | Media |

**Justificación**
Next.js 16 con Turbopack compila en ~11s. Las páginas estáticas (37 rutas) se generan en ~1.3s. El build de producción es limpio sin errores. Sin embargo, no hay métricas de Core Web Vitals en laboratorio. Las páginas dinámicas (`/producto/[id]`, `/buscar`) dependen de datos mock y no hay lazy-loading ni streaming. No se implementaron Server Actions ni Suspense boundaries. El bundle incluye framer-motion completo sin code-splitting por ruta. No hay caché de API responses ni CDN configuration explícita más allá de Vercel Edge Network.

**Acción recomendada**
- Implementar React Server Components donde sea posible
- Agregar streaming con Suspense boundaries para datos dinámicos
- Configurar ISR (Incremental Static Regeneration) para páginas de catálogo
- Implementar Route Segment caching
- Auditar bundle con `@next/bundle-analyzer`
- Agregar lazy-loading para componentes pesados (framer-motion)

---

## 4. SEO

| Campo | Valor |
|---|---|
| **Estado** | Bueno |
| **Riesgo** | Bajo |
| **Prioridad** | Baja |

**Justificación**
El SEO on-page es sólido: metadata completa en layout root con OG y Twitter cards, sitemap con 18 rutas estáticas + 63 dinámicas, robots.txt correcto, JSON-LD estructurado (Product, WebSite, BreadcrumbList, ItemList), heading hierarchy respetada en la mayoría de páginas, alt text en imágenes de producto. Debilidades: legales tienen `index: true` en metadata pero robots.txt bloquea `/legal/`; la página `/auth` carece de `generateMetadata`; la mayoría de páginas listado no tienen OG image custom; no hay hreflang tags; el sitemap usa slugs hardcodeados y `lastModified` estático.

**Acción recomendada**
- Desbloquear `/legal/` en robots.txt o cambiar metadata a `noindex`
- Agregar `generateMetadata` a `/auth`
- Generar OG images dinámicas por sección
- Agregar hreflang es-CO
- Generar sitemap dinámico desde la base de datos

---

## 5. Accesibilidad

| Campo | Valor |
|---|---|
| **Estado** | Mejorable |
| **Riesgo** | Medio |
| **Prioridad** | Media |

**Justificación**
Hay buenas prácticas: `aria-label` en botones e iconos, `role="dialog"` en modales, manejo de teclado (Escape para cerrar), soporte de prefers-reduced-motion, dark mode por defecto. Sin embargo, hay ausencias críticas: ninguna página usa `<main>` semántico (screen readers no pueden saltar al contenido principal), la navegación del header está en `<div>` en lugar de `<nav>`, los breadcrumbs no usan `aria-label="breadcrumb"`, el componente `search-input.tsx` tiene roles ARIA (combobox, option) sin atributos requeridos (`aria-controls`, `aria-expanded`, `aria-selected`), y la página de búsqueda salta de `h1` a `h3` (omite `h2`).

**Acción recomendada**
- Agregar `<main>` tag en todas las páginas
- Envolver navegación en `<nav>` con `aria-label`
- Corregir componentes ARIA incompletos en search-input.tsx
- Corregir jerarquía de headings en `/buscar`
- Agregar skip-to-content link
- Ejecutar auditoría con axe DevTools o WAVE

---

## 6. Escalabilidad

| Campo | Valor |
|---|---|
| **Estado** | Mejorable |
| **Riesgo** | Alto |
| **Prioridad** | Alta |

**Justificación**
La arquitectura actual no escala porque:
- Toda la data vive en memoria (arrays en `CatalogService.js`, favorites en un `Map`, eventos en un `Array`, search index en memoria)
- Al escalar a miles de productos/usuarios, el servidor colapsaría por falta de base de datos real
- No hay colas de procesamiento (scraping se ejecuta sincrónicamente en una API route)
- No hay caché distribuida (Redis definido en docker-compose pero no implementado en código)
- 26 paquetes internos sin pipeline de build — compilados on-the-fly por Next.js
- No hay separación entre reads y writes (CQRS)

**Acción recomendada**
- Migrar a Supabase como fuente de verdad
- Implementar worker queue para scraping (Bull + Redis o Vercel Queues)
- Agregar capa de caché (Redis o Vercel KV)
- Implementar build pipeline para paquetes internos
- Separar reads (públicas) de writes (autenticadas)

---

## 7. Calidad de Datos

| Campo | Valor |
|---|---|
| **Estado** | Mejorable |
| **Riesgo** | Alto |
| **Prioridad** | Alta |

**Justificación**
No hay datos reales en el sistema. Productos, precios, tiendas, ciudades son arrays hardcodeados en `services/catalog/CatalogService.js:88-270`. Los datos son inconsistentes: ej. "Arroz Diana Premium" aparece con precio 4200 en un mock y con otros valores en diferentes contextos. No hay validación de datos de entrada (los endpoints aceptan cualquier input sin sanitización). Analytics events almacenan datos arbitrarios sin schema. No hay proceso ETL definido. El scraping no está implementado realmente (el handler ejecuta `fetch` pero el código de cheerio/parsing está comentado).

**Acción recomendada**
- Implementar pipeline de scraping funcional con validación de datos
- Agregar schemas de validación (Zod o Joi) para todos los endpoints
- Definir procesos ETL para normalización de precios
- Agregar tests de integridad de datos
- Implementar deduplicación de productos (matching engine existente pero no conectado)

---

## 8. UX

| Campo | Valor |
|---|---|
| **Estado** | Bueno |
| **Riesgo** | Bajo |
| **Prioridad** | Baja |

**Justificación**
La experiencia de usuario es sólida: dark theme consistente, animaciones sutiles con framer-motion, responsive design, búsqueda con autosuggest, carrito de compras funcional, breadcrumbs en páginas internas, skeletons durante carga, estados vacíos con mensajes útiles, 404/500 premium con CTAs. Debilidades menores: la comparación de productos tiene botón "Comparar" sin `onClick` (dead UI en `ProductCardPremium.jsx`), el botón "Favoritos" no persiste entre sesiones (estado local), las redes sociales en footer son placeholders (`#`), y no hay onboarding para primer uso.

**Acción recomendada**
- Implementar funcionalidad real de comparación de productos
- Persistir favoritos en Supabase (sincronizar con store)
- Agregar onboarding/tour para nuevos usuarios
- Reemplazar placeholders de redes sociales con URLs reales

---

## 9. UI

| Campo | Valor |
|---|---|
| **Estado** | Excelente |
| **Riesgo** | Bajo |
| **Prioridad** | Baja |

**Justificación**
La interfaz visual es profesional y consistente: paleta zinc/emerald con dark mode como default, Tailwind v4 con diseño responsivo, tipografía limpia, espaciado coherente, iconografía con lucide-react, micro-interacciones (hover states, transiciones), glassmorphism en cards, gradient effects en headers, diseño mobile-first. El componente `JsonLd.jsx` demuestra atención al detalle técnico. Las páginas legales tienen formato de documento limpio. Los loading states, empty states y error boundaries tienen diseño cuidado.

**Acción recomendada**
- Mantener estándar actual
- Considerar agregar modo claro como opción (ya hay soporte de sistema)
- Agregar diseño para tablet como breakpoint intermedio

---

## 10. Código

| Campo | Valor |
|---|---|
| **Estado** | Bueno |
| **Riesgo** | Medio |
| **Prioridad** | Media |

**Justificación**
Código limpio en general con buenas prácticas: componentes funcionales, hooks correctos, Zustand para estado global, estructura de carpetas por feature, JSX legible. Sin embargo, hay inconsistencias: la app usa `.js` mientras los packages usan `.ts` (no hay TypeScript en la app principal), `jsconfig.json` solo define `@/*` alias, no hay tipos compartidos. El archivo `CatalogService.js` es un monolito de 431 líneas que mezcla datos, lógica y servicios. Hay código muerto (`MASTER_CATALOG`, variable `savings = 0` siempre). El `useEffect` y `useCallback` se importan pero apenas se usan en algunos componentes. El `key` prop en `ProductGrid.jsx` usa `product.id || i` (fallback a índice). No hay Prettier configurado.

**Acción recomendada**
- Migrar app principal a TypeScript
- Dividir CatalogService en módulos por dominio
- Eliminar código muerto identificado
- Configurar Prettier + husky + lint-staged
- Estandarizar tipos entre app y packages

---

## 11. Tests

| Campo | Valor |
|---|---|
| **Estado** | Mejorable |
| **Riesgo** | Alto |
| **Prioridad** | Alta |

**Justificación**
Cobertura general: **93.75% statements, 58.82% branches, 100% functions** (solo en packages). Sin embargo:
- Solo 16 tests en total (12 unit + 4 integration) para un proyecto con 26 paquetes y 30+ rutas
- Los 4 tests de integración fallan siempre (requieren servidor corriendo) — deberían ser saltables o usar mocks
- **Cobertura de app**: 0% — ningún test ejecuta componentes de React o pages
- No hay tests de componentes con React Testing Library
- No hay tests e2e funcionales (los archivos en `__tests__/e2e/` existen pero no se ejecutan)
- No hay tests de accesibilidad automatizados
- El test de `price-anomaly.ts` tiene branch coverage 0% (línea 6 sin probar)
- Los tests de integración no tienen setup/teardown adecuado

**Acción recomendada**
- Agregar tests de componentes con React Testing Library + Vitest
- Implementar tests e2e con Playwright
- Agregar coverage mínimo del 80% en app
- Corregir tests de integración para que usen mocks o tengan servidor de prueba
- Agregar CI pipeline que ejecute tests en cada PR

---

## 12. Infraestructura

| Campo | Valor |
|---|---|
| **Estado** | Bueno |
| **Riesgo** | Medio |
| **Prioridad** | Media |

**Justificación**
Despliegue configurado en Vercel con `vercel.json` correcto (framework nextjs, region iad1). Dockerfile multi-stage con Node 20 Alpine optimizado. docker-compose con Postgres 16 + Redis 7. `.nvmrc` en Node 20. Sin embargo: Redis está definido pero no se usa en la app. No hay configuración de CDN para assets estáticos. No hay `staging` environment definido. El Dockerfile copia `.env` implícitamente (podría exponer secrets en la imagen). No hay health checks en docker-compose. No hay estrategia de backups definida. No hay monitoreo de infraestructura.

**Acción recomendada**
- Crear environment de staging en Vercel
- Implementar CDN (Cloudflare o Vercel Edge) para assets
- Agregar health checks a servicios en docker-compose
- Configurar backups automáticos de base de datos
- Usar Docker secrets en lugar de env vars para datos sensibles
- Configurar Vercel Analytics para monitoreo

---

## 13. Observabilidad

| Campo | Valor |
|---|---|
| **Estado** | Crítico |
| **Riesgo** | Alto |
| **Prioridad** | Alta |

**Justificación**
No hay logging estructurado, no hay monitoreo de errores, no hay tracing, no hay métricas de negocio. El endpoint `/api/health` existe pero expone datos internos sin autenticación. Los errores en API routes caen en el handler por defecto de Next.js sin ser capturados. No hay integración con Sentry, Datadog, o cualquier servicio APM. No hay alertas configuradas. El paquete `@ahorroya/observability` existe pero no está importado ni implementado. No hay dashboard de métricas de negocio (usuarios activos, búsquedas, etc.).

**Acción recomendada**
- Integrar Sentry para error tracking
- Implementar logging estructurado (pino o winston)
- Configurar Vercel Analytics + Web Vitals
- Agregar dashboard de métricas de negocio en `/dashboard-ejecutivo`
- Configurar alertas para errores 500 y caídas de servicio

---

## 14. Costos Operativos

| Campo | Valor |
|---|---|
| **Estado** | Bueno |
| **Riesgo** | Bajo |
| **Prioridad** | Baja |

**Justificación**
El stack actual tiene costos predecibles y bajos: Vercel Pro (~$20/mes), Supabase Pro (~$25/mes), dominio (~$15/año). Sin dependencias de servicios costosos (no hay OpenAI, no hay mapas pagos, no hay CDN premium). Sin embargo, al escalar: Supabase cobra por row count y bandwidth, Vercel cobra por Edge Function execution y ancho de banda, y si se implementa scraping con workers, los costos de ejecución aumentarían. No hay estimación de costos a 6/12 meses con proyección de usuarios. El scraping actual (Axios + Cheerio) consume recursos del servidor web, no workers separados.

**Acción recomendada**
- Estimar costos con proyección a 100k/1M usuarios
- Evaluar early adopter program para validar tracción antes de escalar
- Implementar scraper como Vercel Cron Job o función serverless separada
- Monitorear costos de Supabase (especialmente ancho de banda de storage)

---

## 15. Riesgos

| Campo | Valor |
|---|---|
| **Estado** | Crítico |
| **Riesgo** | Crítico |
| **Prioridad** | Inmediata |

**Justificación**

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Exposición de datos por falta de RLS | Alta | Crítico | Implementar RLS antes del launch |
| Token VERCEL_OIDC_TOKEN comprometido | Alta | Alto | Revocar y rotar inmediatamente |
| Datos mock en producción | Alta | Crítico | Conectar Supabase antes del launch |
| Sin respaldo de BD | Alta | Alto | Configurar backups automáticos |
| Sin monitoreo de errores | Alta | Medio | Integrar Sentry antes del launch |
| Scraping bloqueado por retailers | Media | Alto | Implementar rotación de user-agents y proxies |
| Costos imprevistos de Supabase | Media | Medio | Estimar y monitorear |
| SEO penalizado por contenido duplicado | Baja | Medio | Usar canónicos y noindex en páginas finas |
| Sin pruebas de carga | Alta | Alto | Realizar load testing con k6 |
| Compliance legal (Habeas Data) | Baja | Alto | Ya hay páginas legales, falta proceso operativo |

**Acción recomendada**
- Crear risk register y asignar owners
- Implementar mitigaciones antes del launch
- Ejecutar load testing (k6 o Artillery)
- Obtener asesoría legal para cumplimiento Habeas Data

---

## Veredicto Final

| Dimensión | Estado | ¿Go/No-Go? |
|---|---|---|
| Arquitectura | Mejorable | 🟡 No-Go |
| Seguridad | Crítico | 🔴 No-Go |
| Rendimiento | Bueno | 🟢 Go condicional |
| SEO | Bueno | 🟢 Go |
| Accesibilidad | Mejorable | 🟡 No-Go |
| Escalabilidad | Mejorable | 🟡 No-Go |
| Calidad de Datos | Mejorable | 🟡 No-Go |
| UX | Bueno | 🟢 Go |
| UI | Excelente | 🟢 Go |
| Código | Bueno | 🟢 Go condicional |
| Tests | Mejorable | 🟡 No-Go |
| Infraestructura | Bueno | 🟢 Go condicional |
| Observabilidad | Crítico | 🔴 No-Go |
| Costos Operativos | Bueno | 🟢 Go |
| Riesgos | Crítico | 🔴 No-Go |

**🟢 Ready: 7/15**
**🟡 Conditional: 4/15**
**🔴 Blocking: 4/15**

### Conclusión

AhorroYa NO está listo para producción. Tiene 4 bloqueadores críticos (seguridad, observabilidad, riesgos, y 4 condicionales graves), pero su UI/UX y SEO son sólidos. Se recomienda un sprint de 2-3 semanas para resolver bloqueadores antes del launch.

Los ítems blocking inmediatos son:
1. 🔴 **Seguridad** — RLS + VERCEL_OIDC_TOKEN + autenticación en endpoints
2. 🔴 **Observabilidad** — Sentry + logging + alertas
3. 🔴 **Riesgos** — Risk register + load testing
4. 🟡 **Arquitectura** — Conectar datos reales + middleware funcional
5. 🟡 **Tests** — Cobertura mínima en app + tests de integración
6. 🟡 **Escalabilidad** — Caché + worker queue
7. 🟡 **Calidad de Datos** — Pipeline de scraping + validación
