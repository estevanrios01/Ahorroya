import { NextResponse } from 'next/server';
import logger from './logger';

// For reference data that changes rarely (categories, cities, departments,
// brands) but was being re-fetched from the DB (or the live-fallback path)
// on every single request. A short shared cache means Vercel's CDN serves
// repeat requests without invoking the function at all, which matters both
// for latency and for keeping request volume against the free-tier DB down.
export function cachedJson(body, { maxAge = 120, staleWhileRevalidate = 600 } = {}) {
  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}` },
  });
}

// Wraps a Next.js route handler so an uncaught throw (bad JSON body, a
// downstream client throwing instead of returning {error}, etc.) returns a
// consistent 500 JSON response instead of Next's default HTML error page /
// leaking a stack trace to the client.
export function withErrorHandling(handler) {
  return async function wrapped(request, context) {
    try {
      return await handler(request, context);
    } catch (error) {
      await logger.error({ err: error?.message, path: request?.nextUrl?.pathname }, 'Unhandled API error');
      return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
  };
}
