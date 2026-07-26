import { NextResponse } from 'next/server';
import logger from './logger';

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
