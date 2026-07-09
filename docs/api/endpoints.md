# API Endpoints

## Productos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/products | Lista productos (paginación, filtros) |
| GET | /api/products/:slug | Detalle de producto con precios |

## Búsqueda
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/search?q= | Búsqueda en índice nacional |

## Comercios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/stores | Lista todos los comercios |

## Códigos de Barras
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/barcode/scan | Escanear código |
| GET | /api/barcode/:code | Buscar por código |

## Imágenes
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/images/upload | Subir imagen |
| GET | /api/images/:id | Obtener imagen |
| DELETE | /api/images/:id | Eliminar imagen |

## Precios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/scrape?q= | Scraper de precios |

## Promociones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/promotions | Promociones activas |

## Favoritos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/favorites | Listar favoritos |
| POST | /api/favorites | Agregar/quitar favorito |

## IA
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/ai/recommend | Recomendación de producto |
| GET | /api/ai/suggest?q= | Sugerencias de búsqueda |

## Geolocalización
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/geo/nearby | Sucursales cercanas |

## Calidad
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/quality/report | Reporte de calidad de datos |

## Analítica
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/analytics/events | Registrar evento |
| GET | /api/analytics/events | Reporte de eventos |
