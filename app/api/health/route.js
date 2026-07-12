import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../services/database';

function withTimeout(promise, ms = 1800) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('health timeout')), ms)),
  ]);
}

async function checkDatabase() {
  if (!supabaseAdmin) return { status: 'not_configured', latencyMs: null };
  const started = Date.now();
  try {
    const { error } = await withTimeout(
      supabaseAdmin.from('master_products').select('id', { count: 'planned', head: true }).limit(1)
    );
    return {
      status: error ? 'degraded' : 'healthy',
      latencyMs: Date.now() - started,
      error: error?.message || null,
    };
  } catch (error) {
    return { status: 'degraded', latencyMs: Date.now() - started, error: error.message };
  }
}

export async function GET() {
  const database = await checkDatabase();
  const status = database.status === 'healthy' ? 'healthy' : 'degraded';
  return NextResponse.json({
    success: true,
    data: {
      status,
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: { api: 'running', database, search: 'ready' },
    },
  });
}
