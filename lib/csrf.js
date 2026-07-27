import { NextResponse } from 'next/server';

export const CRYPTO_KEY = process.env.CSRF_SECRET || 'ahorroya-csrf-secret-do-not-use-in-prod';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfProtection(request) {
  if (SAFE_METHODS.includes(request.method)) return null;
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!host) return null;
  // A missing Origin on a non-safe method is what a same-site plain-form
  // POST or a stripped-header request looks like -- treating it as "allowed"
  // defeated the whole check, since a cross-site request can just omit the
  // header. Browsers always set Origin for cross-origin fetch/XHR and for
  // any non-GET form submission, so a legitimate same-origin call already
  // has this header; only reject here.
  if (!origin) {
    return NextResponse.json({ success: false, error: 'CSRF: Origin requerido' }, { status: 403 });
  }
  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host || originUrl.hostname === 'localhost' || originUrl.hostname.endsWith('.vercel.app')) {
      return null;
    }
  } catch {
    return NextResponse.json({ success: false, error: 'CSRF: Invalid origin' }, { status: 403 });
  }
  return NextResponse.json({ success: false, error: 'CSRF: Origin not allowed' }, { status: 403 });
}
