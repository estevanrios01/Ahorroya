-- AhorroYa - Migración Inicial
-- Creación del esquema de base de datos

-- Usuarios
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(150),
    avatar VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Marcas
CREATE TABLE brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    logo VARCHAR(500),
    website VARCHAR(500),
    country VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categorías
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES categories(id),
    level INTEGER DEFAULT 0 NOT NULL,
    icon VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Productos Maestros
CREATE TABLE master_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    short_name VARCHAR(150),
    commercial_name VARCHAR(300),
    brand_id UUID REFERENCES brands(id),
    manufacturer VARCHAR(150),
    supplier VARCHAR(150),
    importer VARCHAR(150),
    country VARCHAR(100),
    category_id UUID REFERENCES categories(id),
    subcategory VARCHAR(100),
    barcode VARCHAR(50),
    ean VARCHAR(50),
    upc VARCHAR(50),
    weight NUMERIC(10,2),
    volume NUMERIC(10,2),
    unit VARCHAR(20),
    description TEXT,
    ingredients TEXT,
    nutritional_info JSONB,
    health_register VARCHAR(100),
    image VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comercios
CREATE TABLE stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    nit VARCHAR(50),
    legal_name VARCHAR(300),
    logo VARCHAR(500),
    brand VARCHAR(150),
    chain VARCHAR(150),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    website VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    social JSONB,
    rating NUMERIC(3,2),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sucursales
CREATE TABLE branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    address VARCHAR(300),
    city VARCHAR(100),
    department VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Colombia',
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    phone VARCHAR(50),
    schedule JSONB,
    services JSONB,
    has_parking BOOLEAN DEFAULT FALSE,
    has_accessibility BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Productos por Tienda
CREATE TABLE store_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    master_product_id UUID REFERENCES master_products(id) NOT NULL,
    store_id UUID REFERENCES stores(id) NOT NULL,
    branch_id UUID REFERENCES branches(id),
    sku VARCHAR(100),
    price NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2),
    available BOOLEAN DEFAULT TRUE NOT NULL,
    stock INTEGER DEFAULT 0,
    url VARCHAR(500),
    captured_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Historial de Precios
CREATE TABLE store_product_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_product_id UUID REFERENCES store_products(id) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imágenes de Productos
CREATE TABLE product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    master_product_id UUID REFERENCES master_products(id) NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    webp_url VARCHAR(500),
    avif_url VARCHAR(500),
    alt VARCHAR(200),
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Inventario
CREATE TABLE inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_product_id UUID REFERENCES store_products(id) NOT NULL,
    quantity INTEGER DEFAULT 0 NOT NULL,
    available INTEGER DEFAULT 0 NOT NULL,
    reserved INTEGER DEFAULT 0 NOT NULL,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'unidad',
    last_entry_at TIMESTAMPTZ,
    last_exit_at TIMESTAMPTZ,
    rotation NUMERIC(5,2),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Canastas/Listas de Compras
CREATE TABLE baskets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(150) NOT NULL,
    favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE basket_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    basket_id UUID REFERENCES baskets(id) ON DELETE CASCADE NOT NULL,
    master_product_id UUID REFERENCES master_products(id) NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    UNIQUE(basket_id, master_product_id)
);

-- Scraping Jobs
CREATE TABLE scraping_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store VARCHAR(60) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    priority INTEGER DEFAULT 100 NOT NULL,
    payload JSONB NOT NULL,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE scraping_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    products_found INTEGER DEFAULT 0 NOT NULL,
    products_updated INTEGER DEFAULT 0 NOT NULL,
    products_inserted INTEGER DEFAULT 0 NOT NULL,
    duration_seconds INTEGER DEFAULT 0 NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_master_products_slug ON master_products(slug);
CREATE INDEX idx_master_products_barcode ON master_products(barcode);
CREATE INDEX idx_master_products_ean ON master_products(ean);
CREATE INDEX idx_store_products_price ON store_products(price);
CREATE INDEX idx_store_products_store ON store_products(store_id);
CREATE INDEX idx_store_products_master ON store_products(master_product_id);
CREATE INDEX idx_store_product_history_captured ON store_product_history(captured_at);
CREATE INDEX idx_branches_location ON branches(latitude, longitude);
CREATE INDEX idx_branches_city ON branches(city);
CREATE INDEX idx_users_email ON users(email);
