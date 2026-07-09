import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta el parámetro de búsqueda' }, { status: 400 });
  }

  try {
    // Estructura base del scraper web.
    // Aquí se inyectaría la URL objetivo: const targetUrl = `https://tienda.com/buscar?q=${query}`
    // const { data } = await axios.get(targetUrl);
    // const $ = cheerio.load(data);

    // Simulación de datos extraídos y normalizados del HTML
    const datosExtraidos = [
      {
        producto_nombre: 'Arroz Diana Premium',
        cadena_nombre: 'Almacenes Éxito',
        precio: 4200,
      },
      {
        producto_nombre: 'Arroz Roa Fortificado',
        cadena_nombre: 'Tiendas D1',
        precio: 3800,
      }
    ];

    // Inserción silenciosa en Supabase
    for (const item of datosExtraidos) {
      const { error } = await supabase
        .from('precios')
        .upsert({
          producto_id: item.producto_nombre,
          establecimiento_id: item.cadena_nombre,
          precio_normal: item.precio,
          origen_dato: 'Scraper Principal'
        }, { onConflict: 'producto_id, establecimiento_id' });

      if (error) console.error(`Error guardando ${item.producto_nombre}:`, error.message);
    }

    return NextResponse.json({ success: true, count: datosExtraidos.length, data: datosExtraidos });
  } catch (error) {
    console.error('Error en el motor de scraping:', error);
    return NextResponse.json({ success: false, error: 'Fallo en la extracción de datos' }, { status: 500 });
  }
}
