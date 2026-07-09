# AhorroYa - Arquitectura General

## Visión
Plataforma Nacional de Comparación de Precios de Supermercados y Farmacias de Colombia.

## Principios
1. Nunca inventar información
2. Mostrar siempre la fecha de actualización
3. Mostrar el origen del dato
4. Toda comparación debe ser verificable
5. La publicidad siempre irá identificada

## Estructura del Monorepo

```
AhorroYa/
├── apps/
│   ├── web/          # Aplicación web Next.js
│   ├── api/          # API server independiente
│   ├── admin/        # Panel de administración
│   └── worker/       # Trabajos en segundo plano
├── packages/
│   ├── database/     # Schemas Drizzle ORM
│   ├── search-index/ # Índice de búsqueda en memoria
│   ├── scraper/      # Scrapers de tiendas
│   ├── pricing-engine/ # Motor de precios
│   ├── ingestion/    # Pipeline de ingesta
│   ├── shared/       # Eventos y utilidades
│   ├── analytics/    # Analítica
│   └── types/        # Tipos compartidos
├── services/
│   ├── image-engine/ # Procesamiento de imágenes
│   ├── geo-engine/   # Geolocalización
│   ├── ai-engine/    # Inteligencia Artificial
│   ├── data-quality/ # Calidad de datos
│   └── notifications/ # Notificaciones
├── features/
│   ├── barcodes/     # Códigos de barras y QR
│   ├── favorites/    # Favoritos
│   └── promotions/   # Promociones y ofertas
└── __tests__/        # Tests unitarios, integración, E2E
```

## Stack Tecnológico
- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: Next.js API Routes + Node.js HTTP Server
- Base de datos: PostgreSQL + Drizzle ORM
- Cache: Redis
- Autenticación: Supabase Auth
- Almacenamiento: CDN + Almacenamiento local
- Contenedores: Docker + Docker Compose
- CI/CD: GitHub Actions
