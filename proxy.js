import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './lib/rate-limit';
import { csrfProtection } from './lib/csrf';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Exact-match public paths. NOTE: this must never contain a bare '/' -- since
// config.matcher already restricts this proxy to /api/:path*, '/' would never
// be matched as an exact path anyway, but pathname.startsWith('/') is true
// for every possible path, which previously made isPublic always true and
// silently disabled auth-gating for every single /api route.
const PUBLIC_EXACT_PATHS = new Set([
  '/api/health', '/api/products', '/api/search', '/api/stores', '/api/promotions',
  '/api/categories', '/api/brands', '/api/cities', '/api/departments', '/api/ai/suggest',
  '/api/quality/report', '/api/analytics/events', '/api/geo/nearby',
  '/api/observability/health', '/api/observability/metrics',
  '/api/scrapers/status', '/api/categories/products',
]);

// Genuine path-parameter prefixes (/api/products/[slug], etc.) -- each must
// be specific enough that it cannot accidentally swallow unrelated routes.
const PUBLIC_PREFIX_PATHS = ['/api/products/', '/api/stores/', '/api/barcode/'];

function isPublicPath(pathname) {
  return PUBLIC_EXACT_PATHS.has(pathname) || PUBLIC_PREFIX_PATHS.some(p => pathname.startsWith(p));
}

// /api/observability/dashboard backs the internal ops dashboard (scraper
// health, failure counts, job queues) -- not customer-facing, so it needs
// a real session rather than being fetchable by anyone who finds the URL.
const AUTH_REQUIRED_PATHS = [
  '/api/favorites', '/api/images/upload', '/api/images/', '/api/scrape', '/api/scrapers/trigger',
  '/api/observability/dashboard',
];

// Every route downstream trusts x-user-id/x-user-role as "this request was
// verified by the middleware". A client can set arbitrary headers on its own
// request, so those two must always be stripped from the inbound request
// before any auth check runs -- otherwise sending x-user-id: <anything>
// impersonates a verified user on any route that doesn't itself re-check the
// bearer token (this is how /api/scrapers/trigger used to be bypassable).
function stripSpoofableHeaders(request) {
  const headers = new Headers(request.headers);
  headers.delete('x-user-id');
  headers.delete('x-user-role');
  return headers;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const rl = rateLimit(request);
  if (rl.limited) {
    return new NextResponse(JSON.stringify({ success: false, error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  if (pathname.startsWith('/api')) {
    const csrfBlocked = csrfProtection(request);
    if (csrfBlocked) return csrfBlocked;
  }

  const isPublic = isPublicPath(pathname);
  const isAuthRequired = AUTH_REQUIRED_PATHS.some(p => pathname.startsWith(p));

  if (isPublic) return NextResponse.next({ request: { headers: stripSpoofableHeaders(request) } });

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
    const requestHeaders = stripSpoofableHeaders(request);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.app_metadata?.role || 'user');
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
          const requestHeaders = stripSpoofableHeaders(request);
          requestHeaders.set('x-user-id', user.id);
          requestHeaders.set('x-user-role', user.app_metadata?.role || 'user');
          return NextResponse.next({ request: { headers: requestHeaders } });
        }
      }
    }
    return NextResponse.next({ request: { headers: stripSpoofableHeaders(request) } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
