import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PUBLIC_PATHS = [
  '/', '/api/health', '/api/products', '/api/products/', '/api/search', '/api/stores',
  '/api/stores/', '/api/promotions', '/api/categories', '/api/brands', '/api/cities',
  '/api/departments', '/api/barcode/', '/api/ai/suggest', '/api/quality/report',
  '/api/analytics/events', '/api/geo/nearby',
];

const AUTH_REQUIRED_PATHS = [
  '/api/favorites', '/api/images/upload', '/api/images/', '/api/scrape',
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const rl = rateLimit(request);
  if (rl.limited) {
    return new NextResponse(JSON.stringify({ success: false, error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
  const isAuthRequired = AUTH_REQUIRED_PATHS.some(p => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  if (pathname.startsWith('/api') && isAuthRequired) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Autenticación requerida' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: false, error: 'Configuración de autenticación no disponible' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.user_metadata?.role || 'user');
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname.startsWith('/api')) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        });
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', user.id);
          requestHeaders.set('x-user-role', user.user_metadata?.role || 'user');
          return NextResponse.next({ request: { headers: requestHeaders } });
        }
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
