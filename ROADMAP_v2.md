# ROADMAP v2 — AhorroYa

> Hoja de ruta post-lanzamiento. Sin nuevas funcionalidades hasta resolver blockers. Enfocado en convertir AhorroYa en el líder colombiano de comparación de precios.

---

## Fase 0: Bloqueadores Críticos (Días 1-7)

| # | Tarea | Prioridad | Impacto |
|---|---|---|---|
| 0.1 | Revocar VERCEL_OIDC_TOKEN y rotar secrets | 🔴 Crítica | Seguridad |
| 0.2 | Implementar RLS en todas las tablas Supabase | 🔴 Crítica | Seguridad |
| 0.3 | Agregar autenticación real a endpoints sensibles (favorites, images, scrape) | 🔴 Crítica | Seguridad |
| 0.4 | Restringir CORS a orígenes conocidos | 🔴 Crítica | Seguridad |
| 0.5 | Integrar Sentry para error tracking | 🔴 Crítica | Observabilidad |
| 0.6 | Conectar rutas API a Supabase (reemplazar datos mock) | 🔴 Crítica | Arquitectura |
| 0.7 | Implementar middleware funcional (auth real) | 🔴 Crítica | Seguridad |
| 0.8 | Agregar `<main>` a todas las páginas y corregir ARIA | 🟡 Alta | Accesibilidad |
| 0.9 | Corregir tests de integración (mocks vs servidor) | 🟡 Alta | Tests |

---

## 30 Días (Días 8-30)

### Seguridad & Infraestructura

| # | Tarea | Detalle |
|---|---|---|
| 1.1 | Implementar rate limiting en API routes | Usar Vercel KV o middleware con sliding window |
| 1.2 | Agregar validación de input (Zod) en todos los endpoints | Schemas compartidos en `@ahorroya/types` |
| 1.3 | Endurecer CSP con nonces | Eliminar `unsafe-inline`/`unsafe-eval` |
| 1.4 | Configurar backups automáticos de Supabase | Pg_dump diario + point-in-time recovery |
| 1.5 | Implementar autenticación OAuth (Google, Apple) | Además de email/password actual |
| 1.6 | Agregar validación de archivos en `/api/images/upload` | Tipo MIME, tamaño máximo, scan |

### Datos & Scraping

| # | Tarea | Detalle |
|---|---|---|
| 1.7 | Implementar scraper funcional con cheerio | Conectar a retailers reales (Éxito, D1, Jumbo, Olímpica, Ara, Cruz Verde) |
| 1.8 | Crear worker queue para scraping | Bull + Redis o Vercel Queues |
| 1.9 | Pipeline ETL de normalización de precios | Usar `@ahorroya/normalization-engine` + `@ahorroya/matching-engine` |
| 1.10 | Poblar Supabase con datos reales | Mínimo 10,000 productos, 200 stores, 20 ciudades |
| 1.11 | Implementar deduplicación de productos | Usar matching engine existente |

### Testing

| # | Tarea | Detalle |
|---|---|---|
| 1.12 | Agregar React Testing Library + Vitest | Tests de componentes core (ProductCard, Header, Search) |
| 1.13 | Implementar tests e2e con Playwright | 5 flujos críticos (búsqueda, producto, favoritos, auth, legal) |
| 1.14 | Agregar CI pipeline (GitHub Actions) | `npm test` + `npm run lint` + `npm run build` en cada PR |
| 1.15 | Alcanzar 60% coverage mínimo en app | |

### SEO & Performance

| # | Tarea | Detalle |
|---|---|---|
| 1.16 | Generar sitemap dinámico desde Supabase | `lastModified` real por contenido |
| 1.17 | Agregar OG images dinámicas por página | @vercel/og para generación server-side |
| 1.18 | Implementar ISR en páginas de catálogo | revalidate cada 6h para productos/precios |
| 1.19 | Auditar Core Web Vitals | Lighthouse CI + Vercel Analytics |

### Observabilidad

| # | Tarea | Detalle |
|---|---|---|
| 1.20 | Implementar logging estructurado | Pino con request IDs |
| 1.21 | Dashboard de métricas de negocio en `/dashboard-ejecutivo` | Usuarios activos, búsquedas, productos trackeados |
| 1.22 | Configurar alertas | PagerDuty o Slack webhook para errores 500 |

---

## 90 Días (Meses 2-3)

### Escalabilidad & Arquitectura

| # | Tarea | Detalle |
|---|---|---|
| 2.1 | Migrar app a TypeScript | strict mode, tipos compartidos desde `@ahorroya/types` |
| 2.2 | Implementar caché distribuida | Vercel KV (Redis) para sesiones, catálogo, búsqueda |
| 2.3 | Separar reads de writes (CQRS pattern) | API pública para consultas, API autenticada para mutaciones |
| 2.4 | Implementar Server Actions para forms | Contacto, reporte de precios |
| 2.5 | Build pipeline para paquetes internos | Turbo repo o Nx para compilar paquetes |
| 2.6 | Configurar CDN para assets | Cloudflare o Vercel Edge para imágenes de producto |

### Producto

| # | Tarea | Detalle |
|---|---|---|
| 2.7 | Implementar comparación real de productos | Side-by-side de precios entre stores |
| 2.8 | Persistir favoritos en Supabase con autenticación | Sincronización cross-device |
| 2.9 | Histórico de precios con gráficos | Usar `@ahorroya/pricing-engine` + recharts |
| 2.10 | Alertas de precio (cuando baja de X) | Push notification + email |
| 2.11 | Lista de compras compartida | Links para compartir entre usuarios |

### Experiencia de Usuario

| # | Tarea | Detalle |
|---|---|---|
| 2.12 | Onboarding para nuevos usuarios | Tour interactivo de 3 pasos |
| 2.13 | Modo claro (alternativa al dark) | Basado en preferencia del sistema |
| 2.14 | Búsqueda por código de barras funcional | Cámara + API de barcode lookup |
| 2.15 | Filtros avanzados en búsqueda | Por rango de precio, marca, tienda, descuento |
| 2.16 | Mapa de tiendas cercanas | Leaflet + OpenStreetMap (gratuito) |

### Operaciones

| # | Tarea | Detalle |
|---|---|---|
| 2.17 | Scraping programado cada 6h | Vercel Cron Job + workers |
| 2.18 | Health dashboard interno | Estado de scrapers, última actualización, errores |
| 2.19 | Staging environment en Vercel | Preview deployments con datos de prueba |
| 2.20 | Documentación de APIs interna | OpenAPI/Swagger para endpoints |

---

## 6 Meses (Meses 4-6)

### Inteligencia & Personalización

| # | Tarea | Detalle |
|---|---|---|
| 3.1 | Recomendaciones personalizadas basadas en historial | ML ligero (Tinybird o similar) |
| 3.2 | Detección de mejores ofertas con `@ahorroya/offers-engine` | Algoritmo de price intelligence |
| 3.3 | Predicción de tendencias de precios | Basado en histórico con modelos simples |
| 3.4 | "Canasta inteligente" — optimización de compra | Minimizar costo total entre múltiples tiendas |

### Escala

| # | Tarea | Detalle |
|---|---|---|
| 3.5 | Multi-tenancy para expansión regional | `@ahorroya/multitenant` — preparar para LATAM |
| 3.6 | Cobertura nacional completa | 32 departamentos, 1,100+ municipios |
| 3.7 | Internacionalización (i18n) | Inglés + portugués para expansión regional |
| 3.8 | App mobile (React Native o PWA avanzada) | PWA primero, nativa después |
| 3.9 | Data lake para analytics | `@ahorroya/data-lake` — eventos de usuario para producto |

### Go-to-Market

| # | Tarea | Detalle |
|---|---|---|
| 3.10 | Programa de afiliados con retailers | Comisión por tráfico/ventas referido |
| 3.11 | SEO masivo: páginas de producto para 50k+ items | Una URL única por producto con datos estructurados ricos |
| 3.12 | Blog de contenido (ahorro, tips, comparativas) | Subdirectorio /blog con artículos |
| 3.13 | Estrategia de redes sociales real | Twitter, Instagram, TikTok con contenido de valor |
| 3.14 | Programa early adopters | 1,000 usuarios beta con beneficios exclusivos |

---

## 12 Meses (Meses 7-12)

### Liderazgo de Mercado

| # | Tarea | Detalle |
|---|---|---|
| 4.1 | Expansión a Perú, Ecuador y Chile | Repetir playbook de scraper + datos + SEO |
| 4.2 | API pública para desarrolladores | Partner program para integraciones |
| 4.3 | Dashboard de inteligencia de mercado para retailers | Datos agregados de precios de la competencia |
| 4.4 | Asistente IA para compras | GPT + datos de catálogo para recomendaciones conversacionales |

### Monetización

| # | Tarea | Detalle |
|---|---|---|
| 4.5 | Modelo freemium (AhorroYa Pro) | Alertas ilimitadas, histórico extendido, sin anuncios |
| 4.6 | Publicidad nativa para marcas | Productos destacados en búsquedas relevantes |
| 4.7 | Data-as-a-Service para retailers | Reportes de posicionamiento de precios |
| 4.8 | Suscripción empresa para RH | Canasta básica monitoreada para beneficios corporativos |

### Sostenibilidad

| # | Tarea | Detalle |
|---|---|---|
| 4.9 | Open source de paquetes core | Comunidad alrededor del ecosistema |
| 4.10 | Carbon footprint tracking por producto | Datos de huella de carbono en fichas de producto |
| 4.11 | Programa de calidad de datos crowdsourced | Usuarios reportan precios incorrectos y ganan puntos |
| 4.12 | SOC 2 Type II compliance | Para ventas enterprise |

---

## KPIs de Éxito por Fase

| Fase | KPI | Target |
|---|---|---|
| 30 días | Products indexados | 10,000+ |
| 30 días | Cobertura tests app | >60% |
| 30 días | Core Web Vitals (LCP, FID, CLS) | Pase todas las métricas |
| 90 días | Usuarios registrados | 5,000+ |
| 90 días | Ciudades cubiertas | 20+ |
| 90 días | Scrapers activos | 7+ retailers, cada 6h |
| 6 meses | Usuarios activos semanales | 50,000+ |
| 6 meses | Productos indexados | 50,000+ |
| 6 meses | Departamentos cubiertos | 32/32 |
| 12 meses | Usuarios activos mensuales | 500,000+ |
| 12 meses | Países | 4 (COL, PER, ECU, CHL) |
| 12 meses | ARR | $120,000+ |

---

## Riesgos del Roadmap

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Retailers bloquean scraping | Alta | Alto | Rotación de IPs, APIs oficiales si existen |
| Falta de tracción inicial | Media | Alto | SEO agresivo + programa early adopters |
| Costo de scraping escala lineal | Alta | Medio | Optimizar workers, cachear resultados |
| Competidores establecidos (Knasta, Baratas) | Alta | Medio | Diferenciación en cobertura local + UX |
| Cambios en APIs de Supabase/Vercel | Baja | Medio | Mantenerse en features estables, evitar vendor lock-in |
