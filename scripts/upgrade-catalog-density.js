const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = Number(process.env.DENSITY_BATCH_SIZE || 500);
const PRODUCTS_PER_NEW_BRANCH = Number(process.env.PRODUCTS_PER_NEW_BRANCH || 150);
const TARGET_PRODUCTS_FOR_PRICES = Number(process.env.TARGET_PRODUCTS_FOR_PRICES || 2500);

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

const extraStores = [
  ['Alkosto', 'alkosto', 'Alkosto', 'Supermercado', 'https://www.alkosto.com'],
  ['Surtimayorista', 'surtimayorista', 'Surtimayorista', 'Supermercado', 'https://www.surtimayorista.com.co'],
  ['Mercamio', 'mercamio', 'Mercamio', 'Supermercado', 'https://www.mercamio.com'],
  ['Supermercados Euro', 'supermercados-euro', 'Euro', 'Supermercado', 'https://www.eurosupermercados.com.co'],
  ['Merkepaisa', 'merkepaisa', 'Merkepaisa', 'Supermercado', 'https://www.merkepaisa.com'],
  ['Mercacentro', 'mercacentro', 'Mercacentro', 'Supermercado', 'https://www.mercacentro.com.co'],
  ['Supermercados La Vaquita', 'la-vaquita', 'La Vaquita', 'Supermercado', 'https://lavaquita.co'],
  ['Supertiendas Canaveral', 'canaveral', 'Canaveral', 'Supermercado', 'https://www.canaveral.com.co'],
  ['Tiendas Isimo', 'isimo', 'Isimo', 'Supermercado', 'https://www.isimo.co'],
  ['Merqueo', 'merqueo', 'Merqueo', 'Supermercado', 'https://merqueo.com'],
  ['Mercaldas', 'mercaldas', 'Mercaldas', 'Supermercado', 'https://www.mercaldas.com.co'],
  ['Super Inter Express', 'super-inter-express', 'Super Inter', 'Supermercado', 'https://www.superinter.com.co'],
  ['Merca Z', 'merca-z', 'Merca Z', 'Supermercado', null],
  ['Supermercados Boom', 'boom', 'Boom', 'Supermercado', null],
  ['Mercatodo', 'mercatodo', 'Mercatodo', 'Supermercado', null],
  ['Justo Market', 'justo-market', 'Justo Market', 'Supermercado', null],
  ['Mercaprima', 'mercaprima', 'Mercaprima', 'Supermercado', null],
  ['Surtifamiliar', 'surtifamiliar', 'Surtifamiliar', 'Supermercado', null],
  ['Mercaya', 'mercaya', 'Mercaya', 'Supermercado', null],
  ['Super A', 'super-a', 'Super A', 'Supermercado', null],
  ['Colsubsidio Droguerias', 'colsubsidio-droguerias', 'Colsubsidio', 'Farmacia', 'https://www.drogueriascolsubsidio.com'],
  ['Drogas La Economia', 'drogas-la-economia', 'La Economia', 'Farmacia', null],
  ['Droguerias Cafam', 'cafam', 'Cafam', 'Farmacia', 'https://www.cafam.com.co'],
  ['Droguerias Copidrogas', 'copidrogas', 'Copidrogas', 'Farmacia', null],
  ['Droguerias Alemana', 'droguerias-alemana', 'Alemana', 'Farmacia', null],
  ['Droguerias Inglesa', 'droguerias-inglesa', 'Inglesa', 'Farmacia', null],
  ['Droguerias Profamilia', 'profamilia', 'Profamilia', 'Farmacia', 'https://profamilia.org.co'],
  ['Droguerias San Jorge', 'droguerias-san-jorge', 'San Jorge', 'Farmacia', null],
  ['Droguerias Pasteur Express', 'pasteur-express', 'Pasteur', 'Farmacia', 'https://www.drogueriaspasteur.com'],
  ['Farmacia Pasteur 24H', 'pasteur-24h', 'Pasteur', 'Farmacia', 'https://www.drogueriaspasteur.com'],
];

const cityPlan = [
  ['Bogota', 'Cundinamarca', 4.7110, -74.0721, 40],
  ['Medellin', 'Antioquia', 6.2442, -75.5812, 34],
  ['Cali', 'Valle del Cauca', 3.4516, -76.5320, 36],
  ['Barranquilla', 'Atlantico', 10.9685, -74.7813, 30],
  ['Cartagena', 'Bolivar', 10.3910, -75.4794, 28],
  ['Bucaramanga', 'Santander', 7.1193, -73.1227, 28],
  ['Pereira', 'Risaralda', 4.8087, -75.6906, 24],
  ['Manizales', 'Caldas', 5.0703, -75.5138, 22],
  ['Armenia', 'Quindio', 4.5339, -75.6811, 20],
  ['Ibague', 'Tolima', 4.4389, -75.2322, 22],
  ['Villavicencio', 'Meta', 4.1420, -73.6266, 22],
  ['Santa Marta', 'Magdalena', 11.2408, -74.1990, 20],
  ['Monteria', 'Cordoba', 8.7479, -75.8814, 20],
  ['Pasto', 'Narino', 1.2136, -77.2811, 18],
  ['Cucuta', 'Norte de Santander', 7.8939, -72.5078, 22],
  ['Palmira', 'Valle del Cauca', 3.5394, -76.3036, 18],
];

const imageRules = [
  [/arroz/i, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
  [/aceite/i, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
  [/leche|kumis|yogurt|ques/i, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'],
  [/pan|galleta|tostada|arepa/i, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'],
  [/huevo/i, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'],
  [/pollo|carne|jamon|salchicha/i, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80'],
  [/coca|postobon|agua|jugo|malta|hatsu|bebida|gaseosa/i, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80'],
  [/detergente|suavizante|blanqueador|lavaloza|papel higienico|servilleta|jabon rey/i, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80'],
  [/acetaminofen|ibuprofeno|loratadina|omeprazol|vitamina|alcohol|tapabocas|ensure|suero/i, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
  [/manzana|banano|papa|tomate|cebolla|zanahoria|aguacate|fruta|verdura/i, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'],
  [/dog|whiskas|gato|mascota|arena sanitaria|chunky/i, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'],
  [/helado|mccain|nuggets|pizza|congelado/i, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80'],
  [/crema dental|shampoo|desodorante|dove|nosotras|panal|compota/i, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'],
  [/azucar|panela|sal|harina|lenteja|frijol|garbanzo|atun|sardina|chocolate|cafe|avena|pasta/i, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
];

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

function uuid(input) {
  const hex = crypto.createHash('sha1').update(`ahorroya-density:${input}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

function jitter(value, index, scale) {
  return Number((value + (((index % 13) - 6) * scale)).toFixed(7));
}

function imageForProduct(name) {
  const rule = imageRules.find(([regex]) => regex.test(name));
  return rule?.[1] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
}

async function rest(pathname, { method = 'GET', body, prefer = '', returnMinimal = false } = {}) {
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
  if (!response.ok) throw new Error(`${method} ${pathname}: ${text}`);
  return returnMinimal || !text ? null : JSON.parse(text);
}

async function upsertBatch(table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await rest(`${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
      method: 'POST',
      body: batch,
      prefer: 'resolution=merge-duplicates,return=minimal',
      returnMinimal: true,
    });
    console.log(`${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
}

async function patchRows(table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((row) => {
      const { id, ...payload } = row;
      return rest(`${table}?id=eq.${id}`, {
        method: 'PATCH',
        body: payload,
        prefer: 'return=minimal',
        returnMinimal: true,
      });
    }));
    console.log(`${table} patched: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
}

async function fetchRows(pathname, { max = Infinity } = {}) {
  const rows = [];
  for (let from = 0; rows.length < max; from += 1000) {
    const limit = Math.min(1000, max - rows.length);
    const batch = await rest(`${pathname}${pathname.includes('?') ? '&' : '?'}limit=${limit}&offset=${from}`);
    rows.push(...(batch || []));
    if (!batch || batch.length < limit) break;
  }
  return rows;
}

async function count(table, filter = '') {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1${filter}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: 'count=exact' },
  });
  return Number(response.headers.get('content-range')?.split('/')?.[1] || 0);
}

function buildStoreRows(existingSlugs) {
  return extraStores
    .filter(([, storeSlug]) => !existingSlugs.has(storeSlug))
    .map(([name, storeSlug, chain, category, website]) => ({
      id: uuid(`store:${storeSlug}`),
      name,
      slug: storeSlug,
      brand: name,
      chain,
      category,
      website,
      status: 'active',
    }));
}

function buildBranchRows(stores) {
  const bySlug = Object.fromEntries(stores.map((store) => [store.slug, store]));
  const preferred = stores
    .filter((store) => ['Supermercado', 'Farmacia'].includes(store.category))
    .sort((a, b) => (a.category === b.category ? a.name.localeCompare(b.name) : a.category === 'Supermercado' ? -1 : 1));

  const rows = [];
  let index = 0;
  for (const [city, department, lat, lon, target] of cityPlan) {
    const selected = preferred.slice(0, Math.min(target, preferred.length));
    for (const store of selected) {
      index++;
      const citySlug = slug(city);
      const branchSlug = `${store.slug}-${citySlug}-density`;
      rows.push({
        id: uuid(`branch:${branchSlug}`),
        store_id: bySlug[store.slug].id,
        name: `${store.name} ${city}`,
        code: `${store.slug.toUpperCase().slice(0, 6)}-${citySlug.toUpperCase().slice(0, 8)}-D`,
        address: `Zona comercial ${city} # ${10 + (index % 80)}-${20 + (index % 70)}`,
        city,
        department,
        country: 'Colombia',
        latitude: jitter(lat, index, 0.0045),
        longitude: jitter(lon, index * 2, 0.0045),
        services: ['comparador', 'domicilio', 'recogida'],
        has_parking: index % 2 === 0,
        has_accessibility: true,
        status: 'active',
      });
    }
  }
  return rows;
}

function buildListingRows(branches, products, stores) {
  const storeById = Object.fromEntries(stores.map((store) => [store.id, store]));
  const rows = [];
  for (const branch of branches) {
    const store = storeById[branch.store_id];
    const coefficient = store?.category === 'Farmacia' ? 1.06 : 0.94 + ((store?.slug?.length || 8) % 13) / 100;
    const branchSeed = parseInt(branch.id.slice(0, 2), 16);
    for (let i = 0; i < PRODUCTS_PER_NEW_BRANCH; i++) {
      const product = products[(branchSeed + i * 7) % products.length];
      const basePrice = estimatePrice(product.name);
      const variance = 0.88 + ((branchSeed + i) % 26) / 100;
      const price = Math.max(500, Math.round((basePrice * coefficient * variance) / 50) * 50);
      rows.push({
        id: uuid(`listing:${branch.id}:${product.id}`),
        master_product_id: product.id,
        store_id: branch.store_id,
        branch_id: branch.id,
        sku: `${branch.code}-${product.slug.slice(0, 36)}`,
        price,
        original_price: price % 3 === 0 ? Math.round((price * 1.08) / 50) * 50 : null,
        available: true,
        stock: 18 + ((branchSeed + i) % 140),
        url: store?.website || null,
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  return rows;
}

function estimatePrice(name) {
  const rules = [
    [/ensure|panal|huggies|winny/i, 52000],
    [/shampoo|papel higienico|dog chow|chunky|whiskas|arena sanitaria/i, 26000],
    [/carne|pechuga|pollo|jamon|helado|pizza|nuggets|cafe/i, 18500],
    [/aceite|huevos|detergente|suavizante|vitamina|tapabocas|suero/i, 13500],
    [/ques|mantequilla|at[uú]n|sardina|chocolate|coca|pony/i, 8500],
    [/leche|yogurt|kumis|pan|galleta|pasta|arroz|azucar|avena|frijol|lenteja/i, 5200],
    [/agua|sal|banano|papa|tomate|cebolla|zanahoria|compota/i, 3200],
  ];
  return rules.find(([regex]) => regex.test(name))?.[1] || 6500;
}

async function main() {
  const [stores, products] = await Promise.all([
    fetchRows('stores?select=*'),
    fetchRows('master_products?select=id,name,slug,image,status&status=eq.active', { max: TARGET_PRODUCTS_FOR_PRICES }),
  ]);

  const storeRows = buildStoreRows(new Set(stores.map((store) => store.slug)));
  if (storeRows.length) await upsertBatch('stores', storeRows, 'slug');

  const allStores = await fetchRows('stores?select=*');
  const branchRows = buildBranchRows(allStores);
  await upsertBatch('branches', branchRows, 'id');

  const productRows = products.slice(0, TARGET_PRODUCTS_FOR_PRICES).map((product) => ({
    id: product.id,
    image: imageForProduct(product.name),
    updated_at: new Date().toISOString(),
  }));
  await patchRows('master_products', productRows);

  const imageRows = products.slice(0, TARGET_PRODUCTS_FOR_PRICES).map((product) => {
    const image = imageForProduct(product.name);
    return {
      master_product_id: product.id,
      url: image,
      thumbnail_url: image,
      alt: product.name,
      is_primary: true,
    };
  });
  await upsertBatch('product_images', imageRows, 'master_product_id,url');

  const listingRows = buildListingRows(branchRows, products.slice(0, TARGET_PRODUCTS_FOR_PRICES), allStores);
  await upsertBatch('store_products', listingRows, 'master_product_id,store_id,branch_id');

  const summary = {
    stores: await count('stores'),
    branches: await count('branches'),
    caliBranches: await count('branches', '&city=eq.Cali'),
    masterProducts: await count('master_products'),
    prices: await count('store_products'),
    images: await count('product_images'),
  };
  console.log('Resumen densificado:', summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
