# Despliegue a Producción

## Requisitos
- Node.js 20+
- Docker y Docker Compose
- PostgreSQL 16+
- Redis 7+
- Cuenta en Supabase

## Variables de Entorno
```
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANONIMA
NEXT_PUBLIC_API_URL=https://ahorroya.com
```

## Construcción y Despliegue

### Docker
```bash
docker-compose up -d --build
```

### Manual
```bash
npm ci
npm run build
npm start
```

## CI/CD
Los workflows de GitHub Actions ejecutan:
1. Lint en cada push
2. Tests en cada push
3. Build en cada push a main
4. Scrapers cada 6 horas
5. Deploy automático en push a main

## Monitoreo
- Health check: GET /api/health
- Métricas: GET /api/analytics/events

## Scrapers Automáticos
Los scrapers se ejecutan cada 6 horas via GitHub Actions.
También pueden ejecutarse manualmente:
```bash
npm run scrape
```
