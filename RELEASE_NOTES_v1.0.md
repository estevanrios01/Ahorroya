# RELEASE NOTES v1.0.0 — AhorroYa

> Fecha: 2026-07-09
> Commit: `chore: release candidate v1.0`

---

## Resumen

Lanzamiento público de AhorroYa, la plataforma nacional de comparación de precios de supermercados y farmacias de Colombia.

---

## Arquitectura

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | Next.js | 16.2.10 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS | 4.3.2 |
| Animaciones | Framer Motion | 12.42.2 |
| Iconos | Lucide React | 1.23.0 |
| Estado | Zustand | 5.0.14 |
| Charts | Recharts | 3.9.2 |
| Backend | Supabase | 2.109.0 |
| ORM | Drizzle | 0.38.4 |
| Monorepo | npm workspaces | 26 packages |
| App Móvil | Expo | 52 |
| Deploy | Vercel | iad1 |

---

## Rutas (34 total)

### Frontend (22)
| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | Static | Home |
| `/producto/[id]` | Dynamic | Detalle producto |
| `/supermercado/[slug]` | Dynamic | Tienda específica |
| `/farmacia/[slug]` | Dynamic | Farmacia específica |
| `/categoria/[slug]` | Dynamic | Categoría |
| `/marca/[slug]` | Dynamic | Marca |
| `/marcas` | Static | Listado marcas |
| `/ciudad/[slug]` | Dynamic | Ciudad |
| `/departamento/[slug]` | Dynamic | Departamento |
| `/buscar` | Dynamic | Búsqueda |
| `/favoritos` | Static | Favoritos |
| `/auth` | Static | Autenticación |
| `/categorias` | Static | Listado categorías |
| `/supermercados` | Static | Listado supermercados |
| `/farmacias` | Static | Listado farmacias |
| `/ciudades` | Static | Cobertura ciudades |
| `/departamentos` | Static | Cobertura departamentos |
| `/admin` | Static | Admin (redirect) |
| `/dashboard-ejecutivo` | Static | Dashboard KPIs |
| `/legal/privacidad` | Static | Privacidad |
| `/legal/terminos` | Static | Términos |
| `/legal/contacto` | Static | Contacto |

### API (18 endpoints)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/health` | GET | Health check |
| `/api/products` | GET | Listado productos |
| `/api/products/[slug]` | GET | Detalle producto |
| `/api/stores` | GET | Listado tiendas |
| `/api/stores/[slug]` | GET | Detalle tienda |
| `/api/search` | GET | Búsqueda |
| `/api/promotions` | GET | Promociones |
| `/api/favorites` | GET, POST | Favoritos |
| `/api/barcode/[code]` | GET | Barcode lookup |
| `/api/barcode/scan` | POST | Escaneo |
| `/api/geo/nearby` | GET | Geocercas |
| `/api/quality/report` | GET | Reporte calidad |
| `/api/analytics/events` | POST | Eventos |
| `/api/ai/suggest` | GET | Sugerencias |
| `/api/ai/recommend` | POST | Recomendaciones |
| `/api/images/[id]` | GET, DELETE | Imágenes |
| `/api/images/upload` | POST | Subida imágenes |
| `/api/scrape` | POST | Scraping |

### SEO & Assets
| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/robots.txt` | Static | Robots |
| `/sitemap.xml` | Static | Sitemap |
| `/manifest.json` | Static | PWA manifest |
| `/favicon.ico` | Static | Favicon |
| `/icons/icon-192.svg` | Static | PWA icon |
| `/icons/icon-512.svg` | Static | PWA icon |
| `/og-image.svg` | Static | OpenGraph imagen |

---

## Seguridad

- ✅ CORS headers configurados
- ✅ Content-Security-Policy header
- ✅ Strict-Transport-Security (HSTS) 2 años
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy restringida
- ✅ Proxy middleware para auth API
- ✅ `poweredByHeader: false`
- ✅ Docker como non-root user
- ✅ `.env` files en `.gitignore`

---

## Monitoreo y Observabilidad

- ⚠️ Sin Sentry/DataDog (pendiente)
- ⚠️ Logging básico (console)
- ⚠️ Sin rate limiting
- ⚠️ Sin backups automáticos

---

## Tests

| Suite | Estado |
|-------|--------|
| Unit tests (4 suites) | ✅ 12/12 pass |
| Integration tests (1 suite) | ⚠️ 4/4 fail (requiere servidor corriendo) |

---

## Deploy

- **Plataforma**: Vercel (SSR)
- **Región**: us-east-1 (iad1)
- **URLs**: `https://ahorroya.vercel.app`
- **Docker**: Multi-stage build, node:20-alpine
- **CI/CD**: GitHub Actions (scrapers cada 6h)

---

## Dependencias

| Paquete | Versión | Estado |
|---------|---------|--------|
| next | 16.2.10 | ✅ |
| react | 19.2.4 | ⚠️ Patch 19.2.7 disponible |
| react-dom | 19.2.4 | ⚠️ Patch 19.2.7 disponible |
| drizzle-orm | 0.38.4 | 🔴 CVE-2025-40222 |
| lucide-react | 1.23.0 | ⚠️ Minor detrás |
| framer-motion | 12.42.2 | ✅ |
| tailwindcss | 4.3.2 | ✅ |
| eslint | 9.39.4 | ✅ |

---

## Issues Conocidos (Pre-Producción)

### CRÍTICOS (Pendientes)
1. Rotar `VERCEL_OIDC_TOKEN` en dashboard Vercel
2. Implementar rate limiting en APIs
3. Eliminar imports fantasma de CatalogService
4. Convertir home page a Server Component
5. Actualizar `drizzle-orm` a >= 0.45.2
6. Agregar try/catch en API routes

### Próximos Pasos Post-Lanzamiento
- Migrar datos mock a PostgreSQL/Supabase real
- Implementar autenticación real con Supabase Auth
- Integrar Sentry para monitoreo de errores
- Agregar service worker para PWA
- Implementar búsqueda con tipos dinámicos
- Agregar pruebas E2E con Playwright
- Configurar backups automáticos de BD

---

## Equipo

AhorroYa — Inteligencia de Precios para Colombia.
