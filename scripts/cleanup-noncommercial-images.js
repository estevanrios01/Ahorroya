const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    process.env[line.slice(0, index).trim()] ||= line.slice(index + 1).trim();
  }
}

loadEnv();

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAGE_SIZE = 1000;
const DELETE_BATCH = 100;

if (!BASE_URL || !SERVICE_KEY) throw new Error('Faltan variables de Supabase');

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

function isNonCommercial(url) {
  return /unsplash\.com|pexels\.com|placehold\.co|placehold\.it|placeholder/i.test(String(url || ''));
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}/rest/v1/${endpoint}`, { headers, ...options });
  const text = await response.text();
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${endpoint}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

const KNOWN_GENERIC_URLS = [
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
];

async function fetchKnownGenericImages() {
  const rows = [];
  for (const url of KNOWN_GENERIC_URLS) {
    const encoded = encodeURIComponent(url);
    const batch = await request(`product_images?select=id,master_product_id,url,created_at&url=eq.${encoded}&limit=1000`);
    rows.push(...batch);
  }
  return rows;
}

async function deleteRows(rows) {
  for (let i = 0; i < rows.length; i += DELETE_BATCH) {
    const ids = rows.slice(i, i + DELETE_BATCH).map((row) => row.id).join(',');
    await request(`product_images?id=in.(${ids})`, { method: 'DELETE' });
    console.log(`Imagenes no comerciales eliminadas: ${Math.min(i + DELETE_BATCH, rows.length)}/${rows.length}`);
  }
}

async function updateMasterImages(byProduct) {
  const updates = [];
  for (const [productId, info] of byProduct) {
    if (!info.currentImage || !isNonCommercial(info.currentImage)) continue;
    updates.push({ id: productId, image: info.realImage || null, updated_at: new Date().toISOString() });
  }

  for (let i = 0; i < updates.length; i += 25) {
    await Promise.all(updates.slice(i, i + 25).map(({ id, ...payload }) =>
      request(`master_products?id=eq.${id}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(payload) })
    ));
    console.log(`Imagen principal corregida: ${Math.min(i + 25, updates.length)}/${updates.length}`);
  }
  return updates;
}

async function main() {
  const images = await fetchKnownGenericImages();
  const nonCommercial = images.filter((image) => isNonCommercial(image.url));
  const byProduct = new Map();

  for (const image of images) {
    const info = byProduct.get(image.master_product_id) || { currentImage: null, realImage: null };
    if (isNonCommercial(image.url)) {
      if (!info.currentImage) info.currentImage = image.url;
    } else if (!info.realImage) {
      info.realImage = image.url;
    }
    byProduct.set(image.master_product_id, info);
  }

  const productIds = [...byProduct.keys()];
  for (let i = 0; i < productIds.length; i += DELETE_BATCH) {
    const ids = productIds.slice(i, i + DELETE_BATCH).join(',');
    const [products, productImages] = await Promise.all([
      request(`master_products?id=in.(${ids})&select=id,image`),
      request(`product_images?master_product_id=in.(${ids})&select=master_product_id,url&limit=1000`),
    ]);
    for (const image of productImages) {
      const info = byProduct.get(image.master_product_id);
      if (info && !isNonCommercial(image.url) && !info.realImage) info.realImage = image.url;
    }
    for (const product of products) {
      const info = byProduct.get(product.id);
      if (info && !info.currentImage && isNonCommercial(product.image)) info.currentImage = product.image;
    }
  }

  const updated = await updateMasterImages(byProduct);
  await deleteRows(nonCommercial);

  console.log(JSON.stringify({
    scannedImages: images.length,
    nonCommercialRemoved: nonCommercial.length,
    masterProductsCorrected: updated.length,
    productsAssignedRealImage: updated.filter((row) => row.image).length,
    productsClearedImage: updated.filter((row) => !row.image).length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
