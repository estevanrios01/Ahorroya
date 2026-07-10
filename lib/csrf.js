import { NextResponse } from 'next/server';

export const CRYPTO_KEY = process.env.CSRF_SECRET || 'ahorroya-csrf-secret-do-not-use-in-prod';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfProtection(request) {
  if (SAFE_METHODS.includes(request.method)) return null;
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return null;
  try {
    const originUrl = new URL(origin);
    if (originUrl.hostname === host || originUrl.hostname === 'localhost' || originUrl.hostname.endsWith('.vercel.app')) {
      return null;
    }
  } catch {
    return NextResponse.json({ success: false, error: 'CSRF: Invalid origin' }, { status: 403 });
  }
  return NextResponse.json({ success: false, error: 'CSRF: Origin not allowed' }, { status: 403 });
}
