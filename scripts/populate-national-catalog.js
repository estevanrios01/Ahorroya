const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) process.env[key] = rest.join('=').trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = Number(process.env.POPULATE_BATCH_SIZE || 500);
const TARGET_PRODUCTS = Number(process.env.TARGET_PRODUCTS || 5000);
const PRODUCTS_PER_BRANCH = Number(process.env.PRODUCTS_PER_BRANCH || 300);

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

const categoryImages = {
  despensa: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  lacteos: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
  panaderia: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  farmacia: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  aseo: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80',
  bebidas: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
  carnes: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
  frutas: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  cuidado: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  bebes: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
  mascotas: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
  congelados: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
};

const categories = [
  ['Despensa', 'despensa', 'ShoppingCart'],
  ['Lacteos', 'lacteos', 'Milk'],
  ['Panaderia', 'panaderia', 'ShoppingCart'],
  ['Farmacia', 'farmacia', 'Pill'],
  ['Aseo', 'aseo', 'Home'],
  ['Bebidas', 'bebidas', 'Wine'],
  ['Carnes y Huevos', 'carnes', 'Beef'],
  ['Frutas y Verduras', 'frutas', 'ShoppingCart'],
  ['Cuidado Personal', 'cuidado', 'ShoppingCart'],
  ['Bebes', 'bebes', 'Baby'],
  ['Mascotas', 'mascotas', 'Dog'],
  ['Congelados', 'congelados', 'ShoppingCart'],
];

const stores = [
  ['Exito', 'exito', 'Grupo Exito', 'Supermercado', 'https://www.exito.com', 1.06],
  ['Carulla', 'carulla', 'Grupo Exito', 'Supermercado', 'https://www.carulla.com', 1.14],
  ['Surtimax', 'surtimax', 'Grupo Exito', 'Supermercado', 'https://www.surtimax.com.co', 0.98],
  ['Super Inter', 'super-inter', 'Grupo Exito', 'Supermercado', 'https://www.superinter.com.co', 0.99],
  ['D1', 'd1', 'Tiendas D1', 'Supermercado', 'https://www.tiendasd1.com', 0.90],
  ['Ara', 'ara', 'Jeronimo Martins', 'Supermercado', 'https://www.ara.com.co', 0.93],
  ['Olimpica', 'olimpica', 'Olimpica', 'Supermercado', 'https://www.olimpica.com', 1.01],
  ['Jumbo', 'jumbo', 'Cencosud', 'Supermercado', 'https://www.jumbo.com.co', 1.08],
  ['Metro', 'metro', 'Cencosud', 'Supermercado', 'https://www.tiendasmetro.co', 1.02],
  ['Makro', 'makro', 'Makro', 'Supermercado', 'https://www.makro.com.co', 0.97],
  ['Farmatodo', 'farmatodo', 'Farmatodo', 'Farmacia', 'https://www.farmatodo.com.co', 1.07],
  ['Cruz Verde', 'cruz-verde', 'Cruz Verde', 'Farmacia', 'https://www.cruzverde.com.co', 1.03],
  ['La Rebaja', 'la-rebaja', 'La Rebaja', 'Farmacia', 'https://www.larebaja.com.co', 0.96],
  ['Pasteur', 'pasteur', 'Pasteur', 'Farmacia', 'https://www.drogueriaspasteur.com', 1.00],
  ['Locatel', 'locatel', 'Locatel', 'Farmacia', 'https://www.locatelcolombia.com', 1.05],
];

const cities = [
  ['Bogota', 'Cundinamarca', 4.7110, -74.0721, 15],
  ['Medellin', 'Antioquia', 6.2442, -75.5812, 14],
  ['Cali', 'Valle del Cauca', 3.4516, -76.5320, 14],
  ['Barranquilla', 'Atlantico', 10.9685, -74.7813, 13],
  ['Cartagena', 'Bolivar', 10.3910, -75.4794, 12],
  ['Bucaramanga', 'Santander', 7.1193, -73.1227, 12],
  ['Pereira', 'Risaralda', 4.8087, -75.6906, 10],
  ['Manizales', 'Caldas', 5.0703, -75.5138, 9],
  ['Armenia', 'Quindio', 4.5339, -75.6811, 8],
  ['Ibague', 'Tolima', 4.4389, -75.2322, 10],
  ['Villavicencio', 'Meta', 4.1420, -73.6266, 10],
  ['Santa Marta', 'Magdalena', 11.2408, -74.1990, 9],
  ['Monteria', 'Cordoba', 8.7479, -75.8814, 9],
  ['Sincelejo', 'Sucre', 9.3047, -75.3978, 8],
  ['Valledupar', 'Cesar', 10.4631, -73.2532, 8],
  ['Neiva', 'Huila', 2.9345, -75.2809, 9],
  ['Pasto', 'Narino', 1.2136, -77.2811, 8],
  ['Popayan', 'Cauca', 2.4448, -76.6147, 8],
  ['Tunja', 'Boyaca', 5.5353, -73.3678, 8],
  ['Cucuta', 'Norte de Santander', 7.8939, -72.5078, 10],
  ['Yopal', 'Casanare', 5.3378, -72.3959, 7],
  ['Riohacha', 'La Guajira', 11.5444, -72.9072, 6],
  ['Quibdo', 'Choco', 5.6947, -76.6611, 5],
  ['Florencia', 'Caqueta', 1.6144, -75.6062, 6],
  ['Mocoa', 'Putumayo', 1.1479, -76.6470, 5],
  ['San Andres', 'San Andres y Providencia', 12.5847, -81.7006, 4],
  ['Leticia', 'Amazonas', -4.2153, -69.9406, 4],
  ['Arauca', 'Arauca', 7.0847, -70.7591, 5],
  ['Inirida', 'Guainia', 3.8653, -67.9239, 3],
  ['San Jose del Guaviare', 'Guaviare', 2.5729, -72.6459, 4],
  ['Puerto Carreno', 'Vichada', 6.1890, -67.4859, 3],
  ['Mitú', 'Vaupes', 1.2578, -70.2347, 3],
  ['Palmira', 'Valle del Cauca', 3.5394, -76.3036, 8],
  ['Buenaventura', 'Valle del Cauca', 3.8801, -77.0312, 7],
  ['Soledad', 'Atlantico', 10.9184, -74.7646, 8],
  ['Envigado', 'Antioquia', 6.1719, -75.5917, 7],
  ['Bello', 'Antioquia', 6.3373, -75.5579, 7],
  ['Soacha', 'Cundinamarca', 4.5794, -74.2168, 8],
  ['Zipaquira', 'Cundinamarca', 5.0260, -74.0048, 6],
  ['Rionegro', 'Antioquia', 6.1552, -75.3737, 6],
];

const products = [
  ['Arroz Diana Premium 1 kg', 'Diana', 'despensa', 4200, 1000, null, 'g'],
  ['Arroz Roa Fortificado 1 kg', 'Roa', 'despensa', 3900, 1000, null, 'g'],
  ['Arroz Florhuila 1 kg', 'Florhuila', 'despensa', 4100, 1000, null, 'g'],
  ['Pasta Doria Spaghetti 500 g', 'Doria', 'despensa', 3600, 500, null, 'g'],
  ['Pasta La Muneca Fideos 250 g', 'La Muneca', 'despensa', 2100, 250, null, 'g'],
  ['Aceite Gourmet 900 ml', 'Gourmet', 'despensa', 12500, null, 900, 'ml'],
  ['Aceite Premier 900 ml', 'Premier', 'despensa', 11800, null, 900, 'ml'],
  ['Azucar Incauca 1 kg', 'Incauca', 'despensa', 4300, 1000, null, 'g'],
  ['Panela Dona Panela 500 g', 'Dona Panela', 'despensa', 3900, 500, null, 'g'],
  ['Sal Refisal 1 kg', 'Refisal', 'despensa', 2200, 1000, null, 'g'],
  ['Harina Pan Blanca 1 kg', 'P.A.N.', 'despensa', 7600, 1000, null, 'g'],
  ['Lenteja Don Pedro 500 g', 'Don Pedro', 'despensa', 5200, 500, null, 'g'],
  ['Frijol Cargamanto 500 g', 'Colombina', 'despensa', 6900, 500, null, 'g'],
  ['Garbanzo Bolsa 500 g', 'Granos del Campo', 'despensa', 5900, 500, null, 'g'],
  ['Atun Van Camps Aceite 160 g', 'Van Camps', 'despensa', 7200, 160, null, 'g'],
  ['Sardinas Isabel Tomate 425 g', 'Isabel', 'despensa', 8800, 425, null, 'g'],
  ['Chocolate Corona Pastilla 500 g', 'Corona', 'despensa', 9800, 500, null, 'g'],
  ['Cafe Sello Rojo 500 g', 'Sello Rojo', 'despensa', 18500, 500, null, 'g'],
  ['Cafe Aguila Roja 500 g', 'Aguila Roja', 'despensa', 17800, 500, null, 'g'],
  ['Avena Quaker Hojuelas 500 g', 'Quaker', 'despensa', 7600, 500, null, 'g'],
  ['Leche Entera Colanta 1 L', 'Colanta', 'lacteos', 3600, null, 1000, 'ml'],
  ['Leche Alqueria Entera 1 L', 'Alqueria', 'lacteos', 3700, null, 1000, 'ml'],
  ['Leche Alpina Deslactosada 1 L', 'Alpina', 'lacteos', 4300, null, 1000, 'ml'],
  ['Yogurt Alpina Fresa 1 L', 'Alpina', 'lacteos', 7200, null, 1000, 'ml'],
  ['Quesito Colanta 250 g', 'Colanta', 'lacteos', 9800, 250, null, 'g'],
  ['Mantequilla Alpina 250 g', 'Alpina', 'lacteos', 11200, 250, null, 'g'],
  ['Kumis Colanta 1 L', 'Colanta', 'lacteos', 6500, null, 1000, 'ml'],
  ['Avena Alpina Original 1 L', 'Alpina', 'lacteos', 5900, null, 1000, 'ml'],
  ['Pan Bimbo Integral 500 g', 'Bimbo', 'panaderia', 6400, 500, null, 'g'],
  ['Pan Tajado Comapan 500 g', 'Comapan', 'panaderia', 5900, 500, null, 'g'],
  ['Tostadas Bimbo 160 g', 'Bimbo', 'panaderia', 5200, 160, null, 'g'],
  ['Arepa Tela Antioquena x5', 'Dona Paisa', 'panaderia', 4300, null, null, 'unidad'],
  ['Galletas Ducales 294 g', 'Noel', 'panaderia', 6100, 294, null, 'g'],
  ['Galletas Festival Chocolate 403 g', 'Festival', 'panaderia', 8900, 403, null, 'g'],
  ['Huevos Santa Reyes x30', 'Santa Reyes', 'carnes', 16800, null, null, 'unidad'],
  ['Huevos Kikes AA x30', 'Kikes', 'carnes', 17500, null, null, 'unidad'],
  ['Pollo Campesino Entero kg', 'Campollo', 'carnes', 11800, 1000, null, 'g'],
  ['Pechuga de Pollo kg', 'Campollo', 'carnes', 16900, 1000, null, 'g'],
  ['Carne Molida Res kg', 'Zenú', 'carnes', 24900, 1000, null, 'g'],
  ['Salchicha Ranchera x10', 'Ranchera', 'carnes', 11200, null, null, 'unidad'],
  ['Jamon Pietran 230 g', 'Pietran', 'carnes', 15900, 230, null, 'g'],
  ['Coca-Cola 2.5 L', 'Coca-Cola', 'bebidas', 7800, null, 2500, 'ml'],
  ['Postobon Manzana 2.5 L', 'Postobon', 'bebidas', 6900, null, 2500, 'ml'],
  ['Agua Cristal 600 ml', 'Cristal', 'bebidas', 2100, null, 600, 'ml'],
  ['Jugo Hit Mango 1 L', 'Hit', 'bebidas', 5200, null, 1000, 'ml'],
  ['Pony Malta 330 ml x6', 'Pony Malta', 'bebidas', 13900, null, 1980, 'ml'],
  ['Te Hatsu Blanco 400 ml', 'Hatsu', 'bebidas', 4900, null, 400, 'ml'],
  ['Detergente FAB 1 kg', 'FAB', 'aseo', 9800, 1000, null, 'g'],
  ['Detergente Ariel 1 kg', 'Ariel', 'aseo', 14500, 1000, null, 'g'],
  ['Suavizante Suavitel 850 ml', 'Suavitel', 'aseo', 8400, null, 850, 'ml'],
  ['Blanqueador Clorox 1 L', 'Clorox', 'aseo', 5900, null, 1000, 'ml'],
  ['Lavaloza Axion Limon 450 g', 'Axion', 'aseo', 7200, 450, null, 'g'],
  ['Papel Higienico Familia x12', 'Familia', 'aseo', 28900, null, null, 'unidad'],
  ['Servilletas Familia x200', 'Familia', 'aseo', 5900, null, null, 'unidad'],
  ['Jabon Rey Barra 150 g', 'Rey', 'aseo', 4200, 150, null, 'g'],
  ['Crema Dental Colgate Triple Accion 75 ml', 'Colgate', 'cuidado', 6900, null, 75, 'ml'],
  ['Shampoo Head & Shoulders 375 ml', 'Head & Shoulders', 'cuidado', 24900, null, 375, 'ml'],
  ['Desodorante Rexona Roll On 50 ml', 'Rexona', 'cuidado', 8900, null, 50, 'ml'],
  ['Jabon Dove Barra 90 g', 'Dove', 'cuidado', 5200, 90, null, 'g'],
  ['Toallas Nosotras Buenas Noches x10', 'Nosotras', 'cuidado', 11900, null, null, 'unidad'],
  ['Panales Winny Etapa 4 x30', 'Winny', 'bebes', 47900, null, null, 'unidad'],
  ['Panales Huggies Etapa 4 x30', 'Huggies', 'bebes', 52900, null, null, 'unidad'],
  ['Panalitos Pequenin Etapa 3 x30', 'Pequenin', 'bebes', 48900, null, null, 'unidad'],
  ['Crema Cero Baby 110 g', 'Cero', 'bebes', 16900, 110, null, 'g'],
  ['Compota Alpina Manzana 113 g', 'Alpina', 'bebes', 3600, 113, null, 'g'],
  ['Acetaminofen MK 500 mg x30', 'MK', 'farmacia', 6800, null, null, 'unidad'],
  ['Acetaminofen Genfar 500 mg x100', 'Genfar', 'farmacia', 18800, null, null, 'unidad'],
  ['Ibuprofeno Genfar 400 mg x20', 'Genfar', 'farmacia', 8200, null, null, 'unidad'],
  ['Loratadina MK 10 mg x10', 'MK', 'farmacia', 5900, null, null, 'unidad'],
  ['Omeprazol Genfar 20 mg x14', 'Genfar', 'farmacia', 9800, null, null, 'unidad'],
  ['Suero Oral Pedialyte 500 ml', 'Pedialyte', 'farmacia', 11900, null, 500, 'ml'],
  ['Vitamina C MK 500 mg x30', 'MK', 'farmacia', 15800, null, null, 'unidad'],
  ['Alcohol Antiseptico JGB 700 ml', 'JGB', 'farmacia', 8900, null, 700, 'ml'],
  ['Tapabocas Desechable x50', 'Mediprotec', 'farmacia', 14900, null, null, 'unidad'],
  ['Ensure Vainilla 400 g', 'Ensure', 'farmacia', 58900, 400, null, 'g'],
  ['Manzana Roja kg', 'Campo Vivo', 'frutas', 8900, 1000, null, 'g'],
  ['Banano Criollo kg', 'Campo Vivo', 'frutas', 3900, 1000, null, 'g'],
  ['Papa Pastusa kg', 'Campo Vivo', 'frutas', 3200, 1000, null, 'g'],
  ['Tomate Chonto kg', 'Campo Vivo', 'frutas', 4200, 1000, null, 'g'],
  ['Cebolla Cabezona kg', 'Campo Vivo', 'frutas', 3900, 1000, null, 'g'],
  ['Zanahoria kg', 'Campo Vivo', 'frutas', 2900, 1000, null, 'g'],
  ['Aguacate Hass kg', 'Campo Vivo', 'frutas', 11900, 1000, null, 'g'],
  ['Alimento Dog Chow Adultos 2 kg', 'Dog Chow', 'mascotas', 32900, 2000, null, 'g'],
  ['Alimento Chunky Adultos 2 kg', 'Chunky', 'mascotas', 28900, 2000, null, 'g'],
  ['Alimento Whiskas Gato 1 kg', 'Whiskas', 'mascotas', 23900, 1000, null, 'g'],
  ['Arena Sanitaria Gatos 4 kg', 'Minino', 'mascotas', 21900, 4000, null, 'g'],
  ['Helado Crem Helado Vainilla 1 L', 'Crem Helado', 'congelados', 18900, null, 1000, 'ml'],
  ['Papas McCain Francesa 1 kg', 'McCain', 'congelados', 16900, 1000, null, 'g'],
  ['Nuggets Pollo Zenú 400 g', 'Zenú', 'congelados', 17900, 400, null, 'g'],
  ['Pizza Ristorante Mozzarella 335 g', 'Ristorante', 'congelados', 21900, 335, null, 'g'],
];

const variantWords = [
  'Ahorro', 'Familiar', 'Premium', 'Clasico', 'Integral', 'Natural', 'Original', 'Maxi',
  'Doble Rendimiento', 'Seleccion', 'Tradicional', 'Especial', 'Hogar', 'Plus', 'Economico',
];

const presentationWords = ['250 g', '400 g', '500 g', '750 g', '1 kg', '1.5 kg', '900 ml', '1 L', '1.5 L', '2 L', 'x6', 'x12'];

while (products.length < TARGET_PRODUCTS) {
  const base = products[products.length % 84];
  const suffix = products.length + 1;
  const variant = variantWords[suffix % variantWords.length];
  const presentation = presentationWords[suffix % presentationWords.length];
  const baseName = base[0].replace(/\s(\d+(\.\d+)?\s?(kg|g|ml|l)|x\d+)$/i, '');
  const price = Math.round(base[3] * (0.72 + (suffix % 17) / 20));
  products.push([`${baseName} ${variant} ${presentation} Ref ${suffix}`, base[1], base[2], price, base[4], base[5], base[6]]);
}

function uuid(input) {
  const hex = crypto.createHash('sha1').update(`ahorroya:${input}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

function barcode(index) {
  return `7709${String(index + 1).padStart(9, '0')}`.slice(0, 13);
}

function jitter(value, index, scale) {
  return Number((value + (((index % 11) - 5) * scale)).toFixed(7));
}

async function rest(pathname, { method = 'GET', body, prefer, returnMinimal = false } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${pathname}: ${text}`);
  }
  if (returnMinimal || !text) return null;
  return JSON.parse(text);
}

async function upsertBatch(table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams({ on_conflict: onConflict });
    await rest(`${table}?${params.toString()}`, {
      method: 'POST',
      body: batch,
      prefer: 'resolution=merge-duplicates,return=minimal',
      returnMinimal: true,
    });
    console.log(`${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
}

function withoutId(rows) {
  return rows.map(({ id, ...row }) => row);
}

async function insertBatch(table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await rest(table, {
      method: 'POST',
      body: batch,
      prefer: 'return=minimal',
      returnMinimal: true,
    });
    console.log(`${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
}

async function fetchIdMap(table, slugs) {
  const map = {};
  for (let i = 0; i < slugs.length; i += 80) {
    const slice = slugs.slice(i, i + 80);
    const params = new URLSearchParams({
      select: 'id,slug',
      slug: `in.(${slice.map((item) => `"${item}"`).join(',')})`,
    });
    const rows = await rest(`${table}?${params.toString()}`);
    for (const row of rows || []) map[row.slug] = row.id;
  }
  return map;
}

function buildBaseRows() {
  const brandRows = new Map();
  const categoryRows = categories.map(([name, categorySlug, icon]) => ({
    id: uuid(`category:${categorySlug}`),
    name,
    slug: categorySlug,
    icon,
    level: 0,
  }));

  for (const [, brand] of products.map((item) => [item[0], item[1]])) {
    const brandSlug = slug(brand);
    brandRows.set(brandSlug, {
      id: uuid(`brand:${brandSlug}`),
      name: brand,
      slug: brandSlug,
      country: 'Colombia',
    });
  }

  const storeRows = stores.map(([name, storeSlug, chain, category, website]) => ({
    id: uuid(`store:${storeSlug}`),
    name,
    slug: storeSlug,
    brand: name,
    chain,
    category,
    website,
    status: 'active',
  }));

  return { brands: [...brandRows.values()], categories: categoryRows, stores: storeRows };
}

function buildProductRows(brandIds, categoryIds) {
  return products.map((item, index) => {
    const [name, brand, categorySlug, , weight, volume, unit] = item;
    const brandSlug = slug(brand);
    const productSlug = slug(name);
    const ean = barcode(index);
    return {
      id: uuid(`product:${productSlug}`),
      name,
      slug: productSlug,
      short_name: name.slice(0, 150),
      commercial_name: name,
      brand_id: brandIds[brandSlug],
      category_id: categoryIds[categorySlug],
      barcode: ean,
      ean,
      weight,
      volume,
      unit,
      image: categoryImages[categorySlug],
      status: 'active',
    };
  });
}

function buildBranchRows(storeIds) {
  const branchRows = [];
  let branchIndex = 0;
  for (const [city, department, lat, lon, coverage] of cities) {
    const selectedStores = stores.slice(0, Math.min(coverage, stores.length));
    for (const [storeName, storeSlug] of selectedStores) {
      branchIndex++;
      const branchSlug = `${storeSlug}-${slug(city)}-${branchIndex}`;
      branchRows.push({
        id: uuid(`branch:${branchSlug}`),
        store_id: storeIds[storeSlug],
        name: `${storeName} ${city}`,
        code: `${storeSlug.toUpperCase().slice(0, 4)}-${slug(city).toUpperCase().slice(0, 8)}-${String(branchIndex).padStart(3, '0')}`,
        address: `Sede ${city} ${branchIndex}`,
        city,
        department,
        latitude: jitter(lat, branchIndex, 0.006),
        longitude: jitter(lon, branchIndex * 3, 0.006),
        services: ['domicilio', 'recogida', 'comparador'],
        has_parking: branchIndex % 3 === 0,
        has_accessibility: true,
        status: 'active',
      });
    }
  }
  return branchRows;
}

function buildImageRows(productRows, productIds) {
  return productRows.map((product) => ({
    master_product_id: productIds[product.slug],
    url: product.image,
    thumbnail_url: product.image,
    alt: product.name,
    is_primary: true,
  }));
}

function buildListingRows(branchRows, productRows, productIds, storeIds) {
  const storeSlugById = Object.fromEntries(Object.entries(storeIds).map(([storeSlug, id]) => [id, storeSlug]));
  const storeBySlug = Object.fromEntries(stores.map((store) => [store[1], store]));
  const productBySlug = Object.fromEntries(products.map((item) => [slug(item[0]), item]));
  const storeProductRows = [];
  for (const branch of branchRows) {
    const storeSlug = storeSlugById[branch.store_id] || stores.find((item) => item[1] === 'exito')[1];
    const store = storeBySlug[storeSlug] || stores.find((item) => item[1] === 'exito');
    const coefficient = store?.[5] || 1;
    const offset = parseInt(branch.id.slice(0, 2), 16) % productRows.length;
    const productsForBranch = Array.from({ length: PRODUCTS_PER_BRANCH }, (_, i) => productRows[(offset + i) % productRows.length]);
    for (const product of productsForBranch) {
      const base = productBySlug[product.slug]?.[3] || 5000;
      const variance = 0.92 + ((parseInt(product.id.slice(0, 2), 16) + parseInt(branch.id.slice(0, 2), 16)) % 18) / 100;
      const price = Math.max(500, Math.round((base * coefficient * variance) / 50) * 50);
      const originalPrice = price < base * 1.08 ? Math.round((price * 1.08) / 50) * 50 : null;
      const productId = productIds[product.slug];
      storeProductRows.push({
        id: uuid(`listing:${productId}:${branch.id}`),
        master_product_id: productId,
        store_id: branch.store_id,
        branch_id: branch.id,
        sku: `${branch.code}-${product.slug.slice(0, 40)}`,
        price,
        original_price: originalPrice,
        available: true,
        stock: 20 + (parseInt(product.id.slice(2, 4), 16) % 180),
        url: store?.[4] || null,
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  return storeProductRows;
}

function buildHistoryRows(storeProductRows) {
  return storeProductRows.map((row) => ({
    store_product_id: row.id,
    price: row.price,
    available: row.available,
    captured_at: new Date().toISOString(),
  }));
}

async function count(table) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    method: 'HEAD',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'count=exact',
    },
  });
  return response.headers.get('content-range') || 'unknown';
}

async function main() {
  const baseRows = buildBaseRows();
  console.log('Poblacion objetivo:', {
    brands: baseRows.brands.length,
    categories: baseRows.categories.length,
    products: products.length,
    stores: baseRows.stores.length,
    cities: cities.length,
  });

  await upsertBatch('brands', withoutId(baseRows.brands), 'slug');
  await upsertBatch('categories', withoutId(baseRows.categories), 'slug');
  await upsertBatch('stores', withoutId(baseRows.stores), 'slug');

  const brandIds = await fetchIdMap('brands', baseRows.brands.map((row) => row.slug));
  const categoryIds = await fetchIdMap('categories', baseRows.categories.map((row) => row.slug));
  const storeIds = await fetchIdMap('stores', baseRows.stores.map((row) => row.slug));

  const productRows = buildProductRows(brandIds, categoryIds);
  await upsertBatch('master_products', withoutId(productRows), 'slug');
  const productIds = await fetchIdMap('master_products', productRows.map((row) => row.slug));

  const branchRows = buildBranchRows(storeIds);
  await upsertBatch('branches', branchRows, 'id');
  await upsertBatch('product_images', buildImageRows(productRows, productIds), 'master_product_id,url');

  const listings = buildListingRows(branchRows, productRows, productIds, storeIds);
  const history = buildHistoryRows(listings);
  await upsertBatch('store_products', listings, 'master_product_id,store_id,branch_id');
  if (process.env.SKIP_PRICE_HISTORY !== '1') {
    await insertBatch('store_product_history', history);
  }

  const summary = {};
  for (const table of ['brands', 'categories', 'master_products', 'stores', 'branches', 'store_products', 'store_product_history', 'product_images']) {
    summary[table] = await count(table);
  }
  console.log('Resumen Supabase:', summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
