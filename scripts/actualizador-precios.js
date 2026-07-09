import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const estandarizarOrtografia = (texto) => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
};

async function extraerPreciosSimulados() {
  console.log('Iniciando extracción de precios (Worker Básico)...');

  const htmlSimulado = `
    <div class="product-list">
      <div class="item" data-price="4200" data-store="almacenes éxito">arroz diana premium 1kg</div>
      <div class="item" data-price="3800" data-store="tiendas d1">arroz roa fortificado 1kg</div>
      <div class="item" data-price="12500" data-store="supermercados olímpica">aceite gourmet familia 1000ml</div>
      <div class="item" data-price="11800" data-store="tiendas ara">aceite vegetal de girasol</div>
    </div>
  `;

  const $ = cheerio.load(htmlSimulado);
  const datosExtraidos = [];

  $('.item').each((_, elemento) => {
    const nombreCrudo = $(elemento).text();
    const precioCrudo = $(elemento).attr('data-price');
    const tiendaCruda = $(elemento).attr('data-store');

    datosExtraidos.push({
      producto_nombre: estandarizarOrtografia(nombreCrudo),
      cadena_nombre: estandarizarOrtografia(tiendaCruda),
      precio_normal: parseInt(precioCrudo, 10),
      origen_dato: 'Worker Automático'
    });
  });

  console.log(`Se extrajeron ${datosExtraidos.length} productos. Normalizando e inyectando a BD...`);

  let insertados = 0;

  for (const item of datosExtraidos) {
    try {
      const { error } = await supabase
        .from('precios')
        .upsert(
          {
            producto_id: item.producto_nombre,
            establecimiento_id: item.cadena_nombre,
            precio_normal: item.precio_normal,
            origen_dato: item.origen_dato,
            fecha_deteccion: new Date().toISOString()
          },
          { onConflict: 'producto_id, establecimiento_id' }
        );

      if (error) {
        console.error(`Error guardando [${item.producto_nombre}]:`, error.message);
      } else {
        insertados++;
        console.log(`✓ Registrado: ${item.producto_nombre} en ${item.cadena_nombre} a $${item.precio_normal}`);
      }
    } catch (err) {
      console.error('Excepción al conectar con Supabase:', err);
    }
  }

  console.log(`Proceso finalizado. ${insertados}/${datosExtraidos.length} actualizados exitosamente.`);
}

extraerPreciosSimulados();
