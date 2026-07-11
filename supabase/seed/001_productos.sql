-- Seed inicial idempotente de catalogo, comercios, sucursales y precios.

INSERT INTO brands (id, name, slug) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Diana', 'diana'),
  ('a0000001-0000-0000-0000-000000000002', 'Roa', 'roa'),
  ('a0000001-0000-0000-0000-000000000003', 'Gourmet', 'gourmet'),
  ('a0000001-0000-0000-0000-000000000004', 'Colanta', 'colanta'),
  ('a0000001-0000-0000-0000-000000000005', 'Bimbo', 'bimbo'),
  ('a0000001-0000-0000-0000-000000000006', 'MK', 'mk'),
  ('a0000001-0000-0000-0000-000000000007', 'Genfar', 'genfar'),
  ('a0000001-0000-0000-0000-000000000008', 'Rey', 'rey'),
  ('a0000001-0000-0000-0000-000000000009', 'Sello Rojo', 'sello-rojo'),
  ('a0000001-0000-0000-0000-000000000010', 'Coca-Cola', 'coca-cola'),
  ('a0000001-0000-0000-0000-000000000011', 'FAB', 'fab'),
  ('a0000001-0000-0000-0000-000000000012', 'Santa Reyes', 'santa-reyes')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

INSERT INTO categories (id, name, slug, level) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Despensa', 'despensa', 0),
  ('b0000001-0000-0000-0000-000000000002', 'Lacteos', 'lacteos', 0),
  ('b0000001-0000-0000-0000-000000000003', 'Panaderia', 'panaderia', 0),
  ('b0000001-0000-0000-0000-000000000004', 'Farmacia', 'farmacia', 0),
  ('b0000001-0000-0000-0000-000000000005', 'Aseo', 'aseo', 0),
  ('b0000001-0000-0000-0000-000000000006', 'Bebidas', 'bebidas', 0),
  ('b0000001-0000-0000-0000-000000000007', 'Carnes y Huevos', 'carnes', 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  level = EXCLUDED.level,
  updated_at = NOW();

INSERT INTO master_products (id, name, slug, short_name, commercial_name, brand_id, category_id, barcode, ean, weight, volume, unit, image, status) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Arroz Diana Premium 1 kg', 'arroz-diana-premium-1kg', 'Arroz Diana 1 kg', 'Arroz Diana Premium 1 kg', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '7702010000011', '7702010000011', 1000, NULL, 'g', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000002', 'Arroz Roa Fortificado 1 kg', 'arroz-roa-fortificado-1kg', 'Arroz Roa 1 kg', 'Arroz Roa Fortificado 1 kg', 'a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', '7702010000028', '7702010000028', 1000, NULL, 'g', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000003', 'Aceite Gourmet 900 ml', 'aceite-gourmet-900ml', 'Aceite Gourmet 900 ml', 'Aceite Gourmet 900 ml', 'a0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', '7702010000035', '7702010000035', NULL, 900, 'ml', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000004', 'Leche Entera Colanta 1 L', 'leche-entera-colanta-1l', 'Leche Colanta 1 L', 'Leche Entera Colanta 1 L', 'a0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002', '7702010000042', '7702010000042', NULL, 1000, 'ml', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000005', 'Pan Bimbo Integral 500 g', 'pan-bimbo-integral-500g', 'Pan Bimbo 500 g', 'Pan Bimbo Integral 500 g', 'a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000003', '7702010000059', '7702010000059', 500, NULL, 'g', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000006', 'Acetaminofen MK 500 mg x30', 'acetaminofen-mk-500mg-x30', 'Acetaminofen MK x30', 'Acetaminofen MK 500 mg x30', 'a0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000004', '7702010000066', '7702010000066', NULL, NULL, 'unidad', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000007', 'Ibuprofeno Genfar 400 mg x20', 'ibuprofeno-genfar-400mg-x20', 'Ibuprofeno Genfar x20', 'Ibuprofeno Genfar 400 mg x20', 'a0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000004', '7702010000073', '7702010000073', NULL, NULL, 'unidad', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000008', 'Jabon Rey Barra 150 g', 'jabon-rey-barra-150g', 'Jabon Rey 150 g', 'Jabon Rey Barra 150 g', 'a0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000005', '7702010000080', '7702010000080', 150, NULL, 'g', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000009', 'Cafe Sello Rojo 500 g', 'cafe-sello-rojo-500g', 'Cafe Sello Rojo 500 g', 'Cafe Sello Rojo 500 g', 'a0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000001', '7702010000103', '7702010000103', 500, NULL, 'g', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000010', 'Coca-Cola 2.5 L', 'coca-cola-25l', 'Coca-Cola 2.5 L', 'Coca-Cola 2.5 L', 'a0000001-0000-0000-0000-000000000010', 'b0000001-0000-0000-0000-000000000006', '7702010000110', '7702010000110', NULL, 2500, 'ml', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000011', 'Detergente FAB 1 kg', 'detergente-fab-1kg', 'Detergente FAB 1 kg', 'Detergente FAB 1 kg', 'a0000001-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000005', '7702010000127', '7702010000127', 1000, NULL, 'g', NULL, 'active'),
  ('c0000001-0000-0000-0000-000000000012', 'Huevos Santa Reyes x30', 'huevos-santa-reyes-x30', 'Huevos x30', 'Huevos Santa Reyes x30', 'a0000001-0000-0000-0000-000000000012', 'b0000001-0000-0000-0000-000000000007', '7702010000134', '7702010000134', NULL, NULL, 'unidad', NULL, 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  commercial_name = EXCLUDED.commercial_name,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  barcode = EXCLUDED.barcode,
  ean = EXCLUDED.ean,
  weight = EXCLUDED.weight,
  volume = EXCLUDED.volume,
  unit = EXCLUDED.unit,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO stores (id, name, slug, brand, chain, category, website, status) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'Almacenes Exito', 'exito', 'Exito', 'Grupo Exito', 'Supermercado', 'https://www.exito.com', 'active'),
  ('d0000001-0000-0000-0000-000000000002', 'Tiendas D1', 'd1', 'D1', 'D1', 'Supermercado', 'https://www.tiendasd1.com', 'active'),
  ('d0000001-0000-0000-0000-000000000003', 'Supermercados Olimpica', 'olimpica', 'Olimpica', 'Olimpica', 'Supermercado', 'https://www.olimpica.com', 'active'),
  ('d0000001-0000-0000-0000-000000000004', 'Jumbo', 'jumbo', 'Jumbo', 'Cencosud', 'Supermercado', 'https://www.jumbo.com.co', 'active'),
  ('d0000001-0000-0000-0000-000000000005', 'Ara', 'ara', 'Ara', 'Jerónimo Martins', 'Supermercado', 'https://www.ara.com.co', 'active'),
  ('d0000001-0000-0000-0000-000000000006', 'Cruz Verde', 'cruz-verde', 'Cruz Verde', 'Cruz Verde', 'Farmacia', 'https://www.cruzverde.com.co', 'active'),
  ('d0000001-0000-0000-0000-000000000007', 'Farmatodo', 'farmatodo', 'Farmatodo', 'Farmatodo', 'Farmacia', 'https://www.farmatodo.com.co', 'active'),
  ('d0000001-0000-0000-0000-000000000008', 'Carulla', 'carulla', 'Carulla', 'Grupo Exito', 'Supermercado', 'https://www.carulla.com', 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  chain = EXCLUDED.chain,
  category = EXCLUDED.category,
  website = EXCLUDED.website,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO branches (id, store_id, name, code, address, city, department, latitude, longitude, status) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Exito Unicentro Cali', 'EXI-CALI-001', 'Calle 5 # 38-35', 'Cali', 'Valle del Cauca', 3.3742000, -76.5409000, 'active'),
  ('e0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'D1 San Fernando Cali', 'D1-CALI-001', 'Carrera 34 # 5-20', 'Cali', 'Valle del Cauca', 3.4285000, -76.5431000, 'active'),
  ('e0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', 'Olimpica Pasoancho', 'OLI-CALI-001', 'Avenida Pasoancho # 50-12', 'Cali', 'Valle del Cauca', 3.3895000, -76.5312000, 'active'),
  ('e0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', 'Jumbo Santa Ana', 'JUM-BOG-001', 'Avenida Calle 116 # 17-05', 'Bogota', 'Cundinamarca', 4.6948000, -74.0476000, 'active'),
  ('e0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', 'Ara Laureles', 'ARA-MED-001', 'Carrera 76 # 33A-20', 'Medellin', 'Antioquia', 6.2442000, -75.5812000, 'active'),
  ('e0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', 'Cruz Verde Granada', 'CV-CALI-001', 'Avenida 8 Norte # 15-12', 'Cali', 'Valle del Cauca', 3.4623000, -76.5299000, 'active'),
  ('e0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000007', 'Farmatodo Chipichape', 'FTO-CALI-001', 'Avenida 6 Norte # 37N-25', 'Cali', 'Valle del Cauca', 3.4767000, -76.5287000, 'active'),
  ('e0000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000008', 'Carulla Pance', 'CAR-CALI-001', 'Carrera 122 # 16-20', 'Cali', 'Valle del Cauca', 3.3427000, -76.5293000, 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  department = EXCLUDED.department,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO store_products (id, master_product_id, store_id, branch_id, sku, price, original_price, available, stock, url) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'EXI-ARROZ-DIANA-1KG', 4200, 4500, true, 80, 'https://www.exito.com/buscar?q=arroz'),
  ('f0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000002', 'D1-ARROZ-DIANA-1KG', 3800, 4100, true, 60, 'https://www.tiendasd1.com'),
  ('f0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000003', 'OLI-ARROZ-ROA-1KG', 3900, 4300, true, 55, 'https://www.olimpica.com'),
  ('f0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000004', 'JUM-ACEITE-GOURMET-900', 12500, 14800, true, 35, 'https://www.jumbo.com.co'),
  ('f0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'EXI-LECHE-COLANTA-1L', 3200, 3400, true, 120, 'https://www.exito.com'),
  ('f0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000005', 'ARA-LECHE-COLANTA-1L', 2950, 3300, true, 90, 'https://www.ara.com.co'),
  ('f0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000008', 'CAR-PAN-BIMBO-500', 6100, 6500, true, 40, 'https://www.carulla.com'),
  ('f0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000006', 'CV-ACETAMINOFEN-MK', 2850, 3600, true, 200, 'https://www.cruzverde.com.co'),
  ('f0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000007', 'FTO-ACETAMINOFEN-MK', 2980, 3600, true, 160, 'https://www.farmatodo.com.co'),
  ('f0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000006', 'CV-IBUPROFENO-GENFAR', 5200, 6200, true, 90, 'https://www.cruzverde.com.co'),
  ('f0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000002', 'D1-JABON-REY', 4800, 5900, true, 70, 'https://www.tiendasd1.com'),
  ('f0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'EXI-CAFE-SELLO-ROJO', 8500, 10200, true, 65, 'https://www.exito.com'),
  ('f0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000010', 'd0000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000003', 'OLI-COCA-COLA-25L', 4800, 5500, true, 110, 'https://www.olimpica.com'),
  ('f0000001-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000011', 'd0000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000005', 'ARA-DETERGENTE-FAB', 7800, 9500, true, 45, 'https://www.ara.com.co'),
  ('f0000001-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000012', 'd0000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000008', 'CAR-HUEVOS-SANTA-REYES', 13800, 16800, true, 25, 'https://www.carulla.com')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  available = EXCLUDED.available,
  stock = EXCLUDED.stock,
  url = EXCLUDED.url,
  captured_at = NOW(),
  updated_at = NOW();

INSERT INTO store_product_history (store_product_id, price, available, captured_at)
SELECT id, price, available, NOW()
FROM store_products
WHERE id::text LIKE 'f0000001-%';
