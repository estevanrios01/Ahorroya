import { NormalizerPipeline } from '../../packages/normalization-engine/src/pipeline';
import { HybridStrategy } from '../../packages/matching-engine/src/score';
import { QualityScorer } from '../../packages/quality-engine/src/scorer';

const normalizer = new NormalizerPipeline();
const matcher = new HybridStrategy();
const scorer = new QualityScorer();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ahorroya.vercel.app';

const MASTER_CATALOG = new Map();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractNumbers(name) {
  const nums = name.match(/\d+/g);
  return nums ? nums.map(Number) : [];
}

function extractUnit(name) {
  const match = name.match(/(\d+)\s*(ml|l|lt|g|gr|kg|mg|unidad|tableta|capsula|sobre|bolsa)\b/i);
  if (match) {
    const unitMap = { ml: 'ml', l: 'L', lt: 'L', g: 'g', gr: 'g', kg: 'kg', mg: 'mg' };
    return {
      quantity: parseInt(match[1]),
      unit: unitMap[match[2].toLowerCase()] || match[2].toLowerCase(),
    };
  }
  return null;
}

const SYNONYM_MAP = {
  'acetaminofen': ['paracetamol', 'dolex', 'tempra'],
  'ibuprofeno': ['motrin', 'advil', 'dolofen'],
  'dolex': ['acetaminofen', 'paracetamol', 'tempra'],
  'arroz': ['arroz'],
  'leche': ['leche', 'lacteo', 'lacteos', 'lactea'],
  'pan': ['pan', 'panaderia', 'panes'],
  'aceite': ['aceite', 'aceites', 'oleico'],
  'jabon': ['jabon', 'jabones', 'aseo personal'],
  'shampoo': ['shampoo', 'champu', 'shampú'],
  'detergente': ['detergente', 'jabon ropa', 'lavaloza'],
  'gaseosa': ['gaseosa', 'soda', 'refresco', 'bebida'],
  'cerveza': ['cerveza', 'cerveza', 'cerveza artesanal'],
  'cafe': ['cafe', 'café', 'cafe colombiano'],
  'arepas': ['arepas', 'arepa', 'pan de maiz'],
  'huevos': ['huevos', 'huevo', 'huevos frescos'],
  'pollo': ['pollo', 'pollo fresco', 'pollo congelado'],
  'carne': ['carne', 'carnes', 'carne de res'],
  'pescado': ['pescado', 'pescados', 'pescado fresco'],
};

function expandSynonyms(name) {
  const lower = name.toLowerCase();
  const expansions = [name];
  for (const [word, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (lower.includes(word)) {
      for (const syn of synonyms) {
        expansions.push(name.replace(new RegExp(word, 'gi'), syn));
      }
    }
  }
  return [...new Set(expansions)];
}

function buildPresentationInfo(name) {
  const unit = extractUnit(name);
  const nums = extractNumbers(name);
  return {
    quantity: unit?.quantity || (nums.length > 0 ? nums[0] : null),
    unit: unit?.unit || null,
    hasTablets: /\b(x\s*\d+|tableta|capsula|gragea|comp)\b/i.test(name),
    tabletCount: (() => {
      const m = name.match(/x\s*(\d+)/i);
      return m ? parseInt(m[1]) : null;
    })(),
    weight: unit?.unit === 'g' || unit?.unit === 'kg' ? `${unit.quantity}${unit.unit}` : null,
    volume: unit?.unit === 'ml' || unit?.unit === 'L' ? `${unit.quantity}${unit.unit}` : null,
  };
}

const PRODUCT_DB = [
  {
    id: '1', name: 'Arroz Diana Premium 1kg', brand: 'Diana', slug: 'arroz-diana-premium',
    category: 'Despensa', barcode: '7702010000011', description: 'Arroz blanco premium 100% colombiano 1kg.',
    image: null, tags: ['popular', 'despensa basica'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 4200, oldPrice: 4800, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 3800, oldPrice: 4500, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Olímpica', storeSlug: 'olimpica', price: 4500, distance: 2.1, available: true, address: 'Av Pasoancho # 50-12' },
      { store: 'Ara', storeSlug: 'ara', price: 3950, distance: 0.8, available: true, address: 'Calle 70 # 5-20' },
      { store: 'Jumbo', storeSlug: 'jumbo', price: 4100, oldPrice: 4700, distance: 3.0, available: true, address: 'Carrera 98 # 42-30' },
      { store: 'Carulla', storeSlug: 'carulla', price: 4350, distance: 2.5, available: true, address: 'Av 3N # 25-50' },
    ],
  },
  {
    id: '2', name: 'Arroz Roa Fortificado 1kg', brand: 'Roa', slug: 'arroz-roa-fortificado',
    category: 'Despensa', barcode: '7702010000028', description: 'Arroz fortificado con vitaminas y minerales 1kg.',
    image: null, tags: ['popular'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 3800, oldPrice: 4200, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 3400, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Olímpica', storeSlug: 'olimpica', price: 4100, distance: 2.1, available: true, address: 'Av Pasoancho # 50-12' },
    ],
  },
  {
    id: '3', name: 'Leche Entera Colanta 1L', brand: 'Colanta', slug: 'leche-entera-colanta',
    category: 'Lácteos', barcode: '7702010000035', description: 'Leche entera pasteurizada 1 litro.',
    image: null, tags: ['popular', 'despensa basica'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 2800, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 2600, oldPrice: 3200, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Ara', storeSlug: 'ara', price: 2750, distance: 0.8, available: true, address: 'Calle 70 # 5-20' },
      { store: 'Carulla', storeSlug: 'carulla', price: 2950, distance: 2.5, available: true, address: 'Av 3N # 25-50' },
    ],
  },
  {
    id: '4', name: 'Aceite Vegetal Gourmet 900ml', brand: 'Gourmet', slug: 'aceite-gourmet-900ml',
    category: 'Despensa', barcode: '7702010000042', description: 'Aceite vegetal 100% de palma 900ml.',
    image: null, tags: ['despensa basica'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 12500, oldPrice: 14800, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'Olímpica', storeSlug: 'olimpica', price: 13200, distance: 2.1, available: true, address: 'Av Pasoancho # 50-12' },
      { store: 'Jumbo', storeSlug: 'jumbo', price: 12800, distance: 3.0, available: true, address: 'Carrera 98 # 42-30' },
    ],
  },
  {
    id: '5', name: 'Pan Bimbo Artesano 500g', brand: 'Bimbo', slug: 'pan-bimbo-artesano',
    category: 'Panadería', barcode: '7702010000059', description: 'Pan blanco artesanal 500g.',
    image: null, tags: ['popular'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 5200, oldPrice: 6100, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 4800, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Ara', storeSlug: 'ara', price: 5100, distance: 0.8, available: true, address: 'Calle 70 # 5-20' },
    ],
  },
  {
    id: '6', name: 'Acetaminofén MK 500mg x30', brand: 'MK', slug: 'acetaminofen-mk-500mg',
    category: 'Medicamentos OTC', barcode: '7702010000066', description: 'Acetaminofén 500mg, tableta x 30.',
    image: null, tags: ['farmacia', 'medicamento'],
    prices: [
      { store: 'Cruz Verde', storeSlug: 'cruz-verde', price: 2850, oldPrice: 3600, distance: 0.3, available: true, address: 'Cra 66 # 5-45' },
      { store: 'Farmatodo', storeSlug: 'farmatodo', price: 2980, distance: 0.7, available: true, address: 'Calle 5 # 37-12' },
      { store: 'La Rebaja', storeSlug: 'la-rebaja', price: 3120, distance: 1.1, available: true, address: 'Av 3N # 23-40' },
      { store: 'Éxito', storeSlug: 'exito', price: 3200, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
    ],
  },
  {
    id: '7', name: 'Jabón Líquido Rey 500ml', brand: 'Rey', slug: 'jabon-liquido-rey',
    category: 'Aseo', barcode: '7702010000073', description: 'Jabón líquido antibacterial 500ml.',
    image: null, tags: ['aseo'],
    prices: [
      { store: 'D1', storeSlug: 'd1', price: 4800, oldPrice: 5900, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Éxito', storeSlug: 'exito', price: 5200, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'Ara', storeSlug: 'ara', price: 4950, distance: 0.8, available: true, address: 'Calle 70 # 5-20' },
    ],
  },
  {
    id: '8', name: 'Huevos Santa Reyes x30', brand: 'Santa Reyes', slug: 'huevos-santa-reyes-x30',
    category: 'Despensa', barcode: '7702010000080', description: 'Huevos de gallina libres de jaula x30.',
    image: null, tags: ['popular', 'despensa basica'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 14200, oldPrice: 16800, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 13800, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Jumbo', storeSlug: 'jumbo', price: 14500, distance: 3.0, available: true, address: 'Carrera 98 # 42-30' },
    ],
  },
  {
    id: '9', name: 'Café Sello Rojo 500g', brand: 'Sello Rojo', slug: 'cafe-sello-rojo-500g',
    category: 'Despensa', barcode: '7702010000097', description: 'Café tostado y molido 100% colombiano 500g.',
    image: null, tags: ['popular', 'cafe'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 8900, oldPrice: 10200, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 8500, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Olímpica', storeSlug: 'olimpica', price: 9200, distance: 2.1, available: true, address: 'Av Pasoancho # 50-12' },
      { store: 'Ara', storeSlug: 'ara', price: 8700, distance: 0.8, available: true, address: 'Calle 70 # 5-20' },
    ],
  },
  {
    id: '10', name: 'Ibuprofeno MK 400mg x20', brand: 'MK', slug: 'ibuprofeno-mk-400mg',
    category: 'Medicamentos OTC', barcode: '7702010000103', description: 'Ibuprofeno 400mg, tableta x 20.',
    image: null, tags: ['farmacia', 'medicamento'],
    prices: [
      { store: 'Cruz Verde', storeSlug: 'cruz-verde', price: 5200, oldPrice: 6200, distance: 0.3, available: true, address: 'Cra 66 # 5-45' },
      { store: 'Farmatodo', storeSlug: 'farmatodo', price: 5400, distance: 0.7, available: true, address: 'Calle 5 # 37-12' },
      { store: 'La Rebaja', storeSlug: 'la-rebaja', price: 5600, distance: 1.1, available: true, address: 'Av 3N # 23-40' },
    ],
  },
  {
    id: '11', name: 'Detergente FAB 1kg', brand: 'FAB', slug: 'detergente-fab-1kg',
    category: 'Aseo', barcode: '7702010000110', description: 'Detergente en polvo para ropa 1kg.',
    image: null, tags: ['aseo'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 8200, oldPrice: 9500, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 7800, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Ara', storeSlug: 'ara', price: 7900, distance: 0.8, available: true, address: 'Calle 70 # 5-20' },
    ],
  },
  {
    id: '12', name: 'Gaseosa Coca-Cola 2.5L', brand: 'Coca-Cola', slug: 'coca-cola-25l',
    category: 'Bebidas', barcode: '7702010000127', description: 'Gaseosa Coca-Cola original 2.5 litros.',
    image: null, tags: ['bebidas', 'popular'],
    prices: [
      { store: 'Éxito', storeSlug: 'exito', price: 5200, distance: 1.2, available: true, address: 'Calle 5 # 38D-35' },
      { store: 'D1', storeSlug: 'd1', price: 4800, oldPrice: 5500, distance: 0.5, available: true, address: 'Carrera 100 # 11-60' },
      { store: 'Olímpica', storeSlug: 'olimpica', price: 5400, distance: 2.1, available: true, address: 'Av Pasoancho # 50-12' },
      { store: 'Jumbo', storeSlug: 'jumbo', price: 5100, distance: 3.0, available: true, address: 'Carrera 98 # 42-30' },
      { store: 'Ara', storeSlug: 'ara', price: 4900, distance: 0.8, available: true, address: 'Calle 70 # 5-20' },
    ],
  },
];

const STORE_DB = [
  { id: 'exito', name: 'Almacenes Éxito', slug: 'exito', type: 'supermercado', color: 'bg-blue-600', logo: null,
    description: 'La cadena de supermercados líder en Colombia con presencia nacional.',
    services: ['Despensa', 'Carnes', 'Lácteos', 'Aseo', 'Farmacia'], schedule: '7:00 - 22:00', phone: '01-8000-123-456',
    productsCount: 8, branches: 5 },
  { id: 'd1', name: 'Tiendas D1', slug: 'd1', type: 'supermercado', color: 'bg-red-600', logo: null,
    description: 'Tiendas de descuento con los mejores precios del mercado.',
    services: ['Despensa', 'Lácteos', 'Aseo'], schedule: '8:00 - 21:00', phone: null,
    productsCount: 6, branches: 12 },
  { id: 'jumbo', name: 'Jumbo', slug: 'jumbo', type: 'supermercado', color: 'bg-orange-600', logo: null,
    description: 'Hipermercado con la más amplia variedad de productos.',
    services: ['Despensa', 'Carnes', 'Lácteos', 'Aseo', 'Panadería', 'Bebidas'], schedule: '7:00 - 22:00', phone: '01-8000-234-567',
    productsCount: 4, branches: 3 },
  { id: 'olimpica', name: 'Supermercados Olímpica', slug: 'olimpica', type: 'supermercado', color: 'bg-yellow-600', logo: null,
    description: 'Supermercados con la mejor relación calidad-precio.',
    services: ['Despensa', 'Carnes', 'Lácteos', 'Aseo', 'Panadería'], schedule: '7:00 - 22:00', phone: null,
    productsCount: 5, branches: 4 },
  { id: 'ara', name: 'Ara', slug: 'ara', type: 'supermercado', color: 'bg-green-600', logo: null,
    description: 'Tiendas de descuento con precios bajos todos los días.',
    services: ['Despensa', 'Lácteos', 'Aseo', 'Bebidas'], schedule: '8:00 - 21:00', phone: null,
    productsCount: 5, branches: 8 },
  { id: 'carulla', name: 'Carulla', slug: 'carulla', type: 'supermercado', color: 'bg-teal-600', logo: null,
    description: 'Supermercados con productos frescos y gourmet.',
    services: ['Despensa', 'Carnes', 'Lácteos', 'Panadería', 'Bebidas'], schedule: '7:00 - 22:00', phone: null,
    productsCount: 2, branches: 3 },
  { id: 'cruz-verde', name: 'Cruz Verde', slug: 'cruz-verde', type: 'farmacia', color: 'bg-emerald-600', logo: null,
    description: 'Cadena de farmacias líder en Colombia con más de 2000 sucursales.',
    services: ['Medicamentos', 'Cuidado Personal', 'Dermocosmética'], schedule: '24 horas', phone: '01-8000-345-678',
    productsCount: 2, branches: 15 },
  { id: 'farmatodo', name: 'Farmatodo', slug: 'farmatodo', type: 'farmacia', color: 'bg-green-500', logo: null,
    description: 'Farmacias con todo en salud, belleza y bienestar.',
    services: ['Medicamentos', 'Cuidado Personal', 'Belleza', 'Bebés'], schedule: '7:00 - 22:00', phone: null,
    productsCount: 2, branches: 10 },
  { id: 'la-rebaja', name: 'La Rebaja', slug: 'la-rebaja', type: 'farmacia', color: 'bg-red-500', logo: null,
    description: 'Farmacias con los mejores precios en medicamentos.',
    services: ['Medicamentos', 'Cuidado Personal'], schedule: '8:00 - 21:00', phone: null,
    productsCount: 2, branches: 8 },
];

const CATEGORY_DB = [
  { id: 'despensa', name: 'Despensa', slug: 'despensa', icon: 'ShoppingCart', productCount: 5, description: 'Arroz, aceite, café y más alimentos de tu despensa.' },
  { id: 'farmacia', name: 'Farmacia', slug: 'farmacia', icon: 'Pill', productCount: 2, description: 'Medicamentos OTC y de cuidado personal.' },
  { id: 'lacteos', name: 'Lácteos', slug: 'lacteos', icon: 'Milk', productCount: 1, description: 'Leche, yogures, quesos y derivados lácteos.' },
  { id: 'panaderia', name: 'Panadería', slug: 'panaderia', icon: 'Beef', productCount: 1, description: 'Pan fresco, artesanal y productos de panadería.' },
  { id: 'aseo', name: 'Aseo', slug: 'aseo', icon: 'Home', productCount: 2, description: 'Jabones, detergentes y productos de limpieza.' },
  { id: 'medicamentos-otc', name: 'Medicamentos OTC', slug: 'medicamentos-otc', icon: 'Pill', productCount: 2, description: 'Acetaminofén, ibuprofeno y más medicamentos de venta libre.' },
  { id: 'bebidas', name: 'Bebidas', slug: 'bebidas', icon: 'Wine', productCount: 1, description: 'Gaseosas, jugos y bebidas refrescantes.' },
  { id: 'mercado', name: 'Mercado', slug: 'mercado', icon: 'ShoppingCart', productCount: 0, description: 'Todo tu mercado en un solo lugar.' },
  { id: 'carnes', name: 'Carnes', slug: 'carnes', icon: 'Beef', productCount: 0, description: 'Carnes frías, embutidos y productos cárnicos.' },
  { id: 'bebes', name: 'Bebés', slug: 'bebes', icon: 'Baby', productCount: 0, description: 'Pañales, leche fórmula y cuidado para bebés.' },
  { id: 'mascotas', name: 'Mascotas', slug: 'mascotas', icon: 'Dog', productCount: 0, description: 'Alimento y accesorios para tu mascota.' },
];

export async function getProductBySlug(slug) {
  const product = PRODUCT_DB.find(p => p.slug === slug);
  if (!product) return null;

  const normalized = normalizer.normalizeFull(product.name);
  const presentation = buildPresentationInfo(product.name);

  const prices = [...product.prices].sort((a, b) => a.price - b.price);
  const bestPrice = prices[0];
  const avgPrice = Math.round(prices.reduce((sum, p) => sum + p.price, 0) / prices.length);
  const pricesOnly = prices.map(p => p.price);
  const minPrice = Math.min(...pricesOnly);
  const maxPrice = Math.max(...pricesOnly);

  return {
    ...product,
    normalizedName: normalized.normalized,
    presentation,
    price: bestPrice.price,
    bestPrice: bestPrice.price,
    bestStore: bestPrice.store,
    avgPrice,
    minPrice,
    maxPrice,
    priceRange: maxPrice - minPrice,
    savingsPercent: bestPrice.oldPrice
      ? Math.round(((bestPrice.oldPrice - bestPrice.price) / bestPrice.oldPrice) * 100)
      : 0,
    prices,
    storesCount: prices.length,
    totalStores: prices.length,
    synonyms: expandSynonyms(product.name),
    aliases: expandSynonyms(product.name),
  };
}

export async function getAllProducts() {
  const products = await Promise.all(
    PRODUCT_DB.map(p => getProductBySlug(p.slug))
  );
  return products.filter(Boolean);
}

export async function searchProducts(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  const results = await getAllProducts();
  return results
    .map(p => {
      const normalized = normalizer.normalize(p.name);
      const queryNorm = normalizer.normalize(q);
      const nameMatch = normalized.includes(queryNorm) || queryNorm.includes(normalized);
      const brandMatch = p.brand.toLowerCase().includes(q);
      const synonymMatch = p.synonyms.some(s => s.toLowerCase().includes(q));
      const categoryMatch = p.category?.toLowerCase().includes(q);
      const tagMatch = p.tags?.some(t => t.includes(q));

      const score = [
        nameMatch ? 100 : 0,
        brandMatch ? 80 : 0,
        synonymMatch ? 70 : 0,
        categoryMatch ? 50 : 0,
        tagMatch ? 40 : 0,
      ].reduce((a, b) => Math.max(a, b), 0);

      return { ...p, searchScore: score };
    })
    .filter(p => p.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore);
}

export async function getProductsByStore(storeSlug) {
  const products = await getAllProducts();
  return products.filter(p =>
    p.prices.some(pr => pr.storeSlug === storeSlug)
  ).map(p => ({
    ...p,
    storePrice: p.prices.find(pr => pr.storeSlug === storeSlug),
  }));
}

export async function getProductsByCategory(categorySlug) {
  const products = await getAllProducts();
  return products.filter(p =>
    slugify(p.category) === categorySlug
  );
}

export async function getStore(slug) {
  return STORE_DB.find(s => s.slug === slug) || null;
}

export async function getAllStores() {
  return STORE_DB;
}

export async function getStoresByType(type) {
  return STORE_DB.filter(s => s.type === type);
}

export async function getCategory(slug) {
  return CATEGORY_DB.find(c => c.slug === slug) || null;
}

export async function getAllCategories() {
  return CATEGORY_DB;
}

const CITIES_DB = [
  { name: 'Cali', slug: 'cali', department: 'Valle del Cauca', departmentSlug: 'valle-del-cauca', stores: 45, products: 12500, description: 'Encuentra los mejores precios en supermercados y farmacias de Cali.' },
  { name: 'Bogotá', slug: 'bogota', department: 'Cundinamarca', departmentSlug: 'cundinamarca', stores: 120, products: 35000, description: 'Compara precios en supermercados y farmacias de Bogotá.' },
  { name: 'Medellín', slug: 'medellin', department: 'Antioquia', departmentSlug: 'antioquia', stores: 85, products: 28000, description: 'Encuentra los mejores precios en Medellín.' },
  { name: 'Barranquilla', slug: 'barranquilla', department: 'Atlántico', departmentSlug: 'atlantico', stores: 35, products: 8900, description: 'Compara precios en supermercados y farmacias de Barranquilla.' },
  { name: 'Cartagena', slug: 'cartagena', department: 'Bolívar', departmentSlug: 'bolivar', stores: 28, products: 7200, description: 'Encuentra los mejores precios en Cartagena.' },
  { name: 'Bucaramanga', slug: 'bucaramanga', department: 'Santander', departmentSlug: 'santander', stores: 30, products: 8100, description: 'Compara precios en Bucaramanga.' },
  { name: 'Pereira', slug: 'pereira', department: 'Risaralda', departmentSlug: 'risaralda', stores: 20, products: 5400, description: 'Encuentra los mejores precios en Pereira.' },
  { name: 'Manizales', slug: 'manizales', department: 'Caldas', departmentSlug: 'caldas', stores: 18, products: 4800, description: 'Compara precios en Manizales.' },
  { name: 'Ibagué', slug: 'ibague', department: 'Tolima', departmentSlug: 'tolima', stores: 22, products: 5600, description: 'Encuentra los mejores precios en Ibagué.' },
  { name: 'Cúcuta', slug: 'cucuta', department: 'Norte de Santander', departmentSlug: 'norte-de-santander', stores: 15, products: 3900, description: 'Compara precios en Cúcuta.' },
  { name: 'Villavicencio', slug: 'villavicencio', department: 'Meta', departmentSlug: 'meta', stores: 12, products: 3100, description: 'Encuentra los mejores precios en Villavicencio.' },
  { name: 'Santa Marta', slug: 'santa-marta', department: 'Magdalena', departmentSlug: 'magdalena', stores: 14, products: 3600, description: 'Compara precios en Santa Marta.' },
  { name: 'Neiva', slug: 'neiva', department: 'Huila', departmentSlug: 'huila', stores: 10, products: 2600, description: 'Encuentra los mejores precios en Neiva.' },
  { name: 'Pasto', slug: 'pasto', department: 'Nariño', departmentSlug: 'narnio', stores: 11, products: 2800, description: 'Compara precios en Pasto.' },
  { name: 'Armenia', slug: 'armenia', department: 'Quindío', departmentSlug: 'quindio', stores: 9, products: 2300, description: 'Encuentra los mejores precios en Armenia.' },
];

const DEPARTMENTS_DB = [
  { name: 'Valle del Cauca', slug: 'valle-del-cauca', cities: ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Yumbo'], stores: 65, products: 18000, description: 'Compara precios en supermercados y farmacias del Valle del Cauca.' },
  { name: 'Cundinamarca', slug: 'cundinamarca', cities: ['Bogotá', 'Soacha', 'Zipaquirá', 'Chía', 'Facatativá'], stores: 140, products: 40000, description: 'Encuentra los mejores precios en Cundinamarca.' },
  { name: 'Antioquia', slug: 'antioquia', cities: ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro'], stores: 95, products: 31000, description: 'Compara precios en supermercados y farmacias de Antioquia.' },
  { name: 'Atlántico', slug: 'atlantico', cities: ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia'], stores: 40, products: 10000, description: 'Encuentra los mejores precios en el Atlántico.' },
  { name: 'Bolívar', slug: 'bolivar', cities: ['Cartagena', 'Magangué', 'Turbaco', 'El Carmen'], stores: 32, products: 8500, description: 'Compara precios en Bolívar.' },
  { name: 'Santander', slug: 'santander', cities: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta'], stores: 35, products: 9500, description: 'Encuentra los mejores precios en Santander.' },
];

const BRANDS_DB = [
  { name: 'Diana', slug: 'diana', products: 45, categories: ['Despensa'], country: 'Colombia', description: 'Arroz Diana, la marca líder en arroz de Colombia.' },
  { name: 'Colanta', slug: 'colanta', products: 120, categories: ['Lácteos', 'Despensa'], country: 'Colombia', description: 'Cooperativa colombiana de productos lácteos y alimentos.' },
  { name: 'Gourmet', slug: 'gourmet', products: 30, categories: ['Despensa'], country: 'Colombia', description: 'Aceites vegetales Gourmet de la Familia.' },
  { name: 'Bimbo', slug: 'bimbo', products: 80, categories: ['Panadería'], country: 'México', description: 'Pan Bimbo, frescura y calidad en cada rebanada.' },
  { name: 'MK', slug: 'mk', products: 60, categories: ['Medicamentos OTC'], country: 'Colombia', description: 'Medicamentos MK de Laboratorios MK.' },
  { name: 'Roa', slug: 'roa', products: 35, categories: ['Despensa'], country: 'Colombia', description: 'Arroz Roa, fortificado para tu familia.' },
  { name: 'Sello Rojo', slug: 'sello-rojo', products: 25, categories: ['Despensa', 'Bebidas'], country: 'Colombia', description: 'Café Sello Rojo 100% colombiano.' },
  { name: 'Coca-Cola', slug: 'coca-cola', products: 50, categories: ['Bebidas'], country: 'Estados Unidos', description: 'La gaseosa más famosa del mundo.' },
  { name: 'Rey', slug: 'rey', products: 20, categories: ['Aseo'], country: 'Colombia', description: 'Jabones y detergentes Rey.' },
  { name: 'FAB', slug: 'fab', products: 15, categories: ['Aseo'], country: 'Colombia', description: 'Detergente FAB, la limpieza que tu ropa merece.' },
  { name: 'Santa Reyes', slug: 'santa-reyes', products: 10, categories: ['Despensa'], country: 'Colombia', description: 'Huevos frescos Santa Reyes.' },
  { name: 'Familia', slug: 'familia', products: 40, categories: ['Aseo'], country: 'Colombia', description: 'Productos de higiene y cuidado familiar.' },
];

export async function getBrand(slug) { return BRANDS_DB.find(b => b.slug === slug) || null; }
export async function getAllBrands() { return BRANDS_DB; }
export async function getProductsByBrand(brandName) { const products = await getAllProducts(); return products.filter(p => p.brand?.toLowerCase() === brandName?.toLowerCase()); }
export async function getCity(slug) { return CITIES_DB.find(c => c.slug === slug) || null; }
export async function getAllCities() { return CITIES_DB; }
export async function getDepartment(slug) { return DEPARTMENTS_DB.find(d => d.slug === slug) || null; }
export async function getAllDepartments() { return DEPARTMENTS_DB; }

export { PRODUCT_DB, STORE_DB, CATEGORY_DB, BRANDS_DB, CITIES_DB, DEPARTMENTS_DB, slugify, buildPresentationInfo, expandSynonyms };
