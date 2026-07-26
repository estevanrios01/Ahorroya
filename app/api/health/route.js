import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../services/database';
import { withErrorHandling } from '../../../lib/api-handler';
import { withTimeout } from '../../../services/fallbackCatalog';

async function checkDatabase() {
  if (!supabaseAdmin) return { status: 'not_configured', latencyMs: null };
  const started = Date.now();
  try {
    const { error } = await withTimeout(
      supabaseAdmin.from('master_products').select('id', { count: 'planned', head: true }).limit(1),
      1800,
      'health timeout'
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

async function handleGet() {
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

export const GET = withErrorHandling(handleGet);
