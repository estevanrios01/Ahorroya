# AhorroYa — Documentación del Ecosistema

## Arquitectura

```
ahorroya/
├── app/                    # Next.js App Router (web frontend)
│   ├── api/                # API Routes (18 endpoints)
│   ├── producto/[slug]/    # Página de producto con SEO
│   ├── supermercado/[slug/ # Página de supermercado
│   ├── farmacia/[slug]/    # Página de farmacia
│   ├── categoria/[slug]/   # Página de categoría
│   ├── marca/[slug]/       # Página de marca
│   ├── ciudad/[slug]/      # Página de ciudad
│   ├── departamento/[slug]/# Página de departamento
│   ├── dashboard-ejecutivo/# Dashboard KPIs nacionales
│   └── page.js             # Home page
├── apps/
│   ├── admin/              # Panel administrativo CMS (17 secciones)
│   ├── mobile/             # App móvil Expo + React Native
│   ├── api/                # API standalone (puerto 4000)
│   └── worker/             # Worker de procesamiento batch
├── packages/ (26)
│   ├── database/           # Drizzle ORM schema (14 tablas)
│   ├── scraper/            # Scrapers v1 (8 comercios mock)
│   ├── scraper-framework-v2/# Scrapers v2 (100+ plugins)
│   ├── catalog-core/       # DDD: MasterProduct, DuplicateDetector
│   ├── normalization-engine/# Pipeline normalización productos
│   ├── matching-engine/    # Estrategias matching (5 + hybrid)
│   ├── quality-engine/     # Quality scoring 8 dimensiones
│   ├── pricing-engine/     # Anomalías, tendencias, canasta
│   ├── pricing-core/       # DDD cálculos, predicciones, alertas
│   ├── search-index/       # Índice búsqueda in-memory
│   ├── search-engine-v2/   # Búsqueda fuzzy, sinónimos, stemming
│   ├── ingestion/          # Pipeline ingestión (validate→normalize→fingerprint)
│   ├── analytics/          # Event tracking y reporting
│   ├── event-bus/          # Pub/sub con dead letter queue
│   ├── data-lake/          # DataLake in-memory
│   └── ... (ui, shared, types, etc.)
├── components/
│   ├── layout/             # Header, Footer
│   ├── home/               # Hero, CategoryGrid, StoreCarousel
│   ├── product/            # ProductCardPremium, ProductGrid
│   └── seo/                # JSON-LD (Product, Store, Category, Breadcrumb, WebSite)
├── services/
│   ├── catalog/            # Catálogo Maestro (CatalogService.js)
│   ├── ai-engine/          # Recomendaciones, predicciones, sugerencias
│   ├── notifications/      # Email, Push, WhatsApp
│   ├── image-engine/       # Procesamiento imágenes
│   ├── geo-engine/         # Geolocalización
│   └── data-quality/       # Validación calidad datos
└── lib/                    # Supabase client, utilidades
```

## Base de Datos (PostgreSQL + Drizzle ORM)

14 tablas en `packages/database/schema/`:

| Tabla | Columnas clave | Propósito |
|-------|---------------|-----------|
| `users` | id, email, name, role | Usuarios del sistema |
| `stores` | id, name, slug, nit, brand chain | Comercios (supermercados/farmacias) |
| `branches` | id, storeId, address, city, lat, lng | Sucursales |
| `master_products` | id, name, slug, barcode, ean, brand, weight, volume, category | Catálogo maestro |
| `store_products` | id, masterProductId, storeId, sku, price, available | Precios por comercio |
| `store_product_history` | id, storeProductId, price, capturedAt | Historico precios (append-only) |
| `product_images` | id, masterProductId, url, hash | Imágenes |
| `brands` | id, name, slug | Marcas |
| `categories` | id, name, slug, parentId | Categorías |
| `scraping_jobs` | id, store, status, payload | Trabajos scraping |
| `scraping_runs` | id, productsFound, duration | Ejecuciones |
| `inventory` | id, storeProductId, quantity, status | Inventario |
| `baskets` / `basket_items` | userId, masterProductId | Listas de compras |

## API Endpoints

### Frontend API (`/app/api/`)

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/health` | Health check del sistema |
| GET | `/api/products` | Listar productos |
| GET | `/api/products/[slug]` | Producto por slug |
| GET | `/api/search?q=` | Buscar productos |
| GET | `/api/stores` | Listar comercios |
| GET | `/api/barcode/[code]` | Producto por código de barras |
| GET | `/api/barcode/scan` | Escanear código |
| GET | `/api/promotions` | Promociones activas |
| GET | `/api/geo/nearby` | Tiendas cercanas |
| POST | `/api/favorites` | Gestión favoritos |
| POST | `/api/analytics/events` | Eventos de analytics |
| POST | `/api/quality/report` | Reportar calidad |
| POST | `/api/images/upload` | Subir imagen |
| GET | `/api/images/[id]` | Obtener imagen |
| GET | `/api/ai/recommend` | Recomendaciones IA |
| GET | `/api/ai/suggest` | Sugerencias búsqueda |
| GET | `/api/scrape` | Ejecutar scraping |

### Standalone API (`apps/api/`, puerto 4000)

| Ruta | Propósito |
|------|-----------|
| `/products` | CRUD productos |
| `/search` | Búsqueda |

## Frontend Routes

| Ruta | Tipo | SEO | Descripción |
|------|------|-----|-------------|
| `/` | Static | Layout metadata | Home con productos destacados |
| `/producto/[id]` | SSR | generateMetadata + JSON-LD | Detalle producto, histórico, comparativa |
| `/supermercado/[slug]` | SSR | generateMetadata + JSON-LD | Página de supermercado |
| `/farmacia/[slug]` | SSR | generateMetadata + JSON-LD | Página de farmacia |
| `/categoria/[slug]` | SSR | generateMetadata + JSON-LD | Productos por categoría |
| `/marca/[slug]` | SSR | generateMetadata + JSON-LD | Productos por marca |
| `/ciudad/[slug]` | SSR | generateMetadata + JSON-LD | Cobertura por ciudad |
| `/departamento/[slug]` | SSR | generateMetadata + JSON-LD | Cobertura por departamento |
| `/dashboard-ejecutivo` | SSR | generateMetadata + JSON-LD | KPIs nacionales |
| `/marcas` | SSR | Static metadata | Listado de marcas |

## App Móvil (Expo + React Native)

`apps/mobile/` — Scaffold completo con:

| Screen | Features |
|--------|----------|
| `HomeScreen` | Productos destacados, búsqueda, escáner, mapa |
| `SearchScreen` | Búsqueda con autocomplete |
| `ProductScreen` | Detalle producto, comparativa precios, mapa |
| `ScannerScreen` | Escáner código barras + entrada manual |
| `FavoritesScreen` | Productos favoritos |
| `CartScreen` | Lista de compras |
| `ProfileScreen` | Perfil, configuración, alertas |
| `MapScreen` | Tiendas cercanas con mapa |
| `StoreScreen` | Productos por tienda |

## Panel Administrativo

`apps/admin/` — 17 secciones:

1. Dashboard — KPIs generales
2. Productos — CRUD productos maestro
3. Categorías — Gestión de categorías
4. Marcas — Gestión de marcas
5. Comercios — CRUD comercios
6. Sucursales — Sucursales por comercio
7. Precios — Monitoreo precios y anomalías
8. Promociones — Gestión promociones
9. Banners — Banners publicitarios
10. Imágenes — Validación imágenes
11. Usuarios — Gestión usuarios y roles
12. Roles — Permisos y roles
13. Scrapers — Monitoreo scrapers
14. Alertas — Alertas del sistema
15. Calidad — Métricas calidad datos
16. SEO — Meta tags, sitemap
17. Configuración — Ajustes del sistema

## Scrapers

Arquitectura plugin-based (`packages/scraper-framework-v2/`):

- **Interface**: `ScraperPlugin` con método `scrape(page?)`
- **Registry**: `PluginRegistry` para gestionar plugins
- **Base HTTP**: `BaseHttpPlugin` con axios + cheerio
- **100 plugins**: 50 supermercados + 50 farmacias colombianas
- **Runner**: `ScrapingRunner` con rate limiting, aislamiento errores, estadísticas

## Catálogo Maestro

`services/catalog/CatalogService.js`:

| Función | Propósito |
|---------|-----------|
| `getProductBySlug(slug)` | Producto completo con normalización, matching, precios |
| `getAllProducts()` | Todos los productos |
| `searchProducts(query)` | Búsqueda con scoring |
| `getProductsByStore(storeSlug)` | Productos de un comercio |
| `getProductsByCategory(slug)` | Productos por categoría |
| `getProductsByBrand(brandName)` | Productos por marca |
| `getStore(slug)` | Comercio por slug |
| `getCategory(slug)` | Categoría por slug |
| `getBrand(slug)` | Marca por slug |
| `getCity(slug)` | Ciudad por slug |
| `getDepartment(slug)` | Departamento por slug |

## Integración Continua

```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm run lint       # ESLint
npm run test       # Tests
npm run scrape     # Ejecutar scrapers
npm run worker     # Worker batch
```

## Deployment

```bash
# Vercel (web)
vercel --prod

# Docker (full stack)
docker-compose up -d
```

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Framer Motion
- **Mobile**: Expo SDK 52, React Native 0.76
- **Backend**: Next.js API Routes, Node HTTP server
- **Database**: PostgreSQL 16 via Drizzle ORM + Supabase
- **Cache**: Redis 7
- **Scraping**: Axios + Cheerio
- **Auth**: Supabase Auth
- **Charts**: Recharts
- **State**: Zustand
- **Analytics**: Custom event tracking
- **Notifications**: Email (Nodemailer), Push (Expo), WhatsApp, Telegram
